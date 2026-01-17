import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import yaml from 'js-yaml';
import { gitMutex } from '@/lib/gitMutex';

export const dynamic = 'force-dynamic';

export async function GET() {
  return await gitMutex.runExclusive(async () => {
      const repoDirName = 'manifest-repo-workdir';
      const repoPath = path.join(os.tmpdir(), repoDirName);
      const registryPath = path.join(repoPath, 'registry.json');
      
      const token = process.env.GITHUB_TOKEN;
      const repoUrl = process.env.MANIFEST_REPO_URL;
      
      // Default jika repo belum ada
      if (!repoUrl || !token) {
        return NextResponse.json({ nextId: "001" });
      }

      try {
        // 1. Setup Git (Clone/Pull) untuk memastikan data terbaru
        const authenticatedUrl = repoUrl.replace("https://", `https://${token}@`);

        if (!fs.existsSync(repoPath)) {
            execSync(`git clone ${authenticatedUrl} ${repoPath}`);
        } else {
            try {
              execSync(`git fetch origin`, { cwd: repoPath });
              execSync(`git reset --hard origin/main`, { cwd: repoPath });
            } catch (e) {
              // Re-clone jika corrupt
              fs.rmSync(repoPath, { recursive: true, force: true });
              execSync(`git clone ${authenticatedUrl} ${repoPath}`);
            }
        }

        // 2. Baca registry.json
        let registry = [];
        if (fs.existsSync(registryPath)) {
            const content = fs.readFileSync(registryPath, 'utf8');
            registry = JSON.parse(content);
        }

        // 3. Enrich Registry with Real Ingress Data
        const enrichedRegistry = registry.map(app => {
            const prodValuesPath = path.join(repoPath, 'apps', `${app.name}-prod`, 'values.yaml');
            const testValuesPath = path.join(repoPath, 'apps', `${app.name}-testing`, 'values.yaml');
            
            let prodHost = null;
            let testHost = null;

            // Read Prod
            if (fs.existsSync(prodValuesPath)) {
                try {
                    const doc = yaml.load(fs.readFileSync(prodValuesPath, 'utf8'));
                    if (doc.ingress && doc.ingress.enabled && doc.ingress.hosts && doc.ingress.hosts.length > 0) {
                        prodHost = doc.ingress.hosts[0].host;
                    }
                } catch (e) { console.warn(`Failed to read prod values for ${app.name}`, e); }
            }

            // Read Testing
            if (fs.existsSync(testValuesPath)) {
                try {
                    const doc = yaml.load(fs.readFileSync(testValuesPath, 'utf8'));
                    if (doc.ingress && doc.ingress.enabled && doc.ingress.hosts && doc.ingress.hosts.length > 0) {
                        testHost = doc.ingress.hosts[0].host;
                    }
                } catch (e) { console.warn(`Failed to read test values for ${app.name}`, e); }
            }

            return {
                ...app,
                liveIngressProd: prodHost,
                liveIngressTest: testHost
            };
        });

        // 4. Cari ID Maksimal
        let maxId = 0;
        enrichedRegistry.forEach(app => {
            const idNum = parseInt(app.id);
            if (!isNaN(idNum) && idNum > maxId) {
                maxId = idNum;
            }
        });

        const nextId = String(maxId + 1).padStart(3, '0');
        return NextResponse.json({ nextId, registry: enrichedRegistry });

      } catch (error) {
        console.error("Error in next-id:", error);
        // Fallback jika gagal
        return NextResponse.json({ nextId: "001", error: error.message });
      }
  });
}
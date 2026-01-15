import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const dynamic = 'force-dynamic';

export async function GET() {
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

     // 3. Cari ID Maksimal
     let maxId = 0;
     registry.forEach(app => {
        const idNum = parseInt(app.id);
        if (!isNaN(idNum) && idNum > maxId) {
            maxId = idNum;
        }
     });

     const nextId = String(maxId + 1).padStart(3, '0');
     return NextResponse.json({ nextId, registry });

  } catch (error) {
    console.error("Error in next-id:", error);
    // Fallback jika gagal
    return NextResponse.json({ nextId: "001", error: error.message });
  }
}
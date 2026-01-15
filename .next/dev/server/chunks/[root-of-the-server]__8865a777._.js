module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/child_process [external] (child_process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("child_process", () => require("child_process"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[project]/src/app/api/manifest/generate/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/child_process [external] (child_process, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/os [external] (os, cjs)");
;
;
;
;
;
async function POST(req) {
    const data = await req.json();
    // Cloud-Native Path: Use OS temp dir or a specific app folder
    // In Docker/K8s, this will be inside the container ephemeral storage
    const repoDirName = 'manifest-repo-workdir';
    const repoPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__["default"].tmpdir(), repoDirName);
    const token = process.env.GITHUB_TOKEN;
    const repoUrl = process.env.MANIFEST_REPO_URL;
    const userName = process.env.GIT_USER_NAME || "Naratel DevOps Dashboard";
    const userEmail = process.env.GIT_USER_EMAIL || "devops@naratel.com";
    if (!repoUrl || !token) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Configuration Error: MANIFEST_REPO_URL or GITHUB_TOKEN is missing."
        }, {
            status: 500
        });
    }
    // Helper to mask token in logs
    const maskToken = (url)=>url.replace(token, '*****');
    try {
        // 0. Setup Repository (Clone or Pull)
        const authenticatedUrl = repoUrl.replace("https://", `https://${token}@`);
        if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(repoPath)) {
            console.log(`Cloning repository to ${repoPath}...`);
            // Clone if doesn't exist
            (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execSync"])(`git clone ${authenticatedUrl} ${repoPath}`);
            // Set Identity after clone
            (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execSync"])(`git config user.name "${userName}"`, {
                cwd: repoPath
            });
            (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execSync"])(`git config user.email "${userEmail}"`, {
                cwd: repoPath
            });
        } else {
            console.log(`Updating repository at ${repoPath}...`);
            // Pull if exists (reset to origin/main to avoid conflicts from previous messy runs)
            try {
                // Reset hard to ensure clean state matching remote
                (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execSync"])(`git fetch origin`, {
                    cwd: repoPath
                });
                (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execSync"])(`git reset --hard origin/main`, {
                    cwd: repoPath
                });
            } catch (e) {
                console.warn("Git pull/reset failed, attempting to re-clone...", e.message);
                __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].rmSync(repoPath, {
                    recursive: true,
                    force: true
                });
                (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execSync"])(`git clone ${authenticatedUrl} ${repoPath}`);
                (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execSync"])(`git config user.name "${userName}"`, {
                    cwd: repoPath
                });
                (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execSync"])(`git config user.email "${userEmail}"`, {
                    cwd: repoPath
                });
            }
        }
    } catch (error) {
        console.error("Git Setup Failed:", error.message);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to initialize git repository: " + error.message
        }, {
            status: 500
        });
    }
    const generatedFolders = [];
    const errors = [];
    // Helper to create manifest
    const createManifest = (folderName, env, config, type = 'app')=>{
        const targetFolder = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(repoPath, 'apps', folderName);
        const filePath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(targetFolder, 'values.yaml');
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(targetFolder)) {
            errors.push(`Folder ${folderName} already exists!`);
            return;
        }
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].mkdirSync(targetFolder, {
            recursive: true
        });
        // Construct Secret Data
        const secretDataObj = {};
        // Add custom user secrets
        if (data.secrets && Array.isArray(data.secrets)) {
            data.secrets.forEach((s)=>{
                if (s.key && s.value) secretDataObj[s.key] = s.value;
            });
        }
        // Add DB secrets if applicable
        if (data.useDb) {
            secretDataObj["DB_HOST"] = `svc-${data.appName}-db-${data.nextId}`; // Assumes svc name convention
            secretDataObj["DB_PORT"] = "5432";
            secretDataObj["DB_USER"] = "postgres";
            secretDataObj["DB_PASSWORD"] = data.dbPassword;
            secretDataObj["DB_NAME"] = data.dbName;
        }
        secretDataObj["PORT"] = config.targetPort?.toString() || "3000";
        // Convert secret obj to YAML string lines
        const secretDataYaml = Object.entries(secretDataObj).map(([k, v])=>`  ${k}: "${v}"`).join('\n');
        let yamlContent = "";
        if (type === 'app') {
            yamlContent = `
namespace: ${env}
controllerType: Deployment
app:
  id: "${data.nextId}"
  name: "${config.name}"
  env: "${env}"
image:
  repository: "${config.imageRepo}"
  tag: "${config.imageTag}"
service:
  port: ${config.port}
  targetPort: ${config.targetPort}
secretData:
${secretDataYaml}
`.trim();
        } else if (type === 'db') {
            // DB Manifest Template (Simplified based on assumption)
            yamlContent = `
namespace: ${env}
controllerType: StatefulSet
app:
  id: "${data.nextId}"
  name: "${data.appName}-db"
  env: "${env}"
image:
  repository: "postgres"
  tag: "15-alpine"
service:
  port: 5432
  targetPort: 5432
secretData:
  POSTGRES_DB: "${data.dbName}"
  POSTGRES_USER: "postgres"
  POSTGRES_PASSWORD: "${data.dbPassword}"
`.trim();
        }
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(filePath, yamlContent);
        // Encrypt
        try {
            (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execSync"])(`sops --encrypt --age ${process.env.SOPS_AGE_PUBKEY} --encrypted-regex '^(secretData)$' --in-place ${filePath}`, {
                cwd: repoPath
            });
            generatedFolders.push(folderName);
        } catch (e) {
            errors.push(`Encryption failed for ${folderName}: ${e.message}`);
        }
    };
    try {
        const envs = [
            'testing',
            'prod'
        ];
        // 1. Generate App Manifests
        if (data.isMicroservice && data.microservices?.length > 0) {
            // Microservices Mode
            for (const svc of data.microservices){
                for (const env of envs){
                    const folderName = `${data.appName}-${svc.name}-${env}`;
                    createManifest(folderName, env, {
                        name: `${data.appName}-${svc.name}`,
                        imageRepo: svc.imageRepo,
                        imageTag: svc.imageTag,
                        port: svc.port,
                        targetPort: svc.targetPort
                    }, 'app');
                }
            }
        } else {
            // Monolith Mode
            for (const env of envs){
                const folderName = `${data.appName}-${env}`;
                createManifest(folderName, env, {
                    name: data.appName,
                    imageRepo: data.imageRepo,
                    imageTag: data.imageTag,
                    port: data.port,
                    targetPort: data.targetPort
                }, 'app');
            }
        }
        // 2. Generate DB Manifests (if enabled)
        if (data.useDb) {
            for (const env of envs){
                const folderName = `${data.appName}-db-${env}`;
                createManifest(folderName, env, {}, 'db');
            }
        }
        if (errors.length > 0) {
            // If there were errors but some folders were created, we might want to clean up or just report partial success.
            // For now, fail if any error occurred.
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: errors.join(', '),
                generated: generatedFolders
            }, {
                status: 400
            });
        }
        if (generatedFolders.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "No manifests were generated."
            }, {
                status: 400
            });
        }
        // 3. Git Automation
        try {
            const commitMsg = `feat: add manifests for ${data.appName} (${generatedFolders.length} items) ID: ${data.nextId}`;
            // Execute git commands
            // Ensure we are adding ONLY the new files to avoid adding random temp files
            (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execSync"])(`git add .`, {
                cwd: repoPath
            });
            (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execSync"])(`git commit -m "${commitMsg}"`, {
                cwd: repoPath
            });
            (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execSync"])(`git push origin main`, {
                cwd: repoPath
            });
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: `Success! Generated ${generatedFolders.length} manifests and pushed to Git: ${generatedFolders.join(', ')}`,
                folders: generatedFolders
            });
        } catch (gitError) {
            console.error("Git automation failed:", gitError);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: `Manifests generated but Git push failed: ${gitError.message}`,
                generated: generatedFolders
            }, {
                status: 500
            });
        }
    } catch (error) {
        console.error(error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__8865a777._.js.map
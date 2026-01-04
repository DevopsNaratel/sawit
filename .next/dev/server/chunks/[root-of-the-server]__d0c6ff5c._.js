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
"[project]/apps/prod-approval-gateway/src/app/api/jenkins/pending/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$prod$2d$approval$2d$gateway$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/prod-approval-gateway/node_modules/next/server.js [app-route] (ecmascript)");
;
async function GET() {
    const { JENKINS_URL, JENKINS_USER, JENKINS_API_TOKEN } = process.env;
    if (!JENKINS_URL || !JENKINS_USER || !JENKINS_API_TOKEN) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$prod$2d$approval$2d$gateway$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Konfigurasi Jenkins tidak lengkap di ENV'
        }, {
            status: 500
        });
    }
    const auth = Buffer.from(`${JENKINS_USER}:${JENKINS_API_TOKEN}`).toString('base64');
    try {
        // 1. Fetch daftar semua jobs dari Jenkins secara otomatis
        const jobsResponse = await fetch(`${JENKINS_URL}/api/json`, {
            headers: {
                'Authorization': `Basic ${auth}`
            },
            cache: 'no-store'
        });
        if (!jobsResponse.ok) {
            throw new Error(`Gagal fetch daftar jobs: ${jobsResponse.statusText}`);
        }
        const jenkinsData = await jobsResponse.json();
        const jobs = jenkinsData.jobs || [];
        if (jobs.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$prod$2d$approval$2d$gateway$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: 'Tidak ada job ditemukan di Jenkins'
            });
        }
        // 2. Extract nama job dari setiap item
        const jobNames = jobs.map((job)=>job.name);
        console.log('Total jobs ditemukan:', jobNames.length);
        console.log('Jobs:', jobNames);
        // 3. Fetch data dari SEMUA job secara Paralel (Promise.all)
        const promises = jobNames.map(async (jobName)=>{
            try {
                const res = await fetch(`${JENKINS_URL}/job/${jobName}/wfapi/runs`, {
                    headers: {
                        'Authorization': `Basic ${auth}`
                    },
                    cache: 'no-store'
                });
                if (!res.ok) {
                    console.log(`Job ${jobName}: HTTP ${res.status}`);
                    return [];
                }
                const runs = await res.json();
                console.log(`Job ${jobName}: ${runs.length} runs ditemukan`);
                // Filter & Map data
                const pending = runs.filter((run)=>{
                    console.log(`  - Run ${run.id}: status = ${run.status}`);
                    return run.status === 'PAUSED_PENDING_INPUT';
                }).map((run)=>({
                        id: run.id,
                        name: run.name,
                        status: run.status,
                        timestamp: run.startTimeMillis,
                        jobName: jobName
                    }));
                if (pending.length > 0) {
                    console.log(`Job ${jobName}: ${pending.length} pending approval ditemukan!`);
                }
                return pending;
            } catch (err) {
                console.error(`Gagal fetch job ${jobName}:`, err.message);
                return [];
            }
        });
        // Tunggu semua request selesai
        const results = await Promise.all(promises);
        // 4. Gabungkan array of arrays menjadi satu array flat (single list)
        const allPendingBuilds = results.flat();
        // Urutkan berdasarkan waktu (terbaru diatas)
        allPendingBuilds.sort((a, b)=>b.timestamp - a.timestamp);
        console.log('Total pending builds:', allPendingBuilds.length);
        return __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$prod$2d$approval$2d$gateway$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            totalJobs: jobNames.length,
            pendingBuilds: allPendingBuilds.length,
            data: allPendingBuilds
        });
    } catch (error) {
        console.error('Error utama:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$prod$2d$approval$2d$gateway$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__d0c6ff5c._.js.map
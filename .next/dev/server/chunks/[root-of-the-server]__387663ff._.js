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
"[project]/src/app/api/k8s/secret/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// app/api/k8s/secret/route.js
__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
;
async function POST(request) {
    try {
        const { secretName, namespace, data, secretType } = await request.json();
        // Validasi input
        if (!secretName || !namespace || !data || Object.keys(data).length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                message: 'Secret name, namespace, dan data diperlukan'
            }, {
                status: 400
            });
        }
        // Get Kubernetes config from env
        const { K8S_API_URL, K8S_TOKEN, K8S_NAMESPACE } = process.env;
        if (!K8S_API_URL || !K8S_TOKEN) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                message: 'Kubernetes config tidak ditemukan di environment'
            }, {
                status: 500
            });
        }
        // Encode data to base64 (Kubernetes requirement)
        const encodedData = {};
        for (const [key, value] of Object.entries(data)){
            encodedData[key] = Buffer.from(value).toString('base64');
        }
        // Prepare secret payload
        const secretPayload = {
            apiVersion: 'v1',
            kind: 'Secret',
            metadata: {
                name: secretName,
                namespace: namespace || K8S_NAMESPACE || 'default'
            },
            type: secretType || 'Opaque',
            data: encodedData
        };
        const headers = {
            'Authorization': `Bearer ${K8S_TOKEN}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        // Try to create secret
        const createUrl = `${K8S_API_URL}/api/v1/namespaces/${secretPayload.metadata.namespace}/secrets`;
        console.log(`🔐 Creating secret: ${secretName} in namespace: ${secretPayload.metadata.namespace}`);
        const createRes = await fetch(createUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(secretPayload)
        });
        if (createRes.ok) {
            const result = await createRes.json();
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                message: `Secret "${secretName}" berhasil dibuat di namespace "${secretPayload.metadata.namespace}"`,
                data: result
            });
        }
        // If creation fails with 409 (already exists), try to update
        if (createRes.status === 409) {
            console.log(`🔄 Secret sudah ada, mencoba update...`);
            const updateUrl = `${K8S_API_URL}/api/v1/namespaces/${secretPayload.metadata.namespace}/secrets/${secretName}`;
            const updateRes = await fetch(updateUrl, {
                method: 'PUT',
                headers,
                body: JSON.stringify(secretPayload)
            });
            if (updateRes.ok) {
                const result = await updateRes.json();
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: true,
                    message: `Secret "${secretName}" berhasil diupdate di namespace "${secretPayload.metadata.namespace}"`,
                    data: result
                });
            } else {
                const errorText = await updateRes.text();
                throw new Error(`Update failed: ${errorText}`);
            }
        }
        // Handle other errors
        const errorText = await createRes.text();
        throw new Error(`Kubernetes API error: ${errorText}`);
    } catch (error) {
        console.error('❌ Error creating/updating secret:', error.message);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: error.message
        }, {
            status: 500
        });
    }
}
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const namespace = searchParams.get('namespace') || process.env.K8S_NAMESPACE || 'default';
        const { K8S_API_URL, K8S_TOKEN } = process.env;
        if (!K8S_API_URL || !K8S_TOKEN) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                message: 'Kubernetes config tidak ditemukan'
            }, {
                status: 500
            });
        }
        const headers = {
            'Authorization': `Bearer ${K8S_TOKEN}`,
            'Accept': 'application/json'
        };
        const url = `${K8S_API_URL}/api/v1/namespaces/${namespace}/secrets`;
        const res = await fetch(url, {
            headers
        });
        if (!res.ok) {
            throw new Error(`Failed to fetch secrets: ${res.statusText}`);
        }
        const data = await res.json();
        // Filter dan format data
        const secrets = data.items.map((secret)=>({
                name: secret.metadata.name,
                namespace: secret.metadata.namespace,
                type: secret.type,
                createdAt: secret.metadata.creationTimestamp,
                dataKeys: Object.keys(secret.data || {})
            }));
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            secrets,
            namespace
        });
    } catch (error) {
        console.error('Error fetching secrets:', error.message);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: error.message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__387663ff._.js.map
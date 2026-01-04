module.exports = [
"[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/apps/prod-approval-gateway/postcss.config.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "chunks/76a3a_f51655e1._.js",
  "chunks/[root-of-the-server]__2fc2665b._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/apps/prod-approval-gateway/postcss.config.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript)");
    });
});
}),
];
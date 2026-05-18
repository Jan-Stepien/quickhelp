// Webpack loader: replaces import.meta.url in ort.bundle.min.mjs before webpack processes it.
//
// ort.bundle.min.mjs uses `new URL("ort.bundle.min.mjs", import.meta.url)` to build a proxy
// worker URL. Webpack (in javascript/auto or javascript/esm mode) substitutes import.meta.url
// with the build-time file:// path. Because that path starts with "file:", the bundle always
// takes the branch that calls `new URL(new d.U(require(moduleId)).href, …)`, where the
// require() returns a module object rather than a URL string — throwing "e.replace is not a
// function" at runtime.
//
// By replacing import.meta.url with `globalThis.location?.href ?? ""` before webpack sees it,
// the runtime value is an http:// page URL, which does NOT start with "file:", so the error
// branch is skipped entirely. The proxy worker is never spawned anyway because we call
// removeBackground with { proxyToWorker: false }. onnxruntime-web's WASM paths are configured
// via ort.env.wasm.wasmPaths (set by @imgly/background-removal), so they are unaffected.
module.exports = function ortImportMetaPatch(source) {
  return source.replace(/import\.meta\.url/g, '(globalThis.location?.href ?? "")');
};

const esbuild = require("esbuild");

const production = process.argv.includes("--production");
const watch = process.argv.includes("--watch");

async function main() {
  // Extension host build (Node.js / CommonJS)
  const extCtx = await esbuild.context({
    entryPoints: ["src/extension.ts"],
    bundle: true,
    format: "cjs",
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    platform: "node",
    outfile: "dist/extension.js",
    external: ["vscode"],
    logLevel: "info",
    plugins: [
      {
        name: "watch-plugin",
        setup(build) {
          build.onEnd((result) => {
            if (result.errors.length === 0) {
              console.log("[esbuild] Extension build finished");
            }
          });
        },
      },
    ],
  });

  // Webview build (browser / IIFE)
  const webviewCtx = await esbuild.context({
    entryPoints: ["src/webview/index.tsx"],
    bundle: true,
    format: "iife",
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    platform: "browser",
    outfile: "dist/webview.js",
    jsx: "automatic",
    loader: { ".ttf": "file" },
    logLevel: "info",
    plugins: [
      {
        name: "watch-plugin",
        setup(build) {
          build.onEnd((result) => {
            if (result.errors.length === 0) {
              console.log("[esbuild] Webview build finished");
            }
          });
        },
      },
    ],
  });

  if (watch) {
    await Promise.all([extCtx.watch(), webviewCtx.watch()]);
    console.log("[esbuild] Watching for changes...");
  } else {
    await Promise.all([extCtx.rebuild(), webviewCtx.rebuild()]);
    await Promise.all([extCtx.dispose(), webviewCtx.dispose()]);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

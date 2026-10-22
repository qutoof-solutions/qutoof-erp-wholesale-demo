import { cp, mkdir, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";
import { build } from "esbuild";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(projectRoot, "dist-demo");
const cssInput = path.join(projectRoot, "app", "globals.css");

await rm(outputDir, { recursive: true, force: true });
await mkdir(path.join(outputDir, "assets"), { recursive: true });

const sourceCss = await readFile(cssInput, "utf8");
const cssResult = await postcss([tailwindcss()]).process(sourceCss, {
  from: cssInput,
  to: path.join(outputDir, "assets", "app.css"),
});
await import("node:fs/promises").then(({ writeFile }) =>
  writeFile(path.join(outputDir, "assets", "app.css"), cssResult.css, "utf8"),
);

await build({
  absWorkingDir: projectRoot,
  entryPoints: ["demo-static/main.tsx"],
  outfile: path.join(outputDir, "assets", "app.js"),
  bundle: true,
  minify: true,
  sourcemap: false,
  format: "esm",
  platform: "browser",
  target: ["es2020"],
  jsx: "automatic",
  legalComments: "none",
});

await cp(path.join(projectRoot, "demo-static", "index.html"), path.join(outputDir, "index.html"));
await cp(path.join(projectRoot, "public"), outputDir, { recursive: true });
console.log("Static ERP demo built at dist-demo/ (no Next.js Worker, D1, or KV bindings).");

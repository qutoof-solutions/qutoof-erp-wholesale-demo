import { readdir } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const assetsDir = path.join(projectRoot, "dist-demo", "assets");
const files = (await readdir(assetsDir))
  .filter((name) => name.endsWith(".js"))
  .map((name) => path.join(assetsDir, name));

if (files.length === 0) {
  throw new Error("Demo build produced no JavaScript assets.");
}

for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], {
    encoding: "utf8",
  });
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout);
    throw new Error(`Invalid JavaScript bundle: ${path.basename(file)}`);
  }
}

console.log(`Demo bundle check passed for ${files.length} JavaScript asset(s).`);

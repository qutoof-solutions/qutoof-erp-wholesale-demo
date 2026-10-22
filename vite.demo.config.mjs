import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/postcss";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: path.join(projectRoot, "demo-static"),
  base: "/",
  publicDir: path.join(projectRoot, "public"),
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  build: {
    outDir: path.join(projectRoot, "dist-demo"),
    emptyOutDir: true,
    sourcemap: false,
  },
});

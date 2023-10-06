import { defineConfig } from "vite";

export default defineConfig({
  base: "/bocchi/",
  esbuild: {
    supported: {
      "top-level-await": true,
    }
  }
});
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ""),
      },
      // Uploaded files (e.g. patient photos — served by the API itself via
      // useStaticAssets in main.ts) live outside the /api prefix, same as
      // in production (see Caddyfile) — proxy them too or <img src> tags
      // pointing at /uploads/... would 404 against the Vite dev server.
      "/uploads": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});

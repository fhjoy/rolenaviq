import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],

  server: {
    proxy: {
      "/api": mode === "e2e" ? "http://127.0.0.1:5001" : "http://127.0.0.1:5000",
      "/prep": "http://127.0.0.1:4200",
    },
  },

  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
}));

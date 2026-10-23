import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Served from https://insaneabhi07.github.io/analytiq/ — the base path must match the repo name.
export default defineConfig({
  plugins: [react()],
  base: "/analytiq/",
  server: { port: 5173 },
});

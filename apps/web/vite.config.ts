import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages serves this project beneath /Merkatolink/.
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_ACTIONS ? "/Merkatolink/" : "/",
});

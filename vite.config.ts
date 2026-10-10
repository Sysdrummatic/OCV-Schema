import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "web",
  base: "/OCV-Schema/",
  plugins: [react()],
  build: { outDir: "../site", emptyOutDir: true },
});

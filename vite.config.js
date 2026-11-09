import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: true },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"],
          motion: ["framer-motion"],
        },
      },
    },
  },
});

import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  envDir: path.resolve(__dirname, "env"),
  server: {
    proxy: {
      "/airline-logos": {
        target: "https://tbbd-flight.s3.ap-southeast-1.amazonaws.com",
        changeOrigin: true,
        rewrite: (requestPath) => requestPath.replace(/^\/airline-logos/, "/airlines-logo"),
      },
      "/gstatic-logos": {
        target: "https://www.gstatic.com",
        changeOrigin: true,
        rewrite: (requestPath) => requestPath.replace(/^\/gstatic-logos/, "/flights/airline_logos/70px"),
      },
    },
  },
});

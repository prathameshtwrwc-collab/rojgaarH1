import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Plugin } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// `npm run dev` has no Vercel, so serve the api/ function for password reset ourselves.
function localApi(): Plugin {
  return {
    name: "local-api-password-reset",
    apply: "serve",
    configureServer(server) {
      Object.assign(process.env, { ...loadEnv("development", process.cwd(), ""), ...process.env });
      server.middlewares.use("/api/password-reset", async (req, res) => {
        const chunks: Buffer[] = [];
        for await (const c of req) chunks.push(c as Buffer);
        const reply = (status: number, body: unknown) => {
          res.statusCode = status;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(body));
        };
        try {
          const mod = await server.ssrLoadModule("/api/password-reset.ts");
          const fake = {
            method: req.method,
            body: Buffer.concat(chunks).toString("utf8"),
          };
          const out = {
            status(code: number) {
              return { json: (body: unknown) => reply(code, body) };
            },
          };
          await mod.default(fake, out);
        } catch (err) {
          console.error("password-reset (dev):", err);
          reply(500, { success: false, message: "Password reset failed to run locally." });
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), localApi()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    proxy: {
      "/api/hanuotp": {
        target: "https://api.hanuotp.in",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/hanuotp/, "/sms-otp.php"),
      },
    },
  },
  build: {
    cssMinify: "lightningcss",
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-ui": ["framer-motion", "lucide-react", "@hugeicons/react"],
          "vendor-supabase": ["@supabase/supabase-js"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"],
  },
});

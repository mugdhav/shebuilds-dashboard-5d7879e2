import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const resolvedBackendUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || "";
  const resolvedPublishableKey =
    env.VITE_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_PUBLISHABLE_KEY || "";

  process.env.VITE_SUPABASE_URL = resolvedBackendUrl;
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY = resolvedPublishableKey;

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    define: {
      "import.meta.env": JSON.stringify({
        BASE_URL: "/",
        DEV: mode === "development",
        MODE: mode,
        PROD: mode === "production",
        SSR: false,
        VITE_SUPABASE_URL: resolvedBackendUrl,
        VITE_SUPABASE_PUBLISHABLE_KEY: resolvedPublishableKey,
      }),
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});

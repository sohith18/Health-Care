// vite.config.js
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import envCompatible from "vite-plugin-env-compatible";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env vars (e.g. VITE_API_KEY) from .env, .env.development, .env.test, etc.
  const env = loadEnv(mode, process.cwd());

  // Map VITE_ vars to process.env.* for both app code and Jest tests
  // Example: VITE_API_KEY -> process.env.API_KEY
  const processEnvDefines = Object.keys(env)
    .filter((key) => key.startsWith("VITE_"))
    .reduce((acc, key) => {
      const name = key.replace(/^VITE_/, ""); // strip prefix
      acc[`process.env.${name}`] = JSON.stringify(env[key]);
      return acc;
    }, {});

  return {
    plugins: [
      envCompatible(),
      react(),
    ],
    define: {
      ...processEnvDefines,
    },
  };
});

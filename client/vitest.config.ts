import { mergeConfig, defineConfig } from "vitest/config";

import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    define: {
      "import.meta.env.VITE_API_URL": JSON.stringify("http://localhost/api"),
    },
    test: {
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      clearMocks: true,
      coverage: {
        provider: "v8",
        reporter: ["text", "html"],
        include: ["src/**/*.{ts,tsx}"],
        exclude: [
          "src/main.tsx",
          "src/test/**",
          "src/components/ui/**",
        ],
      },
    },
  }),
);

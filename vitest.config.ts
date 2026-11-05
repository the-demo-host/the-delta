import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Tests run away from UTC so that time zone mistakes can't pass by accident.
process.env.TZ = "Asia/Tokyo";

export default defineConfig({
  plugins: [react()],
  test: {
    include: ["tests/**/*.test.{ts,tsx}"],
    // Vitest ignores `base`, so the served sub-path has to be set here.
    env: { BASE_URL: "/live/" },
  },
});

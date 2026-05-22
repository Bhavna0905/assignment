import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        zoom: {
          primary: "#0B5CFF",
          "primary-hover": "#0952d9",
          navy: "#0E1222",
          bg: "var(--zoom-bg)",
          card: "var(--zoom-card)",
          border: "var(--zoom-border)",
          text: "var(--zoom-text)",
          muted: "var(--zoom-muted)",
          orange: "#F26D21",
          purple: "#7C3AED",
        },
      },
      boxShadow: {
        zoom: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        "zoom-md":
          "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
        "zoom-dark":
          "0 4px 6px -1px rgb(0 0 0 / 0.35), 0 2px 4px -2px rgb(0 0 0 / 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;

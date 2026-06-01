import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const supportedReactHooksRules = new Set([
  "react-hooks/rules-of-hooks",
  "react-hooks/exhaustive-deps",
  "react-hooks/config",
  "react-hooks/error-boundaries",
  "react-hooks/gating",
  "react-hooks/component-hook-factories",
]);

const nextVitalsConfig = nextVitals.map((config) => ({
  ...config,
  rules: Object.fromEntries(
    Object.entries(config.rules ?? {}).filter(
      ([ruleName]) =>
        !ruleName.startsWith("react-hooks/") ||
        supportedReactHooksRules.has(ruleName),
    ),
  ),
}));

const eslintConfig = [
  ...nextVitalsConfig,
  ...nextTypeScript,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "prefer-const": "warn",
      "react/display-name": "warn",
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            {
              group: ["@/components/ui/*"],
              message:
                "Do not import directly from ui/. Use components/common wrappers instead.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/components/common/**/*.{ts,tsx}", "src/components/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
];

export default eslintConfig;

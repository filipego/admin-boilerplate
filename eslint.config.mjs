import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTypeScript,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "prefer-const": "warn",
      "react/display-name": "warn",
      "react-hooks/globals": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
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

module.exports = {
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
  plugins: ["react", "react-hooks"],
  settings: {
    react: { version: "detect" },
  },
  rules: {
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "no-console": "warn",
    "semi": ["warn", "always"],
    "quotes": ["warn", "single", { "avoidEscape": true }],
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "react/jsx-uses-react": "off",
  },
};

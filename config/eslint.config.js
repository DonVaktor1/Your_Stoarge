import globals from "globals";
import pluginReact from "eslint-plugin-react";

const eslintConfig = [
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      globals: globals.browser,
      ecmaVersion: "latest", 
      sourceType: "module",  
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect", // Автоматичне визначення версії React.
      },
    },
    plugins: {
      react: pluginReact, 
    },
    rules: {
      "react/react-in-jsx-scope": "off", // Вимкнення правила для React 17+.
      "react/prop-types": "off", // Якщо не використовуються prop-types.
      "no-console": "off", // Дозвіл на використання console.log.
    },
  },
];

export default eslintConfig;

import globals from "globals";
import pluginReact from "eslint-plugin-react";

export default [
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
        version: "detect",
      },
    },
    plugins: {
      react: pluginReact, 
    },
    rules: {
      "react/react-in-jsx-scope": "off", 
      "react/prop-types": "off", 
      "no-console": "off"
    },
  },
];

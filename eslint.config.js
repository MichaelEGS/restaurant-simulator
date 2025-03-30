// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        // Variables globales del navegador
        ...globals.browser,
        // Agregar CustomEvent si es necesario
        CustomEvent: "readonly",
      },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      }
    },
    rules: {
      // Reglas personalizadas
      "no-unused-vars": "warn",
      "no-console": "off", // Permite el uso de console.log
      "no-alert": "off" // Permite el uso de alert()
    }
  }
];
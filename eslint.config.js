// eslint.config.js
import js from '@eslint/js';

export default [
  js.configs.recommended, // Configuración recomendada
  {
    rules: {
      'no-unused-vars': 'warn', // Personaliza reglas aquí
      'no-console': 'off'
    }
  }
];
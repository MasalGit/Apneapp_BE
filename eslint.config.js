import globals from 'globals';
import js from '@eslint/js';

export default [
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {...globals.node},
    },
  },
  js.configs.recommended,
];

import globals from 'globals';
import tseslint from 'typescript-eslint';
import baseConfig from '../eslint.config.mjs';

export default tseslint.config(
  { ignores: ['test-results/', 'playwright-report/'] },

  // Inherit shared rules (js, ts, prettier, common rules)
  ...baseConfig,

  // Add type-checked rules for no-floating-promises support
  ...tseslint.configs.recommendedTypeChecked,

  // E2E-specific environment and parser options
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // E2E-specific rule overrides
  {
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-floating-promises': 'error',
    },
  },
);

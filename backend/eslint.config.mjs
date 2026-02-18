import globals from 'globals';
import tseslint from 'typescript-eslint';
import baseConfig from '../eslint.config.mjs';

export default tseslint.config(
  { ignores: ['eslint.config.mjs', 'dist/'] },

  // Inherit shared rules (js, ts, prettier, common rules)
  ...baseConfig,

  // Add type-checked rules on top of the base recommended
  ...tseslint.configs.recommendedTypeChecked,

  // Backend-specific environment and parser options
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Backend-specific rule overrides
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/require-await': 'warn',
    },
  },
);

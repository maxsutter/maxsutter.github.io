import eslintComments from 'eslint-plugin-eslint-comments';

const browserGlobals = {
  AbortController: 'readonly',
  document: 'readonly',
  fetch: 'readonly',
  FormData: 'readonly',
  history: 'readonly',
  IntersectionObserver: 'readonly',
  localStorage: 'readonly',
  navigator: 'readonly',
  sessionStorage: 'readonly',
  URL: 'readonly',
  WeakMap: 'readonly',
  window: 'readonly',
};

export default [
  {
    ignores: [
      'old/**',
      'node_modules/**',
      'test-results/**',
      'playwright-report/**',
      '.lighthouseci/**',
      'artifacts/**',
    ],
  },
  {
    files: ['assets/site.js', 'main.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: browserGlobals,
    },
    plugins: {
      'eslint-comments': eslintComments,
    },
    rules: {
      'eslint-comments/no-restricted-disable': ['error', '*'],
      'no-undef': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['tools/**/*.mjs', 'tests/**/*.js', 'playwright.config.js', 'eslint.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        document: 'readonly',
        Event: 'readonly',
        process: 'readonly',
        setTimeout: 'readonly',
        URL: 'readonly',
        window: 'readonly',
      },
    },
    plugins: {
      'eslint-comments': eslintComments,
    },
    rules: {
      'eslint-comments/no-restricted-disable': ['error', '*'],
      'no-undef': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
    },
  },
];

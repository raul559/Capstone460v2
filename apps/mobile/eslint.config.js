// https://docs.expo.dev/guides/using-eslint/
// Project rules are explained in docs/v2/CODING_STANDARDS.md.
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

const EMOJI = '/\\p{Extended_Pictographic}/u';
const NO_EMOJI_MESSAGE = 'Use an icon component instead of emoji or pictograph characters.';

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'scripts/*'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
      complexity: ['error', 10],
      'no-nested-ternary': 'error',
      'react/no-multi-comp': 'error',
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: 'Send requests through the shared API client.' },
      ],
      'no-restricted-syntax': [
        'error',
        { selector: `Literal[value=${EMOJI}]`, message: NO_EMOJI_MESSAGE },
        { selector: `TemplateElement[value.raw=${EMOJI}]`, message: NO_EMOJI_MESSAGE },
        { selector: `JSXText[value=${EMOJI}]`, message: NO_EMOJI_MESSAGE },
      ],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'unicode-bom': ['error', 'never'],
      eqeqeq: 'error',
    },
  },
  {
    // The API client is the one place allowed to call fetch.
    files: ['src/api/**', 'src/library/skin-analysis.ts'],
    rules: { 'no-restricted-globals': 'off' },
  },
]);

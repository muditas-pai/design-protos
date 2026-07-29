/* The seam rule.

   A canonical screen must resolve its parts through useComponent, never by
   direct import. Without this, someone hardcodes <Card /> one afternoon and
   nobody can explore cards without editing canonical — which is the exact
   thing the override mechanism exists to prevent.

   Explorations are exempt: they're allowed to import a canonical component in
   order to wrap or extend it.
*/
export default [
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    files: ['src/canonical/screens/*.jsx'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['**/canonical/components/*', '../components/*'],
          message:
            'Canonical screens must use useComponent("Name") so explorations can ' +
            'override this part. Direct imports close the seam.',
        }],
      }],
    },
  },
]

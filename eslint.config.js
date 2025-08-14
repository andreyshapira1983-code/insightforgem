export default [
  {
    files: ['netlify/functions/**/*.js'],
    ignores: ['netlify/functions/agents.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module'
    },
    rules: {
      quotes: ['error','single'],
      semi: ['error','always']
    }
  }
];

module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/recommended',
    '@vue/airbnb',
    '@vue/typescript',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'arrow-parens': 'off',
    semi: ['error', 'never'],
    'max-len': 'off',
    'class-methods-use-this': 'off',
    'no-use-before-define': 'off',
    'no-param-reassign': 'off',
    'no-cond-assign': 'off',
    'no-multi-assign': 'off',
    'no-restricted-syntax': 'off',
    'prefer-destructuring': 'off',
    'linebreak-style': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
  },
  parserOptions: {
    parser: '@typescript-eslint/parser',
  },
}

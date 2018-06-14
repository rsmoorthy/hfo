module.exports = {
  parser: 'babel-eslint',
  extends: ['standard', 'prettier'],
  plugins: ['prettier'],
  parserOptions: {
    ecmaVersion: 2016,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    es6: true
  },
  rules: {
    'no-unused-vars': 'off',
    'no-restricted-syntax': ['error', 'SequenceExpression'],
    semi: ['error', 'never']
  }
}

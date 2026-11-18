#!/usr/bin/env node
/* Os arquivos em js/ compartilham o mesmo escopo global (são scripts clássicos), então o lint junta todos na ordem de carregamento. */
const fs = require('fs'), path = require('path');
const { ESLint } = require('eslint');
const globals = require('globals');
const root = path.resolve(__dirname, '..');
const order = ['logic', 'core', 'plan-data', 'plan3d', 'bridge', 'ui'];
(async () => {
  const code = order.map(n => fs.readFileSync(path.join(root, 'js', n + '.js'), 'utf8')).join('\n');
  const eslint = new ESLint({
    cwd: root, overrideConfigFile: true,
    overrideConfig: [{
      files: ['**/*.js'],
      languageOptions: { sourceType: 'script', ecmaVersion: 2022, globals: { ...globals.browser, THREE: 'readonly', Logic: 'writable', Bridge: 'writable', module: 'readonly' } },
      rules: { 'no-undef': 'error', 'no-const-assign': 'error', 'no-dupe-keys': 'error', 'no-unreachable': 'error', 'no-self-assign': 'error', 'no-cond-assign': 'error', 'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none' }] }
    }]
  });
  const [res] = await eslint.lintText(code, { filePath: path.join(root, 'bundle.js') });
  const fmt = await eslint.loadFormatter('stylish');
  console.log(await fmt.format([res]) || 'lint ok');
  process.exit(res.errorCount ? 1 : 0);
})();

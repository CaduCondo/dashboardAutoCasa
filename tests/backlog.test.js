const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { carregar, parseIssue, COLUNAS } = require('../tools/criar_issues.js');

const issues = carregar(path.resolve(__dirname, '..', 'docs', 'backlog'));

test('backlog: todos os arquivos são lidos e têm título único', () => {
  assert.ok(issues.length >= 20);
  assert.equal(new Set(issues.map(i => i.title)).size, issues.length);
});
test('backlog: cada issue tem coluna válida, etiquetas de tipo e critérios de aceite', () => {
  issues.forEach(i => {
    assert.ok(COLUNAS.includes(i.column), `${i.file}: coluna inválida (${i.column})`);
    assert.ok(i.labels.some(l => l.startsWith('tipo:')), `${i.file}: falta etiqueta tipo:`);
    assert.match(i.body, /## Critérios de aceite\n- \[ \]/, `${i.file}: faltam critérios`);
  });
});
test('backlog: o que está bloqueado tem a etiqueta ou o motivo escrito', () => {
  issues.filter(i => i.column === 'Bloqueado').forEach(i => assert.match(i.body, /[Bb]loqueado|[Aa]guardando|[Dd]epende/, i.file));
});
test('parseIssue: recusa arquivo sem cabeçalho', () => {
  assert.throws(() => parseIssue('sem cabeçalho', 'x.md'), /faltam os dados/);
});

const test = require('node:test');
const assert = require('node:assert/strict');
const { plano, ESTADOS } = require('../tools/kanban.js');
const { estadoDe, parseIssue } = require('../tools/criar_issues.js');

test('kanban: muda o estado trocando só a etiqueta de estado', () => {
  assert.deepEqual(plano(['tipo:feature', 'estado:pronto'], 'andamento'), { adicionar: ['estado:andamento'], remover: ['estado:pronto'] });
});
test('kanban: não repete etiqueta que já existe', () => {
  assert.deepEqual(plano(['estado:teste'], 'teste'), { adicionar: [], remover: [] });
});
test('kanban: bloqueado adiciona a etiqueta bloqueado e sair dele a remove', () => {
  assert.deepEqual(plano(['estado:pronto'], 'bloqueado'), { adicionar: ['estado:bloqueado', 'bloqueado'], remover: ['estado:pronto'] });
  assert.deepEqual(plano(['estado:bloqueado', 'bloqueado'], 'pronto'), { adicionar: ['estado:pronto'], remover: ['estado:bloqueado', 'bloqueado'] });
});
test('kanban: recusa estado desconhecido', () => {
  assert.throws(() => plano([], 'qualquer'), /Estado inválido/);
  assert.ok(ESTADOS.includes('andamento'));
});
test('criar_issues: toda issue lida ganha a etiqueta de estado da coluna', () => {
  const i = parseIssue('---\ntitle: x\nlabels: tipo:docs\ncolumn: Em teste\n---\n## Contexto\ny', '07-x.md');
  assert.ok(i.labels.includes('estado:teste'));
  assert.equal(i.number, 7);
  assert.equal(estadoDe('Pronto para fazer'), 'estado:pronto');
});

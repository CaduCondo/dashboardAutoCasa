const test = require('node:test');
const assert = require('node:assert/strict');
const { estadoDaIssue, escolherOpcao } = require('../tools/quadro.js');

const PADRAO = [{ id: 'a', name: 'Todo' }, { id: 'b', name: 'In Progress' }, { id: 'c', name: 'Done' }];
const NOSSAS = ['Backlog', 'Pronto para fazer', 'Em andamento', 'Em teste', 'Feito', 'Bloqueado'].map((name, i) => ({ id: 'x' + i, name }));

test('quadro: issue fechada é sempre feito, mesmo com outra etiqueta', () => {
  assert.equal(estadoDaIssue(['estado:andamento'], false), 'feito');
});
test('quadro: issue aberta usa a etiqueta de estado e sem etiqueta cai no backlog', () => {
  assert.equal(estadoDaIssue(['tipo:docs', 'estado:teste'], true), 'teste');
  assert.equal(estadoDaIssue(['tipo:docs'], true), 'backlog');
});
test('quadro: com as colunas nossas, cada estado acha a sua', () => {
  assert.equal(escolherOpcao('pronto', NOSSAS).name, 'Pronto para fazer');
  assert.equal(escolherOpcao('bloqueado', NOSSAS).name, 'Bloqueado');
  assert.equal(escolherOpcao('feito', NOSSAS).name, 'Feito');
});
test('quadro: com as colunas padrão do GitHub, usa os nomes em inglês e as aproximações', () => {
  assert.equal(escolherOpcao('backlog', PADRAO).name, 'Todo');
  assert.equal(escolherOpcao('andamento', PADRAO).name, 'In Progress');
  assert.equal(escolherOpcao('teste', PADRAO).name, 'In Progress', 'sem coluna de teste, fica em andamento');
  assert.equal(escolherOpcao('pronto', PADRAO).name, 'Todo');
  assert.equal(escolherOpcao('feito', PADRAO).name, 'Done');
});
test('quadro: sem coluna parecida devolve nada (o script avisa)', () => {
  assert.equal(escolherOpcao('feito', [{ id: 'z', name: 'Outra' }]), undefined);
});

const { parse } = require('graphql');
const Q = require('../tools/quadro.js');

test('quadro: todas as consultas GraphQL têm sintaxe válida (o GitHub recusou uma antes)', () => {
  ['CONSULTA_QUADRO', 'MUTACAO_ADICIONAR', 'MUTACAO_STATUS'].forEach(nome => {
    assert.doesNotThrow(() => parse(Q[nome]), `${nome} com sintaxe inválida`);
  });
});

#!/usr/bin/env node
/* Copia o estado das issues (etiquetas estado:*) para a coluna "Status" do quadro (GitHub Projects v2).
 * Roda no GitHub Actions (.github/workflows/kanban.yml), porque o GraphQL não funciona nas sessões do Claude Code.
 *   node tools/quadro.js --issue 24     sincroniza uma issue
 *   node tools/quadro.js --all          sincroniza todas as issues do repositório
 * Variáveis: GH_REPO (dono/nome), PROJECT_OWNER, PROJECT_NUMBER, PROJECT_TOKEN (classic com escopo "project"),
 *            GH_TOKEN (token normal do Actions, para ler as issues).
 * Ainda não foi testado contra um quadro real: só a lógica de mapeamento tem testes automáticos. */
const { execFileSync } = require('child_process');

/* Nomes de coluna aceitos para cada estado (o quadro padrão do GitHub usa Todo / In Progress / Done). */
const COLUNAS = {
  backlog: ['Backlog', 'Todo', 'A fazer'],
  pronto: ['Pronto para fazer', 'Pronto', 'Ready', 'TO-DO', 'TO DO'],
  andamento: ['Em andamento', 'In progress', 'WIP'],
  teste: ['Em teste', 'Em revisão', 'In review', 'In Tests'],
  feito: ['Feito', 'Done', 'Concluído', 'DONE'],
  bloqueado: ['Bloqueado', 'Blocked', 'BLOCK']
};
const FALLBACK = { pronto: 'backlog', teste: 'andamento', bloqueado: 'backlog' };

/** Estado da issue a partir das etiquetas; issue fechada é sempre "feito". */
function estadoDaIssue(labels, aberta) {
  if (!aberta) return 'feito';
  const e = labels.find(l => l.startsWith('estado:'));
  return e ? e.slice(7) : 'backlog';
}

/** Escolhe, entre as opções do campo Status do quadro, a que corresponde ao estado. */
function escolherOpcao(estado, opcoes) {
  const procura = nomes => opcoes.find(o => nomes.some(n => n.toLowerCase() === o.name.toLowerCase()));
  return procura(COLUNAS[estado] || []) || (FALLBACK[estado] ? procura(COLUNAS[FALLBACK[estado]]) : undefined);
}

const CONSULTA_QUADRO = `query($owner:String!,$n:Int!){ user(login:$owner){ projectV2(number:$n){ id fields(first:30){ nodes{ ... on ProjectV2SingleSelectField{ id name options{ id name } } } } } } }`;
const MUTACAO_ADICIONAR = `mutation($p:ID!,$c:ID!){ addProjectV2ItemById(input:{projectId:$p,contentId:$c}){ item{ id } } }`;
const MUTACAO_STATUS = `mutation($p:ID!,$i:ID!,$f:ID!,$o:String!){ updateProjectV2ItemFieldValue(input:{projectId:$p,itemId:$i,fieldId:$f,value:{singleSelectOptionId:$o}}){ projectV2Item{ id } } }`;

const run = (args, env) => execFileSync('gh', args, { encoding: 'utf8', env: Object.assign({}, process.env, env || {}) }).trim();

function graphql(token, query, vars) {
  const args = ['api', 'graphql', '-f', `query=${query}`];
  Object.entries(vars || {}).forEach(([k, v]) => args.push('-F', `${k}=${v}`));
  return JSON.parse(run(args, { GH_TOKEN: token }));
}

function carregarQuadro(token, owner, numero) {
  const r = graphql(token, CONSULTA_QUADRO, { owner, n: numero });
  const p = r.data.user.projectV2;
  const status = p.fields.nodes.find(f => f && f.name === 'Status');
  if (!status) throw new Error('O quadro não tem o campo "Status".');
  return { id: p.id, statusId: status.id, opcoes: status.options };
}

function sincronizarIssue(token, quadro, issue) {
  const estado = estadoDaIssue(issue.labels.map(l => l.name), issue.state === 'open');
  const opcao = escolherOpcao(estado, quadro.opcoes);
  if (!opcao) { console.warn(`#${issue.number}: nenhuma coluna combina com "${estado}". Colunas do quadro: ${quadro.opcoes.map(o => o.name).join(', ')}`); return; }
  const add = graphql(token, MUTACAO_ADICIONAR, { p: quadro.id, c: issue.node_id });
  const item = add.data.addProjectV2ItemById.item.id;
  graphql(token, MUTACAO_STATUS, { p: quadro.id, i: item, f: quadro.statusId, o: opcao.id });
  console.log(`#${issue.number} → ${opcao.name}`);
}

function main(argv) {
  const token = process.env.PROJECT_TOKEN;
  if (!token) { console.log('::warning::Segredo PROJECT_TOKEN não configurado: o quadro não foi atualizado. Veja docs/KANBAN.md.'); return; }
  const repo = process.env.GH_REPO, owner = process.env.PROJECT_OWNER, numero = +process.env.PROJECT_NUMBER;
  if (!repo || !owner || !numero) throw new Error('Defina GH_REPO, PROJECT_OWNER e PROJECT_NUMBER.');
  const quadro = carregarQuadro(token, owner, numero);
  const i = argv.indexOf('--issue');
  const issues = i >= 0
    ? [JSON.parse(run(['api', `repos/${repo}/issues/${argv[i + 1]}`]))]
    : run(['api', '--paginate', `repos/${repo}/issues?state=all&per_page=100`, '--jq', '.[] | select(.pull_request | not)']).split('\n').filter(Boolean).map(l => JSON.parse(l));
  issues.forEach(is => sincronizarIssue(token, quadro, is));
}

module.exports = { estadoDaIssue, escolherOpcao, COLUNAS, CONSULTA_QUADRO, MUTACAO_ADICIONAR, MUTACAO_STATUS };
if (require.main === module) main(process.argv.slice(2));

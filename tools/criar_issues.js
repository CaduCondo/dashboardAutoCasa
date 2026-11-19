#!/usr/bin/env node
/* Cria etiquetas e issues no GitHub a partir de docs/backlog/*.md.
 *   node tools/criar_issues.js                       mostra o que faria (não cria nada)
 *   node tools/criar_issues.js --apply --repo DONO/NOME   cria etiquetas e issues (usa `gh api`, só REST)
 * Não cria issue repetida (compara o título). Cartões do quadro: veja a mensagem no final.
 */
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');

const COLUNAS = ['Backlog', 'Pronto para fazer', 'Em andamento', 'Em teste', 'Feito', 'Bloqueado'];
const CORES = { tipo: '1d76db', area: '0e8a16', prioridade: 'd93f0b', bloqueado: 'b60205' };

function parseIssue(text, file) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`${file}: faltam os dados do topo (---)`);
  const meta = {};
  m[1].split('\n').forEach(l => { const i = l.indexOf(':'); if (i > 0) meta[l.slice(0, i).trim()] = l.slice(i + 1).trim(); });
  if (!meta.title) throw new Error(`${file}: falta title`);
  return { file, title: meta.title, labels: (meta.labels || '').split(',').map(s => s.trim()).filter(Boolean), column: meta.column || 'Backlog', body: m[2].trim() };
}

function carregar(dir) {
  return fs.readdirSync(dir).filter(f => /^\d+-.*\.md$/.test(f)).sort().map(f => parseIssue(fs.readFileSync(path.join(dir, f), 'utf8'), f));
}

function gh(args, input) { return execFileSync('gh', args, { input, encoding: 'utf8' }).trim(); }

/* Usa só a API REST (`gh api`): o GraphQL não funciona nas sessões do Claude Code. */
function repoAlvo(argv) {
  const i = argv.indexOf('--repo');
  const r = i >= 0 ? argv[i + 1] : process.env.GH_REPO;
  if (!r || !/^[\w.-]+\/[\w.-]+$/.test(r)) throw new Error('Informe o repositório: --repo DONO/NOME (ou a variável GH_REPO).');
  return r;
}

function main(argv) {
  const apply = argv.includes('--apply');
  const issues = carregar(path.resolve(__dirname, '..', 'docs', 'backlog'));
  const labels = [...new Set(issues.flatMap(i => i.labels))];
  console.log(`${issues.length} issues, ${labels.length} etiquetas${apply ? '' : ' (simulação: use --apply para criar)'}`);
  if (!apply) { issues.forEach(i => console.log(`- [${i.column}] ${i.title}  (${i.labels.join(', ')})`)); return; }
  const repo = repoAlvo(argv);
  labels.forEach(l => {
    const cor = CORES[l.split(':')[0]] || 'ededed';
    try { gh(['api', `repos/${repo}/labels`, '-f', `name=${l}`, '-f', `color=${cor}`]); }
    catch (e) { gh(['api', '-X', 'PATCH', `repos/${repo}/labels/${encodeURIComponent(l)}`, '-f', `color=${cor}`]); }
  });
  const existentes = new Set(JSON.parse(gh(['api', `repos/${repo}/issues?state=all&per_page=100`, '--jq', '[.[].title]'])));
  issues.forEach(i => {
    if (existentes.has(i.title)) return console.log(`já existe: ${i.title}`);
    const corpo = `${i.body}\n\n---\nColuna do quadro: **${i.column}**`;
    const args = ['api', `repos/${repo}/issues`, '-f', `title=${i.title}`, '-f', `body=${corpo}`, '--jq', '.html_url'];
    i.labels.forEach(l => args.push('-f', `labels[]=${l}`));
    console.log(gh(args));
  });
  console.log('Para pôr no quadro: no projeto, "Add item" > repositório > selecionar tudo; ou ligue o fluxo "Auto-add to project".');
}

module.exports = { parseIssue, carregar, COLUNAS };
if (require.main === module) main(process.argv.slice(2));

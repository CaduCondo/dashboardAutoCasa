#!/usr/bin/env node
/* Cria etiquetas e issues no GitHub a partir de docs/backlog/*.md.
 *   node tools/criar_issues.js                       mostra o que faria (não cria nada)
 *   node tools/criar_issues.js --apply               cria etiquetas e issues (precisa do gh logado no repositório)
 *   node tools/criar_issues.js --apply --project 1 --owner SEU_USUARIO   também coloca cada issue no quadro
 * Ainda não foi testado contra um GitHub real: só o leitor dos arquivos tem testes automáticos.
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

function main(argv) {
  const apply = argv.includes('--apply');
  const arg = n => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };
  const project = arg('--project'), owner = arg('--owner');
  const issues = carregar(path.resolve(__dirname, '..', 'docs', 'backlog'));
  const labels = [...new Set(issues.flatMap(i => i.labels))];
  console.log(`${issues.length} issues, ${labels.length} etiquetas${apply ? '' : ' (simulação: use --apply para criar)'}`);
  if (apply) labels.forEach(l => gh(['label', 'create', l, '--force', '--color', CORES[l.split(':')[0]] || 'ededed']));
  issues.forEach(i => {
    const corpo = `${i.body}\n\n---\nColuna do quadro: **${i.column}**`;
    if (!apply) return console.log(`- [${i.column}] ${i.title}  (${i.labels.join(', ')})`);
    const url = gh(['issue', 'create', '--title', i.title, '--label', i.labels.join(','), '--body-file', '-'], corpo);
    console.log(url);
    if (project && owner) gh(['project', 'item-add', project, '--owner', owner, '--url', url]);
  });
}

module.exports = { parseIssue, carregar, COLUNAS };
if (require.main === module) main(process.argv.slice(2));

#!/usr/bin/env node
/* Mantém o estado das issues (e portanto o quadro Kanban) atualizado, só pela API REST.
 *   node tools/kanban.js estado 24 andamento      muda o estado da issue (backlog|pronto|andamento|teste|bloqueado|feito)
 *   node tools/kanban.js comentar 24 "texto"      escreve um comentário na issue
 *   node tools/kanban.js sincronizar              aplica nas issues o estado escrito em docs/backlog (só onde falta)
 * Repositório: --repo DONO/NOME ou variável GH_REPO.
 * "feito" também fecha a issue. O workflow .github/workflows/kanban.yml copia a etiqueta para o quadro. */
const path = require('path'), { execFileSync } = require('child_process');
const { carregar, ESTADO } = require('./criar_issues.js');

const ESTADOS = Object.values(ESTADO);

/** Dado o conjunto de etiquetas atual e o novo estado, diz o que adicionar e remover. */
function plano(labels, estado) {
  if (!ESTADOS.includes(estado)) throw new Error(`Estado inválido: ${estado} (use ${ESTADOS.join(', ')})`);
  const alvo = 'estado:' + estado;
  const remover = labels.filter(l => l.startsWith('estado:') && l !== alvo);
  const bloq = estado === 'bloqueado';
  if (bloq && !labels.includes('bloqueado')) return { adicionar: [alvo, 'bloqueado'], remover };
  const extra = !bloq && labels.includes('bloqueado') ? ['bloqueado'] : [];
  return { adicionar: labels.includes(alvo) ? [] : [alvo], remover: remover.concat(extra) };
}

const gh = (args, input) => execFileSync('gh', args, { input, encoding: 'utf8' }).trim();
function repoAlvo(argv) {
  const i = argv.indexOf('--repo'); const r = i >= 0 ? argv[i + 1] : process.env.GH_REPO;
  if (!r) throw new Error('Informe --repo DONO/NOME ou a variável GH_REPO.');
  return r;
}
const labelsDe = (repo, n) => JSON.parse(gh(['api', `repos/${repo}/issues/${n}`, '--jq', '[.labels[].name]']));

function aplicar(repo, n, estado) {
  const p = plano(labelsDe(repo, n), estado);
  p.remover.forEach(l => { try { gh(['api', '-X', 'DELETE', `repos/${repo}/issues/${n}/labels/${encodeURIComponent(l)}`]); } catch (e) { /* já não estava */ } });
  if (p.adicionar.length) gh(['api', `repos/${repo}/issues/${n}/labels`, ...p.adicionar.flatMap(l => ['-f', `labels[]=${l}`])]);
  if (estado === 'feito') gh(['api', '-X', 'PATCH', `repos/${repo}/issues/${n}`, '-f', 'state=closed', '-f', 'state_reason=completed']);
  console.log(`#${n}: estado:${estado}`);
}

function main(argv) {
  const [cmd, a, b] = argv;
  const repo = repoAlvo(argv);
  if (cmd === 'estado') return aplicar(repo, +a, b);
  if (cmd === 'comentar') { gh(['api', `repos/${repo}/issues/${+a}/comments`, '-f', `body=${b}`]); return console.log(`#${a}: comentário enviado`); }
  if (cmd === 'sincronizar') {
    carregar(path.resolve(__dirname, '..', 'docs', 'backlog')).forEach(i => {
      const atual = labelsDe(repo, i.number);
      if (atual.some(l => l.startsWith('estado:'))) return;
      aplicar(repo, i.number, ESTADO[i.column] || 'backlog');
    });
    return;
  }
  console.log('Comandos: estado <n> <estado> | comentar <n> "texto" | sincronizar');
}

module.exports = { plano, ESTADOS };
if (require.main === module) main(process.argv.slice(2));

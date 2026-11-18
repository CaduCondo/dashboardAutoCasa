/* Testes funcionais: abrem o painel num navegador de verdade e usam um Home Assistant falso. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { createServer } = require('../tools/serve.js');
const { startMockHA } = require('./mock-ha.js');

const ROOT = path.resolve(__dirname, '..');
let browser, server, base;

const MOCK = {
  'light.sala_de_estar': { state: 'on' },
  'light.cozinha': { state: 'off' },
  'cover.persiana_suite_1': { state: 'open', attributes: { current_position: 100 } },
  'climate.daikin_sala': { state: 'cool', attributes: { temperature: 23 } },
  'media_player.tv_sala': { state: 'on', attributes: { volume_level: 0.36 } },
  'cover.portao': { state: 'closed' },
  'binary_sensor.interfone': { state: 'off' },
  'switch.irrigacao_frente': { state: 'off' },
  'vacuum.aspirador': { state: 'docked', attributes: { battery_level: 71 } },
  'button.racao': { state: 'unknown' },
  'camera.portao': { state: 'idle', attributes: { entity_picture: '/api/camera_proxy/camera.portao?token=abc' } }
};
const MAP = {
  'lights:0': 'light.sala_de_estar', 'lights:1': 'light.cozinha', 'blinds:0': 'cover.persiana_suite_1', 'ac:0': 'climate.daikin_sala',
  'tv:0': 'media_player.tv_sala', 'gate:0': 'cover.portao', 'call:0': 'binary_sensor.interfone', 'irrig:0': 'switch.irrigacao_frente',
  'pet:0': 'button.racao', 'pet:1': 'vacuum.aspirador', 'cam:0': 'camera.portao'
};

test.before(async () => {
  const exe = process.env.CHROMIUM_PATH || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
  browser = await chromium.launch({ executablePath: exe, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
  server = createServer(ROOT);
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  base = 'http://127.0.0.1:' + server.address().port;
});
test.after(async () => { await browser.close(); server.close(); });

async function openPage(init, hash) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|ERR_/.test(m.text())) errors.push(m.text()); });
  if (init) await page.addInitScript(init.fn, init.arg);
  await page.goto(base + '/index.html' + (hash || ''));
  await page.waitForSelector('.tile', { state: 'attached' });
  return { ctx, page, errors };
}
const bigOf = (page, g) => page.$eval(`.tile .open[data-g="${g}"] .big`, e => e.textContent);
const haInit = (ha, token, map) => ({ fn: ([u, t, m]) => localStorage.setItem('casa.ha', JSON.stringify({ url: u, token: t, map: m })), arg: [ha.url, token || ha.token, map || MAP] });
const waitCalls = async (ha, n, ms) => { const t = Date.now(); while (ha.calls.length < n && Date.now() - t < (ms || 3000)) await new Promise(r => setTimeout(r, 40)); };

/* ---------------- modo demonstração ---------------- */
test('demo: carrega sem erros, com 15 blocos, 8 câmeras e cenas no rodapé', async () => {
  const { ctx, page, errors } = await openPage();
  assert.equal(await page.$$eval('.tile', e => e.length), 15);
  assert.equal(await page.$$eval('.cam', e => e.length), 8);
  assert.ok((await page.$$eval('.scn[data-a="srun"]', e => e.length)) >= 5);
  assert.equal(await page.isVisible('#banner'), true, 'chamada de demonstração aparece');
  assert.deepEqual(errors, []);
  await ctx.close();
});

test('demo: tocar num bloco abre a camada e ligar uma luz atualiza o cartão', async () => {
  const { ctx, page } = await openPage();
  assert.equal(await bigOf(page, 'lights'), '2/8');
  await page.click('.tile .open[data-g="lights"]');
  await page.click('.swb[data-g="lights"][data-i="2"]');
  await page.click('#lx');
  assert.equal(await bigOf(page, 'lights'), '3/8');
  assert.ok(await page.$eval('.tile .open[data-g="lights"]', e => e.closest('.tile').classList.contains('active')), 'cartão aceso');
  await ctx.close();
});

test('demo: botão desligar tudo apaga as luzes', async () => {
  const { ctx, page } = await openPage();
  await page.click('.master[data-m="lights"]');
  assert.equal(await bigOf(page, 'lights'), '0/8');
  await ctx.close();
});

test('demo: cena Boa noite apaga luzes e fecha persianas e portão', async () => {
  const { ctx, page } = await openPage();
  await page.click('.scn[data-id="s1"]');
  assert.equal(await bigOf(page, 'lights'), '0/8');
  assert.equal(await bigOf(page, 'blinds'), '0/3');
  await ctx.close();
});

test('demo: interfone mostra chamada, atende, mostra cronômetro e encerra', async () => {
  const { ctx, page } = await openPage();
  await page.click('#banner [data-a="ans"]');
  await page.waitForSelector('#ctimer');
  assert.equal(await page.isVisible('#banner'), false);
  await page.click('.btn[data-a="end"]');
  assert.match(await page.textContent('#lb'), /Sem chamadas/);
  await ctx.close();
});

test('demo: portão abre e fecha e o cartão acompanha', async () => {
  const { ctx, page } = await openPage();
  assert.equal(await bigOf(page, 'gate'), 'Fechado');
  await page.click('.tile .open[data-g="gate"]');
  await page.click('[data-a="gt"][data-v="Aberto"]');
  await page.click('#lx');
  assert.equal(await bigOf(page, 'gate'), 'Aberto');
  await ctx.close();
});

test('demo: renomear câmera persiste depois de recarregar', async () => {
  const { ctx, page } = await openPage();
  await page.click('.cam[data-c="0"]');
  await page.fill('input[data-a="cname"]', 'Portão principal');
  await page.click('#lx');
  assert.equal(await page.textContent('.cam[data-c="0"] .name'), 'Portão principal');
  await page.reload(); await page.waitForSelector('.tile', { state: 'attached' });
  assert.equal(await page.textContent('.cam[data-c="0"] .name'), 'Portão principal');
  await ctx.close();
});

test('demo: programar horário da irrigação (dias, hora e duração) e ver o resumo', async () => {
  const { ctx, page } = await openPage();
  await page.click('.tile .open[data-g="irrig"]');
  await page.click('[data-a="ed"][data-g="irrig"][data-i="0"]');
  await page.click('.chip[data-a="sd"][data-v="0"]');
  await page.fill('input[data-a="sm"]', '20');
  const txt = await page.textContent('.item .schline span');
  assert.match(txt, /Dom, Seg, Qua, Sex/);
  assert.match(txt, /20 min/);
  await ctx.close();
});

test('demo: criar cena nova, adicionar ação e executar', async () => {
  const { ctx, page } = await openPage();
  await page.click('.scn[data-view="scenes"]');
  await page.click('[data-a="snew"]');
  await page.fill('input[data-a="sname"]', 'Cinema');
  await page.click('[data-a="aadd"]');
  await page.selectOption('select[data-a="aref"]', 'g:tv');
  await page.selectOption('select[data-a="aact"]', 'on');
  await page.click('#lb [data-a="srun"]');
  await page.click('#lx');
  assert.equal(await bigOf(page, 'tv'), '2/2');
  assert.ok(await page.$('.scn[data-a="srun"]:has-text("Cinema")'));
  await ctx.close();
});

test('demo: lista para imprimir mostra frases e regras', async () => {
  const { ctx, page } = await openPage();
  await page.click('.scn[data-view="print"]');
  const t = await page.textContent('#lb');
  assert.match(t, /Alexa, boa noite/);
  assert.match(t, /O que a casa faz sozinha/);
  await ctx.close();
});

test('demo: regras podem ser desligadas e novas regras criadas', async () => {
  const { ctx, page } = await openPage();
  await page.click('.tile .open[data-view="rules"]');
  const n = await page.$$eval('#lb .item', e => e.length);
  await page.click('[data-a="rnew"]');
  await page.click('[data-a="vrules"]');
  assert.equal(await page.$$eval('#lb .item', e => e.length), n + 1);
  await ctx.close();
});

/* ---------------- planta 3D ---------------- */
test('planta: desenha o 3D, tem ícones, alterna luz e abre camada do cômodo', async () => {
  const { ctx, page, errors } = await openPage(null, '#planta');
  await page.waitForSelector('#stage canvas');
  await page.waitForTimeout(800);
  assert.ok((await page.$$eval('#stage .mk', e => e.length)) >= 40);
  assert.ok(await page.$eval('#stage canvas', c => c.width > 100));
  const before = await page.$eval('[data-mk="lights:2"]', e => e.classList.contains('on'));
  await page.click('[data-mk="lights:2"]', { force: true });
  await page.waitForTimeout(200);
  assert.notEqual(await page.$eval('[data-mk="lights:2"]', e => e.classList.contains('on')), before);
  await page.click('.rl[data-room="7"]', { force: true });
  assert.match(await page.textContent('#lb'), /Sala de estar/);
  assert.deepEqual(errors, []);
  await ctx.close();
});

test('planta: botões de vista, paredes e planta original funcionam', async () => {
  const { ctx, page, errors } = await openPage(null, '#planta');
  await page.waitForSelector('#stage canvas');
  for (const v of ['top', 'front', 'right', 'back', 'left', 'persp']) { await page.click(`[data-pv="${v}"]`); await page.waitForTimeout(80); }
  assert.match(await page.textContent('[data-pt="walls"]'), /inteiras/, 'começa com paredes baixas e oferece as inteiras');
  await page.click('[data-pt="walls"]');
  assert.match(await page.textContent('[data-pt="walls"]'), /baixas/);
  await page.click('[data-pt="orig"]');
  assert.equal(await page.$eval('[data-pt="orig"]', e => e.getAttribute('aria-pressed')), 'true');
  assert.deepEqual(errors, []);
  await ctx.close();
});

test('planta: editor de portas e janelas troca tipo, adiciona, exclui e persiste', async () => {
  const { ctx, page } = await openPage(null, '#planta');
  await page.waitForSelector('#stage canvas');
  await page.click('[data-pt="edit"]');
  await page.click('[data-pt="em:ops"]');
  const n = await page.$$eval('.op', e => e.length);
  assert.ok(n > 20);
  await page.click('[data-op="add:p"]');
  assert.equal(await page.$$eval('.op', e => e.length), n + 1);
  await page.click('[data-op="t:j"]');
  assert.equal(await page.$$eval('.op.sel', e => e.length), 1);
  assert.equal(await page.$eval('.op.sel', e => e.classList.contains('j')), true);
  await page.click('[data-op="del"]');
  assert.equal(await page.$$eval('.op', e => e.length), n);
  await page.click('[data-op="add:j"]');
  await page.reload(); await page.waitForSelector('#stage canvas');
  await page.click('[data-pt="edit"]'); await page.click('[data-pt="em:ops"]');
  assert.equal(await page.$$eval('.op', e => e.length), n + 1, 'abertura nova sobrevive ao recarregar');
  await page.click('[data-op="reset"]');
  assert.equal(await page.$$eval('.op', e => e.length), n);
  await ctx.close();
});

test('planta: arrastar um ícone em modo de edição move e guarda a posição', async () => {
  const { ctx, page } = await openPage(null, '#planta');
  await page.waitForSelector('#stage canvas');
  await page.click('[data-pt="edit"]');
  const b = await (await page.$('[data-mk="lights:0"]')).boundingBox();
  assert.ok(b.x > 5, 'o ícone já nasce na posição certa, sem piscar no canto da tela');
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down();
  await page.mouse.move(b.x + 90, b.y + 40, { steps: 6 }); await page.mouse.up();
  const b2 = await (await page.$('[data-mk="lights:0"]')).boundingBox();
  assert.ok(Math.abs(b2.x - b.x) > 30);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('casa.cfg')).pos3['lights:0']);
  assert.equal(saved.length, 2);
  await ctx.close();
});

/* ---------------- ligação com o Home Assistant ---------------- */
test('ha: conecta, sincroniza os estados e mostra Conectado', async () => {
  const ha = await startMockHA(MOCK);
  const { ctx, page, errors } = await openPage(haInit(ha));
  await page.waitForSelector('#cfgDot.on');
  assert.equal(await bigOf(page, 'lights'), '1/8', 'Sala ligada e Cozinha desligada vieram do HA');
  assert.equal(await page.isVisible('#banner'), false, 'sem chamada de demonstração');
  assert.equal(await page.$eval('.cam[data-c="0"] img.feed', e => e.getAttribute('src').includes('/api/camera_proxy_stream/camera.portao?token=abc')), true);
  assert.equal(ha.calls.length, 0, 'sincronizar não devolve comandos ao HA');
  assert.deepEqual(errors, []);
  await ctx.close(); await ha.close();
});

test('ha: ligar uma luz no painel envia o comando certo', async () => {
  const ha = await startMockHA(MOCK);
  const { ctx, page } = await openPage(haInit(ha));
  await page.waitForSelector('#cfgDot.on');
  await page.click('.tile .open[data-g="lights"]');
  await page.click('.swb[data-g="lights"][data-i="1"]');
  await waitCalls(ha, 1);
  assert.deepEqual(ha.calls[0], { domain: 'homeassistant', service: 'turn_on', data: {}, entity: 'light.cozinha' });
  await ctx.close(); await ha.close();
});

test('ha: dispositivo sem vínculo não envia nada', async () => {
  const ha = await startMockHA(MOCK);
  const { ctx, page } = await openPage(haInit(ha));
  await page.waitForSelector('#cfgDot.on');
  await page.click('.tile .open[data-g="lights"]');
  await page.click('.swb[data-g="lights"][data-i="2"]');
  await page.waitForTimeout(400);
  assert.equal(ha.calls.length, 0);
  await ctx.close(); await ha.close();
});

test('ha: mudança feita no Home Assistant aparece no painel', async () => {
  const ha = await startMockHA(MOCK);
  const { ctx, page } = await openPage(haInit(ha));
  await page.waitForSelector('#cfgDot.on');
  ha.setState('light.sala_de_estar', 'off');
  await page.waitForFunction(() => document.querySelector('.tile .open[data-g="lights"] .big').textContent === '0/8');
  ha.setState('climate.daikin_sala', 'off');
  await page.waitForFunction(() => document.querySelector('.tile .open[data-g="ac"] .big').textContent === '0/5');
  assert.equal(ha.calls.length, 0, 'não há eco de volta para o HA');
  await ctx.close(); await ha.close();
});

test('ha: ar-condicionado, persiana, TV e portão geram os serviços corretos', async () => {
  const ha = await startMockHA(MOCK);
  const { ctx, page } = await openPage(haInit(ha));
  await page.waitForSelector('#cfgDot.on');
  await page.click('.tile .open[data-g="ac"]');
  await page.click('[data-a="t+"][data-g="ac"][data-i="0"]');
  await waitCalls(ha, 1);
  assert.equal(ha.calls[0].service, 'set_temperature'); assert.equal(ha.calls[0].data.temperature, 24);
  await page.click('#lx');
  await page.click('.tile .open[data-g="blinds"]');
  await page.click('[data-a="cv"][data-v="0"][data-g="blinds"][data-i="0"]');
  await waitCalls(ha, 2);
  assert.equal(ha.calls[1].service, 'close_cover'); assert.equal(ha.calls[1].entity, 'cover.persiana_suite_1');
  await page.click('#lx');
  await page.click('.tile .open[data-g="tv"]');
  await page.$eval('input[data-a="vol"][data-i="0"]', e => { e.value = '25'; e.dispatchEvent(new Event('input', { bubbles: true })); });
  await waitCalls(ha, 3);
  assert.equal(ha.calls[2].service, 'volume_set'); assert.equal(ha.calls[2].data.volume_level, 0.5);
  await page.click('#lx');
  await page.click('.tile .open[data-g="gate"]');
  await page.click('[data-a="gt"][data-v="Aberto"]');
  await waitCalls(ha, 4);
  assert.equal(ha.calls[3].service, 'open_cover'); assert.equal(ha.calls[3].entity, 'cover.portao');
  ha.setState('cover.portao', 'open');
  await page.click('#lx');
  await page.waitForFunction(() => document.querySelector('.tile .open[data-g="gate"] .big').textContent === 'Aberto');
  await ctx.close(); await ha.close();
});

test('ha: cena Boa noite apaga as luzes vinculadas', async () => {
  const ha = await startMockHA(Object.assign({}, MOCK, { 'light.cozinha': { state: 'on' } }));
  const { ctx, page } = await openPage(haInit(ha));
  await page.waitForSelector('#cfgDot.on');
  await page.click('.scn[data-id="s1"]');
  await waitCalls(ha, 2);
  const off = ha.calls.filter(c => c.service === 'turn_off').map(c => c.entity).sort();
  assert.deepEqual(off, ['light.cozinha', 'light.sala_de_estar', 'media_player.tv_sala'], 'luzes e TV da sala desligam');
  assert.ok(ha.calls.some(c => c.service === 'close_cover' && c.entity === 'cover.persiana_suite_1'), 'persiana fecha');
  await ctx.close(); await ha.close();
});

test('ha: alimentador e aspirador (Tuya) enviam botão e start', async () => {
  const ha = await startMockHA(MOCK);
  const { ctx, page } = await openPage(haInit(ha));
  await page.waitForSelector('#cfgDot.on');
  await page.click('.tile .open[data-g="pet"]');
  await page.click('[data-a="feed"]');
  await page.click('[data-a="feed"]');
  await waitCalls(ha, 2);
  assert.equal(ha.calls.filter(c => c.service === 'press').length, 2, 'cada toque solta uma porção');
  await page.click('[data-a="vac"][data-v="Limpando"]');
  await waitCalls(ha, 3);
  assert.equal(ha.calls[2].service, 'start');
  await ctx.close(); await ha.close();
});

test('ha: interfone toca quando o sensor liga e some quando desliga', async () => {
  const ha = await startMockHA(MOCK);
  const { ctx, page } = await openPage(haInit(ha));
  await page.waitForSelector('#cfgDot.on');
  assert.equal(await page.isVisible('#banner'), false);
  ha.setState('binary_sensor.interfone', 'on');
  await page.waitForSelector('#banner', { state: 'visible' });
  ha.setState('binary_sensor.interfone', 'off');
  await page.waitForSelector('#banner', { state: 'hidden' });
  await ctx.close(); await ha.close();
});

test('ha: token inválido mostra erro e não derruba o painel', async () => {
  const ha = await startMockHA(MOCK);
  const { ctx, page, errors } = await openPage(haInit(ha, 'ERRADO'));
  await page.waitForSelector('#cfgDot.error');
  assert.equal(await bigOf(page, 'lights'), '2/8', 'continua em demonstração');
  assert.deepEqual(errors, []);
  await ctx.close(); await ha.close();
});

test('ha: Home Assistant fora do ar não gera erro de script', async () => {
  const ha = await startMockHA(MOCK);
  const init = haInit(ha); await ha.close();
  const { ctx, page, errors } = await openPage(init);
  await page.waitForTimeout(800);
  assert.ok(!(await page.$eval('#cfgDot', e => e.classList.contains('on'))));
  assert.deepEqual(errors, []);
  await ctx.close();
});

test('ha: tela Conexão salva vínculos e exporta YAML com a cena', async () => {
  const ha = await startMockHA(MOCK);
  const { ctx, page } = await openPage(haInit(ha));
  await page.waitForSelector('#cfgDot.on');
  await page.click('#cfgBtn');
  await page.fill('input[data-ref="lights:2"]', 'light.corredor');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('casa.ha')).map['lights:2']);
  assert.equal(saved, 'light.corredor');
  await page.click('[data-a="haexp"]');
  const scripts = await page.inputValue('#yamlScripts');
  assert.match(scripts, /painel_boa_noite:/);
  assert.match(scripts, /light\.sala_de_estar/);
  assert.match(await page.inputValue('#yamlAuto'), /sun/);
  await ctx.close(); await ha.close();
});

test('ha: sugerir automaticamente vincula entidades pelo nome', async () => {
  const ha = await startMockHA(MOCK);
  const { ctx, page } = await openPage(haInit(ha, null, {}));
  await page.waitForSelector('#cfgDot.on');
  await page.click('#cfgBtn');
  await page.click('[data-a="hasug"]');
  const m = await page.evaluate(() => JSON.parse(localStorage.getItem('casa.ha')).map);
  assert.equal(m['lights:0'], 'light.sala_de_estar');
  assert.equal(m['lights:1'], 'light.cozinha');
  await ctx.close(); await ha.close();
});

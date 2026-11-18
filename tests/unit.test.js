const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../js/logic.js');

test('subRect: abertura no meio divide a parede em duas', () => {
  const r = L.subRect([0, 0, 100, 10], [40, -3, 60, 13]);
  assert.deepEqual(r, [[0, 0, 40, 10], [60, 0, 100, 10]]);
});
test('subRect: sem sobreposição devolve a parede inteira', () => {
  assert.deepEqual(L.subRect([0, 0, 100, 10], [200, 0, 220, 10]), [[0, 0, 100, 10]]);
});
test('subRect: abertura cobrindo tudo remove a parede', () => {
  assert.deepEqual(L.subRect([0, 0, 100, 10], [-5, -5, 105, 15]), []);
});
test('subRect: abertura na ponta deixa só um pedaço', () => {
  assert.deepEqual(L.subRect([0, 0, 100, 10], [0, -3, 30, 13]), [[30, 0, 100, 10]]);
});
test('snapToWall: encaixa na parede horizontal mais próxima e respeita a largura', () => {
  const walls = [[0, 100, 200, 112], [300, 0, 312, 200]];
  const r = L.snapToWall(walls, { x0: 0, y0: 0, x1: 44, y1: 12 }, 100, 90);
  assert.deepEqual(r, [78, 100, 122, 112]);
});
test('snapToWall: parede vertical', () => {
  const walls = [[300, 0, 312, 200]];
  const r = L.snapToWall(walls, { x0: 0, y0: 0, x1: 12, y1: 44 }, 290, 50);
  assert.deepEqual(r, [300, 28, 312, 72]);
});
test('snapToWall: longe demais não encaixa', () => {
  assert.equal(L.snapToWall([[0, 100, 200, 112]], { x0: 0, y0: 0, x1: 44, y1: 12 }, 100, 300), null);
});
test('snapToWall: não passa das pontas da parede', () => {
  const r = L.snapToWall([[0, 100, 100, 112]], { x0: 0, y0: 0, x1: 44, y1: 12 }, 99, 100);
  assert.equal(r[2], 100); assert.equal(r[2] - r[0], 44);
});

test('serviceFor: luz liga e desliga', () => {
  assert.deepEqual(L.serviceFor('toggle', 'light.sala', { field: 'on', value: true })[0], { domain: 'homeassistant', service: 'turn_on', data: {}, target: { entity_id: 'light.sala' } });
  assert.equal(L.serviceFor('toggle', 'light.sala', { field: 'on', value: false })[0].service, 'turn_off');
});
test('serviceFor: ar-condicionado liga em modo frio e muda temperatura', () => {
  const on = L.serviceFor('ac', 'climate.sala', { field: 'on', value: true })[0];
  assert.equal(on.service, 'set_hvac_mode'); assert.equal(on.data.hvac_mode, 'cool');
  assert.equal(L.serviceFor('ac', 'climate.sala', { field: 'on', value: false })[0].service, 'turn_off');
  assert.equal(L.serviceFor('ac', 'climate.sala', { field: 't', value: 22 })[0].data.temperature, 22);
});
test('serviceFor: TV converte volume 0-50 para 0-1', () => {
  assert.equal(L.serviceFor('tv', 'media_player.tv', { field: 'vol', value: 25 })[0].data.volume_level, 0.5);
  assert.equal(L.serviceFor('tv', 'media_player.tv', { field: 'vol', value: 80 })[0].data.volume_level, 1);
});
test('serviceFor: persiana abre, fecha e posiciona', () => {
  assert.equal(L.serviceFor('cover', 'cover.p', { field: 'pos', value: 100 })[0].service, 'open_cover');
  assert.equal(L.serviceFor('cover', 'cover.p', { field: 'pos', value: 0 })[0].service, 'close_cover');
  const mid = L.serviceFor('cover', 'cover.p', { field: 'pos', value: 40 })[0];
  assert.equal(mid.service, 'set_cover_position'); assert.equal(mid.data.position, 40);
});
test('serviceFor: portão como cover, switch e botão', () => {
  assert.equal(L.serviceFor('gate', 'cover.portao', { field: 'state', value: 'Aberto' })[0].service, 'open_cover');
  assert.equal(L.serviceFor('gate', 'cover.portao', { field: 'state', value: 'Fechado' })[0].service, 'close_cover');
  assert.equal(L.serviceFor('gate', 'button.portao', { field: 'state', value: 'Aberto' })[0].service, 'press');
  assert.deepEqual(L.serviceFor('gate', 'button.portao', { field: 'state', value: 'Fechado' }), []);
});
test('serviceFor: aspirador e alimentador', () => {
  assert.equal(L.serviceFor('vac', 'vacuum.a', { field: 'state', value: 'Limpando' })[0].service, 'start');
  assert.equal(L.serviceFor('vac', 'vacuum.a', { field: 'state', value: 'Na base' })[0].service, 'return_to_base');
  assert.equal(L.serviceFor('feeder', 'button.racao', { field: 'fed', value: 1 })[0].service, 'press');
});
test('serviceFor: campo desconhecido não gera chamada', () => {
  assert.deepEqual(L.serviceFor('toggle', 'light.x', { field: 'nada', value: 1 }), []);
});

test('applyState: luz, ar, TV, persiana, portão e aspirador', () => {
  const luz = L.applyState({ k: 'toggle', on: false }, { entity_id: 'light.a', state: 'on' }); assert.equal(luz.on, true);
  const ar = L.applyState({ k: 'ac', on: false, t: 24 }, { entity_id: 'climate.a', state: 'cool', attributes: { temperature: 22.4 } });
  assert.equal(ar.on, true); assert.equal(ar.t, 22);
  const arOff = L.applyState({ k: 'ac', on: true, t: 24 }, { entity_id: 'climate.a', state: 'off', attributes: {} }); assert.equal(arOff.on, false);
  const tv = L.applyState({ k: 'tv', on: false, vol: 0 }, { entity_id: 'media_player.t', state: 'playing', attributes: { volume_level: 0.36 } });
  assert.equal(tv.on, true); assert.equal(tv.vol, 18);
  assert.equal(L.applyState({ k: 'cover', pos: 0 }, { entity_id: 'cover.p', state: 'open', attributes: { current_position: 60 } }).pos, 60);
  assert.equal(L.applyState({ k: 'cover', pos: 0 }, { entity_id: 'cover.p', state: 'open', attributes: {} }).pos, 100);
  assert.equal(L.applyState({ k: 'gate', state: 'Fechado' }, { entity_id: 'cover.g', state: 'opening' }).state, 'Aberto');
  const vac = L.applyState({ k: 'vac', state: 'Na base', bat: 0 }, { entity_id: 'vacuum.a', state: 'cleaning', attributes: { battery_level: 71 } });
  assert.equal(vac.state, 'Limpando'); assert.equal(vac.bat, 71);
});
test('applyState: indisponível conta como desligado', () => {
  assert.equal(L.applyState({ k: 'toggle', on: true }, { entity_id: 'light.a', state: 'unavailable' }).on, false);
  assert.equal(L.applyState({ k: 'tv', on: true, vol: 5 }, { entity_id: 'media_player.t', state: 'unavailable' }).on, false);
});
test('camUrl: usa o stream e o token da entidade', () => {
  const u = L.camUrl('http://ha:8123/', { attributes: { entity_picture: '/api/camera_proxy/camera.portao?token=abc' } });
  assert.equal(u, 'http://ha:8123/api/camera_proxy_stream/camera.portao?token=abc');
  assert.equal(L.camUrl('http://ha', {}), '');
});

test('toYaml: objetos, listas e vazios', () => {
  const y = L.toYaml({ a: 1, b: 'x "y"', c: [], d: {}, e: [{ f: 1, g: { h: true } }], i: ['u', 2] });
  assert.equal(y, 'a: 1\nb: "x \\"y\\""\nc: []\nd: {}\ne:\n  - f: 1\n    g:\n      h: true\ni:\n  - "u"\n  - 2\n');
});
test('slug remove acentos', () => assert.equal(L.slug('Boa noite, Mãe!'), 'boa_noite_mae'));

const groups = () => [
  { id: 'lights', name: 'Luzes', items: [{ k: 'toggle', n: 'Sala' }, { k: 'toggle', n: 'Cozinha' }] },
  { id: 'blinds', name: 'Persianas', items: [{ k: 'cover', n: 'S1', sk: 'cover', sch: [{ d: [1, 2], t: '07:00', a: 'Abrir', on: true }] }] },
  { id: 'irrig', name: 'Irrigação', items: [{ k: 'toggle', n: 'Frente', sk: 'dur', sch: [{ d: [1, 3, 5], t: '06:00', m: 15, on: true }, { d: [0], t: '09:00', m: 5, on: false }] }] }
];
test('exportHA: cena vira script com um passo por dispositivo vinculado', () => {
  const r = L.exportHA({ groups: groups(), map: { 'lights:0': 'light.sala', 'lights:1': 'light.cozinha' }, rules: [], scenes: [{ id: 's1', name: 'Boa noite', acts: [{ ref: 'g:lights', act: 'off' }] }] });
  assert.match(r.scriptsYaml, /painel_boa_noite:/);
  assert.equal((r.scriptsYaml.match(/service: "homeassistant.turn_off"/g) || []).length, 2);
  assert.equal(r.warnings.filter(w => /^Cena/.test(w)).length, 0);
});
test('exportHA: dispositivo sem vínculo gera aviso e não quebra', () => {
  const r = L.exportHA({ groups: groups(), map: { 'lights:0': 'light.sala' }, rules: [], scenes: [{ id: 's1', name: 'X', acts: [{ ref: 'g:lights', act: 'off' }] }] });
  assert.equal((r.scriptsYaml.match(/turn_off/g) || []).length, 1);
  assert.ok(r.warnings.some(w => /lights:1/.test(w)));
});
test('exportHA: regra de horário vira automação com dias da semana', () => {
  const sc = [{ id: 's1', name: 'Boa noite', acts: [] }];
  const r = L.exportHA({ groups: groups(), map: {}, scenes: sc, rules: [{ id: 'r1', on: true, trig: 'time', t: '23:30', d: [1, 2, 3], scene: 's1' }] });
  assert.match(r.automationsYaml, /at: "23:30:00"/);
  assert.match(r.automationsYaml, /weekday:\n\s+- "mon"\n\s+- "tue"\n\s+- "wed"/);
  assert.match(r.automationsYaml, /service: "script.painel_boa_noite"/);
});
test('exportHA: pôr do sol vira gatilho sun; chuva sem sensor vira aviso', () => {
  const sc = [{ id: 's1', name: 'A', acts: [] }];
  const r = L.exportHA({ groups: groups(), map: {}, scenes: sc, rules: [{ id: 'r1', on: true, trig: 'sunset', scene: 's1' }, { id: 'r2', on: true, trig: 'rain', scene: 's1' }, { id: 'r3', on: false, trig: 'sunrise', scene: 's1' }] });
  assert.match(r.automationsYaml, /platform: "sun"/);
  assert.equal((r.automationsYaml.match(/alias:/g) || []).length, 1);
  assert.ok(r.warnings.some(w => /sensor/.test(w)));
});
test('exportHA: horário de irrigação liga, espera e desliga; horário desligado é ignorado', () => {
  const r = L.exportHA({ groups: groups(), map: { 'irrig:0': 'switch.irrig_frente', 'blinds:0': 'cover.s1' }, scenes: [], rules: [] });
  assert.match(r.automationsYaml, /minutes: 15/);
  assert.ok(!/minutes: 5\b/.test(r.automationsYaml));
  assert.match(r.automationsYaml, /service: "cover.open_cover"/);
  assert.match(r.automationsYaml, /alias: "Horário: Frente 06:00"/);
});

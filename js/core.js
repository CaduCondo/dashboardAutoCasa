
const IC={
 bell:'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0',
 bulb:'M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z',
 blinds:'M4 3h16M4 7h16M4 11h16M4 15h16M12 15v4M10 21h4',
 pool:'M2 14c2-2 4-2 6 0s4 2 6 0 4-2 8 0M2 19c2-2 4-2 6 0s4 2 6 0 4-2 8 0M8 11V5a2 2 0 0 1 4 0M15 11V5a2 2 0 0 1 4 0',
 sun:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5',
 drop:'M12 2.5S5 10 5 15a7 7 0 0 0 14 0c0-5-7-12.5-7-12.5z',
 snow:'M12 2v20M4.9 7l14.2 10M4.9 17L19.1 7',
 tv:'M3 5h18v12H3zM8 21h8M12 17v4',
 robot:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
 door:'M5 21V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v17M3 21h18M15 12v.01',
 therm:'M10 14V5a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0z',
 rain:'M20 16.5A4.5 4.5 0 0 0 17.5 8h-1A6 6 0 1 0 4 14.3M8 19v2M12 19v2M16 19v2',
 play:'M7 4l13 8-13 8z',
 bolt:'M13 2L3 14h8l-1 8 10-12h-8z',
 gate:'M3 4v17M21 4v17M3 9h18M3 15h18M9 9v6M15 9v6',
 mic:'M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3zM19 11a7 7 0 0 1-14 0M12 18v4',
 list:'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
 cam:'M3 7h12v10H3zM15 11l6-3v8l-6-3z',
 expand:'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5'
};
const ic=k=>`<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="${IC[k]}"/></svg>`;
const $=s=>document.querySelector(s);

/* ---------- dados de exemplo ---------- */
const CAMS=[
 {n:'Portão',b:'Intelbras',h:210,used:64},{n:'Garagem',b:'Intelbras',h:190,used:41},
 {n:'Fachada',b:'Intelbras',h:230,used:58},{n:'Quintal',b:'Intelbras',h:140,used:72},
 {n:'Piscina',b:'Intelbras',h:185,used:33},{n:'Horta',b:'Intelbras',h:110,used:27},
 {n:'Sala',b:'Tapo C200',h:30,used:49},{n:'Cozinha',b:'Tapo C200',h:20,used:52}];
CAMS.forEach(c=>c.rec=true);

const T=(n,sub,on=false,extra={})=>({k:'toggle',n,sub,on,...extra});
const GROUPS=[
 {id:'call',name:'Interfone',icon:'bell',src:'Allo Plus',call:true,
  items:[{k:'call'}]},
 {id:'gate',name:'Portão',icon:'gate',src:'Motor do portão',items:[{k:'gate',n:'Portão automático',state:'Fechado',auto:true,min:2}]},
 {id:'lights',name:'Luzes internas',icon:'bulb',src:'SmartLife · Sonoff',allOff:true,items:[
  T('Sala de estar','SmartLife',true,{light:1}),T('Cozinha','SmartLife',true,{light:1}),T('Área gourmet','SmartLife',false,{light:1}),T('Corredor','Sonoff',false,{light:1}),
  T('Escritório','Sonoff',false,{light:1}),T('Suíte 1','Sonoff',false,{light:1}),T('Suíte 2','Sonoff',false,{light:1}),T('Suíte 3','Sonoff',false,{light:1})]},
 {id:'blinds',name:'Persianas',icon:'blinds',src:'Sonoff',items:[
  {k:'cover',n:'Suíte 1 · porta balcão',pos:100},{k:'cover',n:'Suíte 2 · porta balcão',pos:100},{k:'cover',n:'Suíte 3 · porta balcão',pos:0}]},
 {id:'pool',name:'Piscina',icon:'pool',src:'SmartLife · Sonoff',allOff:true,items:[
  T('Luzes da piscina','Sonoff',false,{light:1}),T('Motor do filtro','Sonoff',true),T('Motor da cascata','Sonoff',false),{k:'heater',n:'Aquecimento da piscina',on:false,t:28,cur:25}]},
 {id:'outside',name:'Luzes de fora',icon:'sun',src:'SmartLife',allOff:true,items:[
  T('Fachada','',false,{light:1}),T('Garagem','',false,{light:1}),T('Jardim da frente','',false,{light:1}),T('Jardim dos fundos','',false,{light:1}),T('Deck da piscina','',false,{light:1})]},
 {id:'irrig',name:'Irrigação',icon:'drop',src:'SmartLife',allOff:true,verb:'regando',items:[
  T('Jardim da frente','Torneira da frente'),T('Jardim dos fundos','Torneira dos fundos'),T('Horta','Torneira da horta')]},
 {id:'ac',name:'Ar-condicionado',icon:'snow',src:'Daikin · outra marca',allOff:true,items:[
  {k:'ac',n:'Sala de estar',b:'Daikin',on:true,t:23},{k:'ac',n:'Suíte 1',b:'Daikin',on:false,t:24},{k:'ac',n:'Suíte 2',b:'Daikin',on:false,t:24},
  {k:'ac',n:'Suíte 3',b:'Marca a definir',on:false,t:24},{k:'ac',n:'Escritório',b:'Marca a definir',on:false,t:24}]},
 {id:'tv',name:'TVs',icon:'tv',src:'LG ThinQ · TCL',allOff:true,items:[
  {k:'tv',n:'TV da sala',b:'LG',on:true,vol:18},{k:'tv',n:'TV da suíte 1',b:'TCL',on:false,vol:12}]},
 {id:'pet',name:'Ração e robô',icon:'robot',src:'Tuya',items:[
  {k:'feeder',n:'Alimentador de pet',last:'07:30'},{k:'vac',n:'Aspirador robô',state:'Na base',bat:84}]},
 {id:'doors',name:'Portas',icon:'door',src:'Sensores',planned:true,items:[
  {k:'plan',n:'Porta da frente',sub:'Aberta ou fechada'},{k:'plan',n:'Porta dos fundos',sub:'Aberta ou fechada'},{k:'plan',n:'Portas balcão dos quartos',sub:'Aberta ou fechada'}]},
 {id:'boiler',name:'Boiler',icon:'therm',src:'Sensores',planned:true,items:[
  {k:'plan',n:'Temperatura da água',sub:'Sensor ainda não instalado'},{k:'plan',n:'Nível de água',sub:'Sensor ainda não instalado'}]},
 {id:'roof',name:'Telhado e chuva',icon:'rain',src:'Motor + sensor',planned:true,items:[
  {k:'plan',n:'Telhado retrátil',sub:'Abre e fecha como persiana'},{k:'plan',n:'Sensor de chuva',sub:'Quando chover, fecha o telhado sozinho'}]}
];
let call='ring',mic=true,spk=true,t0=0,open=null;
const DIAS=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],ALL=[0,1,2,3,4,5,6];
const SK={toggle:'dur',heater:'dur',ac:'dur',cover:'cover',feeder:'once',vac:'once'};
GROUPS.forEach(g=>g.items.forEach(it=>{if(SK[it.k]){it.sk=SK[it.k];it.sch=[]}}));
const gi=id=>GROUPS.find(g=>g.id===id).items;
gi('irrig').forEach((it,i)=>it.sch=[{d:[1,3,5],t:['06:00','06:20','06:40'][i],m:[15,15,10][i],on:true}]);
gi('pool')[1].sch=[{d:ALL,t:'08:00',m:360,on:true}];
gi('pool')[3].sch=[{d:ALL,t:'09:00',m:300,on:false}];
gi('blinds').forEach(it=>it.sch=[{d:[1,2,3,4,5],t:'07:00',a:'Abrir',on:true},{d:ALL,t:'19:00',a:'Fechar',on:true}]);
gi('pet')[0].sch=[{d:ALL,t:'07:30',on:true},{d:ALL,t:'18:30',on:true}];
gi('pet')[1].sch=[{d:[2,4],t:'10:00',on:true}];

function save(){try{const s={};GROUPS.forEach(g=>g.items.forEach((it,i)=>{if(it.sch)s[g.id+i]=it.sch}));localStorage.setItem('casa.cfg',JSON.stringify({sch:s,scenes:SCENES,rules:RULES,voice:VOICE,cams:CAMS.map(c=>c.n),pos3:POS3,ops:OPS}))}catch(e){}}
function schTxt(it){const s=(it.sch||[]).filter(x=>x.on);if(!s.length)return '';return s.map(x=>{const dias=x.d.length===7?'Todos os dias':x.d.length?x.d.map(i=>DIAS[i]).join(', '):'Sem dias';const w=it.sk==='cover'?x.a+' às '+x.t:it.sk==='dur'?x.t+' · '+x.m+' min':'às '+x.t;return dias+' · '+w}).join(' | ')}

/* ---------- cenas, regras e interfone ---------- */
const PRE={lights:'Luz',blinds:'Persiana',ac:'Ar-cond.',outside:'Luz de fora'};
const ALLN={lights:'todas as luzes internas',blinds:'todas as persianas',pool:'tudo da piscina',outside:'todas as luzes de fora',irrig:'toda a irrigação',ac:'todos os ar-condicionados',tv:'todas as TVs'};
const TXT={on:l=>`Liga ${l}`,off:l=>`Desliga ${l}`,open:l=>`Abre ${l}`,close:l=>`Fecha ${l}`,feed:l=>`Solta a ração (${l})`,clean:l=>`Manda ${l} limpar`,dock:l=>`Manda ${l} voltar à base`};
const ACTN={on:'Ligar',off:'Desligar',open:'Abrir',close:'Fechar',feed:'Soltar ração',clean:'Limpar',dock:'Voltar à base'};
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/'/g,'&#39;');
const cap=s=>s[0].toUpperCase()+s.slice(1);
function acts(it){switch(it.k){case 'toggle':case 'ac':case 'heater':case 'tv':return ['on','off'];case 'cover':case 'gate':return ['open','close'];case 'feeder':return ['feed'];case 'vac':return ['clean','dock'];default:return []}}
const lab=(g,it)=>(PRE[g.id]?PRE[g.id]+' ':'')+it.n;
function resolve(ref){const [id,x]=ref.split(':');const g=GROUPS.find(q=>q.id===(id==='g'?x:id));if(!g)return null;if(id==='g')return {items:g.items,label:ALLN[g.id]||g.name};const it=g.items[+x];return it?{items:[it],label:lab(g,it)}:null}
function apply(act,it){
  if(act==='on')it.on=true;else if(act==='off')it.on=false;
  else if(act==='open'){if(it.k==='cover')it.pos=100;if(it.k==='gate')it.state='Aberto'}
  else if(act==='close'){if(it.k==='cover')it.pos=0;if(it.k==='gate')it.state='Fechado'}
  else if(act==='feed'){it.last='agora';it.fed=(it.fed||0)+1}else if(act==='clean')it.state='Limpando';else if(act==='dock')it.state='Na base';
}
function sceneText(sc){return sc.acts.map(a=>{const r=resolve(a.ref);return r?TXT[a.act](r.label):''}).filter(Boolean).join(' · ')}
function runScene(sc){sc.acts.forEach(a=>{const r=resolve(a.ref);if(r)r.items.filter(it=>acts(it).includes(a.act)).forEach(it=>apply(a.act,it))});toast(sc.name+': feito');RAN=sc.id;setTimeout(()=>{RAN=null;renderScenes()},1600)}
let VOICE='Alexa',POS3={},VIEW='panel',EDIT=false,NAMES=false,FILTER='all',RAN=null;
const phrase=sc=>VOICE==='Sem assistente'?sc.name:`${VOICE}, ${sc.name.toLowerCase()}`;
const TRIGS=[['time','Em um horário'],['sunset','Ao pôr do sol'],['sunrise','Ao nascer do sol'],['call','Quando o interfone tocar'],['rain','Quando começar a chover'],['door','Quando uma porta for aberta']];
const NEED={rain:'sensor de chuva',door:'sensor de porta'};
const diasTxt=d=>d.length===7?'Todos os dias':d.length?d.map(i=>DIAS[i]).join(', '):'Sem dias';
function trigTxt(r){if(r.trig==='time')return `${diasTxt(r.d)} às ${r.t}`;return TRIGS.find(x=>x[0]===r.trig)[1]}
let SCENES=[
 {id:'s1',name:'Boa noite',icon:'bulb',acts:[{ref:'g:lights',act:'off'},{ref:'g:tv',act:'off'},{ref:'g:blinds',act:'close'},{ref:'gate:0',act:'close'},{ref:'g:outside',act:'on'}]},
 {id:'s2',name:'Bom dia',icon:'sun',acts:[{ref:'g:blinds',act:'open'},{ref:'g:outside',act:'off'}]},
 {id:'s3',name:'Sair de casa',icon:'door',acts:[{ref:'g:lights',act:'off'},{ref:'g:tv',act:'off'},{ref:'g:ac',act:'off'},{ref:'g:blinds',act:'close'},{ref:'gate:0',act:'close'}]},
 {id:'s4',name:'Chuva',icon:'rain',acts:[{ref:'g:blinds',act:'close'},{ref:'g:irrig',act:'off'}]},
 {id:'s5',name:'Anoitecer',icon:'sun',acts:[{ref:'g:outside',act:'on'}]}
];
let RULES=[
 {id:'r1',on:true,trig:'sunset',scene:'s5'},
 {id:'r2',on:true,trig:'time',t:'23:30',d:ALL.slice(),scene:'s1'},
 {id:'r3',on:true,trig:'rain',scene:'s4'},
 {id:'r4',on:false,trig:'sunrise',scene:'s2'}
];
try{const c=JSON.parse(localStorage.getItem('casa.cfg')||'null');if(c){GROUPS.forEach(g=>g.items.forEach((it,i)=>{if(c.sch&&c.sch[g.id+i])it.sch=c.sch[g.id+i]}));if(c.scenes)SCENES=c.scenes;if(c.rules)RULES=c.rules;if(c.voice)VOICE=c.voice;if(c.cams)c.cams.forEach((n,i)=>{if(CAMS[i]&&n)CAMS[i].n=n});if(c.pos3)POS3=c.pos3}}catch(e){}
function renderScenes(){$('#scenes').innerHTML=SCENES.map(sc=>`<button class='scn ${RAN===sc.id?'ran':''}' data-a='srun' data-id='${sc.id}'>${ic(sc.icon||'play')}${esc(sc.name)}</button>`).join('')+`<button class='scn ghost' data-view='scenes'>Editar cenas</button><button class='scn ghost' data-view='print'>${ic('list')}Lista para imprimir</button>`}
function updateBanner(){$('#banner').hidden=!(call==='ring'&&!(open&&open.v==='call'))}
function extraTiles(){
  const rOn=RULES.filter(r=>r.on).length;
  const mk=(v,name,ico,big,lbl,src)=>`<article class='tile'><button class='open' data-view='${v}' aria-label='${name}: ${big} ${lbl}. Abrir'><span class='top'><span class='ico'>${ic(ico)}</span></span><span class='nm'>${name}</span><span class='big'>${big}</span><span class='lbl'>${lbl}</span><span class='src'>${src}</span></button></article>`;
  return mk('scenes','Cenas','play',SCENES.length,'frases de voz e botões','Alexa · Google')+mk('rules','Regras automáticas','bolt',rOn,'ativas','A casa faz sozinha');
}

/* ---------- resumo dos blocos ---------- */
function sum(g){
  const it=g.items,n=it.length;
  if(g.planned)return{big:'—',lbl:'em breve',on:false};
  if(g.call)return{big:call==='ring'?'Chamando':call==='talk'?'Em chamada':'Livre',lbl:call?'Entregador na portaria':'Sem chamadas',on:!!call,alert:call==='ring'};
  if(g.id==='gate'){const v=it[0];return{big:v.state,lbl:v.auto?`fecha sozinho em ${v.min} min`:'fechamento manual',on:v.state==='Aberto'}}
  if(g.id==='blinds'){const a=it.filter(x=>x.pos>0).length;return{big:`${a}/${n}`,lbl:'abertas',on:a>0}}
  if(g.id==='pet'){const v=it[1];return{big:v.state,lbl:`Aspirador ${v.bat}% · ração ${it[0].last}`,on:v.state==='Limpando'}}
  const a=it.filter(x=>x.on).length;
  return{big:`${a}/${n}`,lbl:g.verb||(g.id==='ac'?'ligados':g.id==='tv'?'ligadas':g.id==='pool'?'ligados':'acesas'),on:a>0};
}
function renderTiles(){
  $('#tiles').innerHTML=GROUPS.map(g=>{const s=sum(g);
    return `<article class="tile ${s.on?'active':''} ${g.planned?'planned':''} ${s.alert?'alert':''}">
      <button class="open" data-g="${g.id}" aria-label="${g.name}: ${s.big} ${s.lbl}. Abrir detalhes">
        <span class="top"><span class="ico ${s.alert?'pulse':''}">${ic(g.icon)}</span></span>
        <span class="nm">${g.name}</span><span class="big">${s.big}</span><span class="lbl">${s.lbl}</span><span class="src">${g.src}</span>
      </button>
      ${g.planned?'<span class="soon">Em breve</span>':''}
      <button class="master" data-m="${g.id}" aria-label="Desligar tudo em ${g.name}" title="Desligar tudo" ${g.allOff&&s.on?'':'hidden'}>${'<svg class="ic" viewBox="0 0 24 24"><path d="M12 3v9M6.3 6.3a8 8 0 1 0 11.4 0"/></svg>'}</button>
    </article>`}).join('')+extraTiles();
}
function stats(){
  const L=GROUPS.flatMap(g=>g.items).filter(i=>i.light&&i.on).length;
  const ac=GROUPS.find(g=>g.id==='ac').items.filter(i=>i.on).length;
  const ir=GROUPS.find(g=>g.id==='irrig').items.filter(i=>i.on).length;
  $('#stats').innerHTML=[[L,'luzes acesas'],[`${CAMS.length}/${CAMS.length}`,'câmeras online'],[ac,'ar-cond. ligados'],[ir,'irrigando']]
   .map(([b,s])=>`<div class="stat"><b>${b}</b><span>${s}</span></div>`).join('');
}

/* ---------- câmeras ---------- */
const feed=(i,c,w,h)=>{const s=window.Bridge&&Bridge.camSrc(i);return s?`<img class="feed" src="${s}" alt="">`:`<canvas data-h="${c.h}" width="${w}" height="${h}"></canvas>`};
function renderCams(){
  const el=$('#cams');
  el.innerHTML=CAMS.map((c,i)=>`<button class="cam" data-c="${i}" aria-label="Câmera ${c.n}, abrir">
    ${feed(i,c,480,270)}<span class="live"><i></i>AO VIVO</span><span class="brand">${c.b}</span><span class="name">${c.n}</span></button>`).join('');
}
function drawCams(t){
  document.querySelectorAll('canvas[data-h]').forEach(cv=>{
    const x=cv.getContext('2d'),w=cv.width,h=cv.height,hue=+cv.dataset.h;
    const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,`hsl(${hue},18%,24%)`);g.addColorStop(1,`hsl(${hue},22%,9%)`);
    x.fillStyle=g;x.fillRect(0,0,w,h);
    x.fillStyle=`hsla(${hue},15%,35%,.5)`;x.fillRect(0,h*.62,w,h*.38);
    x.fillStyle=`hsla(${hue},20%,14%,.9)`;
    for(let i=0;i<4;i++)x.fillRect(40+i*110,h*.3+(i%2)*14,70,h*.32);
    for(let i=0;i<60;i++){x.fillStyle=`rgba(255,255,255,${Math.random()*.05})`;x.fillRect(Math.random()*w,Math.random()*h,2,2)}
    x.fillStyle='rgba(255,255,255,.05)';x.fillRect(0,(t/20)%h,w,3);
  });
  requestAnimationFrame(drawCams);
}

/* ---------- camada de detalhes ---------- */
const sw=(on,attrs)=>`<button class="swb" aria-pressed="${!!on}" ${attrs}><span class="sw"></span></button>`;
function rowHTML(g,i){
  const it=g.items[i],a=`data-g="${g.id}" data-i="${i}"`;
  switch(it.k){
   case 'toggle':return `<div class="row"><div class="info"><b>${it.n}</b><span>${it.sub||''}</span></div><div class="ctl">${sw(it.on,`data-a="tg" ${a}`)}</div></div>`;
   case 'cover':return `<div class="row"><div class="info"><b>${it.n}</b><span>${it.pos===0?'Fechada':it.pos===100?'Aberta':'Aberta '+it.pos+'%'}</span></div>
     <div class="ctl"><button class="btn" data-a="cv" data-v="100" ${a}>Abrir</button><button class="btn" data-a="cv" data-v="${it.pos}" ${a}>Parar</button><button class="btn" data-a="cv" data-v="0" ${a}>Fechar</button>
     <input type="range" min="0" max="100" step="10" value="${it.pos}" data-a="cvr" ${a} aria-label="Abertura ${it.n}"></div></div>`;
   case 'ac':return `<div class="row"><div class="info"><b>${it.n}</b><span>${it.b} · ${it.on?'Ligado, modo frio':'Desligado'}</span></div>
     <div class="ctl"><button class="btn" data-a="t-" ${a} ${it.on?'':'disabled'} aria-label="Diminuir">−</button><span class="val">${it.t}°</span><button class="btn" data-a="t+" ${a} ${it.on?'':'disabled'} aria-label="Aumentar">+</button>${sw(it.on,`data-a="tg" ${a}`)}</div></div>`;
   case 'heater':return `<div class="row"><div class="info"><b>${it.n}</b><span>${it.on?'Aquecendo · água '+it.cur+'° · meta '+it.t+'°':'Desligado · água '+it.cur+'°'}</span></div><div class="ctl"><button class="btn" data-a="t-" ${a} aria-label="Diminuir meta">−</button><span class="val">${it.t}°</span><button class="btn" data-a="t+" ${a} aria-label="Aumentar meta">+</button>${sw(it.on,`data-a="tg" ${a}`)}</div></div>`;
   case 'gate':return `<div class='row'><div class='info'><b>${it.n}</b><span>${it.state}</span></div><div class='ctl'><button class='btn primary' data-a='gt' data-v='Aberto' ${a}>Abrir</button><button class='btn' data-a='gt' data-v='${it.state}' ${a}>Parar</button><button class='btn' data-a='gt' data-v='Fechado' ${a}>Fechar</button></div></div>
     <div class='row'><div class='info'><b>Fechar sozinho</b><span>Fecha o portão depois de ${it.min} min aberto</span></div><div class='ctl'><label class='fld'>Minutos<input type='number' inputmode='numeric' min='1' max='60' value='${it.min}' data-a='gmin' ${a}></label>${sw(it.auto,`data-a='gauto' ${a}`)}</div></div>`;
   case 'tv':return `<div class="row"><div class="info"><b>${it.n}</b><span>${it.b} · ${it.on?'Ligada':'Desligada'}</span></div>
     <div class="ctl"><input type="range" min="0" max="50" value="${it.vol}" ${it.on?'':'disabled'} data-a="vol" ${a} aria-label="Volume ${it.n}"><span class="val">${it.vol}</span>${sw(it.on,`data-a="tg" ${a}`)}</div></div>`;
   case 'feeder':return `<div class="row"><div class="info"><b>${it.n}</b><span>Última porção hoje às ${it.last}</span></div><div class="ctl"><button class="btn primary" data-a="feed" ${a}>Soltar ração</button></div></div>`;
   case 'vac':return `<div class="row"><div class="info"><b>${it.n}</b><span>${it.state} · bateria ${it.bat}%</span></div>
     <div class="ctl"><button class="btn primary" data-a="vac" data-v="Limpando" ${a}>Limpar</button><button class="btn" data-a="vac" data-v="Na base" ${a}>Voltar à base</button></div></div>`;
   case 'plan':return `<div class="row"><div class="info"><b>${it.n}</b><span>${it.sub}</span></div><span class="pill">Não instalado</span></div>`;
   case 'call':return `<div class="row"><div class="who ctl"><div class="avatar ${call?'pulse':''}">E</div><div class="info"><b>${call?'Entregador':'Sem chamadas'}</b><span>${call?'Portaria · tocando agora':'Última chamada atendida às 08:12'}</span></div></div>
     <div class="ctl"><button class="btn primary" data-a="ans" ${call?'':'disabled'}>Atender</button><button class="btn" data-a="gate">Abrir portão</button><button class="btn danger" data-a="dis" ${call?'':'disabled'}>Recusar</button></div></div>`;
  }
}
function editorHTML(it,a){
  const rows=it.sch.map((s,j)=>`<div class="sched"><div class="days" role="group" aria-label="Dias da semana">${DIAS.map((n,d)=>`<button class="chip" aria-pressed="${s.d.includes(d)}" data-a="sd" data-j="${j}" data-v="${d}" ${a}>${n}</button>`).join('')}</div>
   <div class="ctl"><label class="fld">Hora<input type="time" value="${s.t}" data-a="st" data-j="${j}" ${a}></label>
   ${it.sk==='dur'?`<label class="fld">Duração (min)<input type="number" inputmode="numeric" min="1" max="720" value="${s.m}" data-a="sm" data-j="${j}" ${a}></label>`:''}
   ${it.sk==='cover'?`<label class="fld">Ação<select data-a="sa" data-j="${j}" ${a}><option ${s.a==='Abrir'?'selected':''}>Abrir</option><option ${s.a==='Fechar'?'selected':''}>Fechar</option></select></label>`:''}
   ${sw(s.on,`data-a="son" data-j="${j}" ${a}`)}<button class="btn small danger" data-a="sx" data-j="${j}" ${a}>Remover</button></div></div>`).join('');
  return `<div class="edfoot">${rows}<div><button class="btn small" data-a="sadd" ${a}>+ Adicionar horário</button></div><span class="note" style="padding:0">Neste protótipo os horários ficam salvos só neste aparelho e ainda não acionam nada.</span></div>`;
}
function itemHTML(g,i){
  const it=g.items[i],r=rowHTML(g,i);
  if(!it.sk)return `<div class="item">${r}</div>`;
  const ed=open.ed===g.id+i,a=`data-g="${g.id}" data-i="${i}"`;
  return `<div class="item">${r}<div class="schline"><span>⏱ ${schTxt(it)||'Sem programação'}</span><button class="btn small" data-a="ed" ${a} aria-expanded="${ed}">${ed?'Fechar':'Programar'}</button></div>${ed?editorHTML(it,a):''}</div>`;
}
function renderLayer(){
  if(!open)return;
  if(open.v)return renderView();
  if(open.cam!==undefined){
    const c=CAMS[open.cam];
    $('#li').innerHTML=ic('robot').replace(IC.robot,'M3 7h12v10H3zM15 11l6-3v8l-6-3z');
    $('#lt').textContent=c.n;$('#ls').textContent=c.b;
    $('#lb').innerHTML=`<div class="bigcam">${feed(open.cam,c,960,540)}</div>
     <div class='row'><label class='fld' style='flex:1 1 220px'>Nome da câmera (onde ela está)<input type='text' maxlength='24' style='width:100%' value='${esc(c.n)}' data-a='cname'></label></div>
     <div class="row"><div class="info"><b>Gravar por movimento</b><span>Cartão microSD · ${c.used}% usado</span></div><div class="ctl">${sw(c.rec,'data-a="rec"')}</div></div>
     <div class="row"><div class="info"><b>Origem</b><span>${c.b==='Intelbras'?'App Intelbras Guardian':'App Tapo (TP-Link)'}</span></div><span class="pill">Online</span></div>`;
    return;
  }
  const g=GROUPS.find(x=>x.id===open.g);
  $('#li').innerHTML=ic(g.icon);$('#lt').textContent=g.name;$('#ls').textContent=g.src;
  $('#lb').innerHTML=g.items.map((_,i)=>itemHTML(g,i)).join('')+(g.planned?'<p class="note">Estes itens ainda não existem na casa. Quando os sensores forem instalados, aparecem aqui e no bloco da tela principal.</p>':'');
}
const opt=(v,t,s)=>`<option value='${v}' ${s?'selected':''}>${t}</option>`;
const back=(a,t)=>`<div class='item noprint'><div class='row'><button class='btn small' data-a='${a}'>← ${t}</button></div></div>`;
function targetOpts(sel){return GROUPS.map(g=>{const o=(ALLN[g.id]?opt('g:'+g.id,cap(ALLN[g.id]),sel==='g:'+g.id):'')+g.items.map((it,i)=>acts(it).length?opt(g.id+':'+i,esc(lab(g,it)),sel===g.id+':'+i):'').join('');return o?`<optgroup label='${esc(g.name)}'>${o}</optgroup>`:''}).join('')}

function callHTML(){
  const gt=gi('gate')[0];
  const st=call==='ring'?'Entregador está chamando':call==='talk'?'Em conversa com a portaria':'Sem chamadas';
  const det=call==='talk'?`<span id='ctimer'>00:00</span> · portão ${gt.state.toLowerCase()}`:call==='ring'?'Toque em Atender para falar':'Última chamada atendida às 08:12';
  const ctl=call==='ring'?`<button class='btn big primary' data-a='ans'>Atender</button><button class='btn big' data-a='gate'>Abrir portão</button><button class='btn big danger' data-a='dis'>Recusar</button>`
   :call==='talk'?`<button class='btn big ${mic?'primary':''}' data-a='mic'>${ic('mic')}${mic?'Microfone ligado':'Microfone desligado'}</button><button class='btn big' data-a='spk'>Som: ${spk?'ligado':'desligado'}</button><button class='btn big' data-a='gate'>Abrir portão</button><button class='btn big danger' data-a='end'>Encerrar</button>`
   :`<button class='btn big' data-a='gate'>Abrir portão</button><button class='btn big' data-a='sim'>Simular nova chamada</button>`;
  return `<div class='bigcam'><canvas data-h='205' width='960' height='540'></canvas><span class='live'><i></i>${call?'AO VIVO':'PORTARIA'}</span><span class='nm2'>Câmera do interfone</span></div>
  <div class='row'><div class='ctl'><div class='avatar ${call==='ring'?'pulse':''}'>${call?'E':'–'}</div><div class='info'><b>${st}</b><span>${det}</span></div></div></div>
  <div class='row'><div class='ctl'>${ctl}</div></div>
  ${call==='talk'&&mic?`<div class='meter' aria-hidden='true'><i></i><i></i><i></i><i></i><i></i></div>`:''}
  <p class='note'>Neste protótipo imagem e voz são simuladas. Na versão real, vêm do próprio interfone.</p>`;
}
function scenesHTML(){
  return `<div class='item'><div class='row'><div class='info'><b>Quem escuta as frases</b><span>Mude conforme o assistente da casa</span></div><label class='fld'>Assistente<select style='width:150px' data-a='voice'>${['Alexa','Ok Google','Sem assistente'].map(x=>opt(x,x,x===VOICE)).join('')}</select></label></div></div>`
  +SCENES.map(sc=>`<div class='item'><div class='row'><div class='info'><b>“${esc(phrase(sc))}”</b><span>${esc(sceneText(sc))||'Sem ações ainda'}</span></div><div class='ctl'><button class='btn primary' data-a='srun' data-id='${sc.id}'>Executar</button><button class='btn' data-a='sed' data-id='${sc.id}'>Editar</button></div></div></div>`).join('')
  +`<div class='row'><div class='ctl'><button class='btn' data-a='snew'>+ Nova cena</button><button class='btn' data-a='vprint'>Lista para imprimir</button><button class='btn' data-a='vrules'>Regras automáticas</button></div></div>`;
}
function sceneEditHTML(sc){
  const id=sc.id;
  return back('vscenes','Todas as cenas')
  +`<div class='item'><div class='row'><label class='fld' style='flex:1 1 220px'>Nome da cena (vira a frase)<input type='text' maxlength='30' style='width:100%' value='${esc(sc.name)}' data-a='sname' data-id='${id}'></label></div><div class='schline'><span id='pph'>Frase: “${esc(phrase(sc))}”</span></div></div>`
  +sc.acts.map((a,j)=>{const r=resolve(a.ref),l=r?acts(r.items[0]):[];
    return `<div class='item'><div class='row' style='align-items:flex-end'><label class='fld' style='flex:1 1 200px'>Dispositivo<select style='width:100%' data-a='aref' data-id='${id}' data-j='${j}'>${targetOpts(a.ref)}</select></label><label class='fld'>Ação<select style='width:130px' data-a='aact' data-id='${id}' data-j='${j}'>${l.map(x=>opt(x,ACTN[x],x===a.act)).join('')}</select></label><button class='btn small danger' data-a='adel' data-id='${id}' data-j='${j}'>Remover</button></div></div>`}).join('')
  +`<div class='row'><div class='ctl'><button class='btn' data-a='aadd' data-id='${id}'>+ Adicionar ação</button><button class='btn primary' data-a='srun' data-id='${id}'>Testar agora</button><button class='btn danger' data-a='sdel' data-id='${id}'>Excluir cena</button></div></div>`;
}
function rulesHTML(){
  return RULES.map(r=>{const sc=SCENES.find(s=>s.id===r.scene);return `<div class='item'><div class='row'><div class='info'><b>${trigTxt(r)}</b><span>Faz: ${sc?esc(sc.name):'(cena removida)'}${NEED[r.trig]?' · aguardando '+NEED[r.trig]:''}</span></div><div class='ctl'>${sw(r.on,`data-a='ron' data-id='${r.id}'`)}<button class='btn small' data-a='red' data-id='${r.id}'>Editar</button></div></div></div>`}).join('')
  +`<div class='row'><div class='ctl'><button class='btn' data-a='rnew'>+ Nova regra</button><button class='btn' data-a='vscenes'>Cenas</button><button class='btn' data-a='vprint'>Lista para imprimir</button></div></div><p class='note'>Neste protótipo as regras ainda não rodam sozinhas. Na versão real, rodam no Home Assistant, mesmo com o tablet desligado.</p>`;
}
function ruleEditHTML(r){
  const id=r.id,time=r.trig==='time';
  return back('vrules','Todas as regras')
  +`<div class='item'><div class='row' style='align-items:flex-end'><label class='fld'>Quando<select style='width:260px;max-width:100%' data-a='rtrig' data-id='${id}'>${TRIGS.map(([v,t])=>opt(v,t+(NEED[v]?' (precisa de '+NEED[v]+')':''),v===r.trig)).join('')}</select></label>${time?`<label class='fld'>Hora<input type='time' value='${r.t}' data-a='rt' data-id='${id}'></label>`:''}</div>`
  +(time?`<div class='days' style='padding:0 0 12px'>${DIAS.map((n,d)=>`<button class='chip' aria-pressed='${r.d.includes(d)}' data-a='rd' data-id='${id}' data-v='${d}'>${n}</button>`).join('')}</div>`:'')+`</div>`
  +`<div class='item'><div class='row'><label class='fld'>Então executar a cena<select style='width:260px;max-width:100%' data-a='rscene' data-id='${id}'>${SCENES.map(s=>opt(s.id,esc(s.name),s.id===r.scene)).join('')}</select></label></div></div>`
  +`<div class='row'><button class='btn danger' data-a='rdel' data-id='${id}'>Excluir regra</button></div>`;
}
function printHTML(){
  const scn=SCENES.map(sc=>`<div class='pcard'><div class='pph'>“${esc(phrase(sc))}”</div><ul>${sc.acts.map(a=>{const r=resolve(a.ref);return r?`<li>${TXT[a.act](r.label)}</li>`:''}).join('')||'<li>(sem ações)</li>'}</ul></div>`).join('');
  const ru=RULES.filter(r=>r.on).map(r=>{const sc=SCENES.find(s=>s.id===r.scene);return sc?`<li><b>${trigTxt(r)}:</b> ${esc(sc.name)} — ${esc(sceneText(sc))}</li>`:''}).join('');
  return `<div class='noprint'>${back('vscenes','Cenas')}<p class='note'>Para imprimir, use o menu do navegador (Imprimir) ou tire uma captura da tela.</p></div><h2 class='ptitle'>Frases da casa</h2>${scn}<h2 class='ptitle'>O que a casa faz sozinha</h2><ul class='plist'>${ru||'<li>Nada por enquanto</li>'}</ul>`;
}
function renderView(){
  const v=open.v;let ico='play',title='',sub='',html='';
  if(v==='call'){ico='bell';title='Interfone';sub='Allo Plus · portaria';html=callHTML()}
  else if(v==='scenes'){title='Cenas';sub='Um toque ou uma frase de voz faz várias coisas de uma vez';html=scenesHTML()}
  else if(v==='scene'){const sc=SCENES.find(s=>s.id===open.id);title=sc.name;sub='Editar cena';html=sceneEditHTML(sc)}
  else if(v==='rules'){ico='bolt';title='Regras automáticas';sub='A casa faz sozinha, sem ninguém tocar';html=rulesHTML()}
  else if(v==='rule'){ico='bolt';title='Editar regra';sub='Quando acontecer isso, faz aquilo';html=ruleEditHTML(RULES.find(r=>r.id===open.id))}
  else if(v==='conn'){ico='bolt';title='Conexão';sub='Home Assistant e vínculos dos dispositivos';html=Bridge.html()}
  else if(v==='room'){const f=FLOORS[open.i];ico='bulb';title=f[0];sub=f[4]?f[4]+' m²':'Passagem';html=roomHTML(open.i)}
  else if(v==='print'){ico='list';title='Lista para imprimir';html=printHTML()}
  $('#li').innerHTML=ic(ico);$('#lt').textContent=title;$('#ls').textContent=sub;$('#lb').innerHTML=html;
}
function viewAct(a,t){
  if(window.Bridge&&Bridge.viewAct(a,t))return true;
  const id=t.dataset.id,sc=SCENES.find(s=>s.id===id),ru=RULES.find(r=>r.id===id),j=+t.dataset.j;
  switch(a){
    case 'rfocus':focusRoom(+t.dataset.i);closeLayer();return true;
    case 'srun':runScene(sc);return true;
    case 'sed':open={v:'scene',id};return true;
    case 'snew':{const n={id:'s'+Date.now(),name:'Nova cena',icon:'play',acts:[]};SCENES.push(n);open={v:'scene',id:n.id};return true}
    case 'sdel':SCENES=SCENES.filter(s=>s.id!==id);RULES.forEach(r=>{if(r.scene===id)r.scene=SCENES[0]&&SCENES[0].id});open={v:'scenes'};return true;
    case 'aadd':sc.acts.push({ref:'g:lights',act:'off'});return true;
    case 'adel':sc.acts.splice(j,1);return true;
    case 'vscenes':open={v:'scenes'};return true;
    case 'vrules':open={v:'rules'};return true;
    case 'vprint':open={v:'print'};return true;
    case 'rnew':{const n={id:'r'+Date.now(),on:true,trig:'time',t:'07:00',d:ALL.slice(),scene:SCENES[0]&&SCENES[0].id};RULES.push(n);open={v:'rule',id:n.id};return true}
    case 'red':open={v:'rule',id};return true;
    case 'rdel':RULES=RULES.filter(r=>r.id!==id);open={v:'rules'};return true;
    case 'ron':ru.on=!ru.on;return true;
    case 'rd':{const d=+t.dataset.v;ru.d=ru.d.includes(d)?ru.d.filter(x=>x!==d):[...ru.d,d].sort();return true}
    case 'ans':call='talk';mic=true;t0=Date.now();if(!open||open.v!=='call'){open={v:'call'};$('#layer').hidden=false}return true;
    case 'dis':call=false;return true;
    case 'end':call=false;toast('Chamada encerrada');return true;
    case 'mic':mic=!mic;return true;
    case 'spk':spk=!spk;return true;
    case 'sim':call='ring';return true;
    case 'gate':gi('gate')[0].state='Aberto';toast('Portão aberto');return true;
  }
  return false;
}
function viewInput(a,t){
  if(window.Bridge&&Bridge.viewInput(a,t))return true;
  const sc=SCENES.find(s=>s.id===t.dataset.id),ru=RULES.find(r=>r.id===t.dataset.id),j=+t.dataset.j;
  switch(a){
    case 'voice':VOICE=t.value;save();renderLayer();renderScenes();return true;
    case 'sname':{sc.name=t.value;const p=$('#pph');if(p)p.textContent='Frase: “'+phrase(sc)+'”';$('#lt').textContent=sc.name||'Cena';save();renderScenes();return true}
    case 'aref':{sc.acts[j].ref=t.value;const r=resolve(t.value),l=r?acts(r.items[0]):[];if(!l.includes(sc.acts[j].act))sc.acts[j].act=l[0];save();renderLayer();return true}
    case 'aact':sc.acts[j].act=t.value;save();return true;
    case 'rtrig':{ru.trig=t.value;if(t.value==='time'&&!ru.t){ru.t='07:00';ru.d=ALL.slice()}save();renderLayer();renderTiles();return true}
    case 'rt':ru.t=t.value;save();return true;
    case 'rscene':ru.scene=t.value;save();return true;
    case 'cname':{const c=CAMS[open.cam];c.n=t.value;$('#lt').textContent=c.n||'Câmera';save();renderCams();if(VIEW==='plan')renderPlan();return true}
  }
  return false;
}

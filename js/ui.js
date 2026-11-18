function openLayer(o){open=o;$('#layer').hidden=false;renderLayer();updateBanner();$('#lx').focus()}
function closeLayer(){open=null;$('#layer').hidden=true;updateBanner()}
function toast(t){const e=$('#toast');e.textContent=t;e.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>e.hidden=true,1800)}
const refresh=()=>{save();renderTiles();renderScenes();stats();renderLayer();updateBanner();if(VIEW==='plan')renderPlan();if(window.Bridge)Bridge.afterRefresh()};

document.addEventListener('click',e=>{
  const t=e.target.closest('button');if(!t)return;
  if(t.id==='lx')return closeLayer();
  if(t.dataset.c!==undefined)return openLayer({cam:+t.dataset.c});
  if(t.dataset.view)return openLayer({v:t.dataset.view});
  if(t.dataset.g&&t.classList.contains('open'))return openLayer(t.dataset.g==='call'?{v:'call'}:{g:t.dataset.g});
  if(t.dataset.m){GROUPS.find(g=>g.id===t.dataset.m).items.forEach(i=>i.on=false);toast('Tudo desligado');return refresh()}
  const a=t.dataset.a;if(!a)return;
  if(viewAct(a,t))return refresh();
  const g=GROUPS.find(x=>x.id===t.dataset.g),it=g&&g.items[+t.dataset.i];
  if(a==='tg')it.on=!it.on;
  else if(a==='cv'){it.pos=+t.dataset.v}
  else if(a==='ed'){const k=g.id+t.dataset.i;open.ed=open.ed===k?null:k}
  else if(a==='sd'){const s=it.sch[+t.dataset.j],d=+t.dataset.v;s.d=s.d.includes(d)?s.d.filter(x=>x!==d):[...s.d,d].sort()}
  else if(a==='son'){const s=it.sch[+t.dataset.j];s.on=!s.on}
  else if(a==='sx'){it.sch.splice(+t.dataset.j,1)}
  else if(a==='sadd'){it.sch.push({d:[1,2,3,4,5],t:'06:00',m:15,a:'Abrir',on:true})}
  else if(a==='t-')it.t=Math.max(it.k==='heater'?20:16,it.t-1);
  else if(a==='t+')it.t=Math.min(it.k==='heater'?34:30,it.t+1);
  else if(a==='feed'){it.last='agora';it.fed=(it.fed||0)+1;toast('Ração liberada')}
  else if(a==='vac'){it.state=t.dataset.v}
  else if(a==='gt'){it.state=t.dataset.v}
  else if(a==='gauto'){it.auto=!it.auto}
  else if(a==='rec'){CAMS[open.cam].rec=!CAMS[open.cam].rec}
  refresh();
});
document.addEventListener('input',e=>{
  const t=e.target,a=t.dataset.a;if(!a)return;
  if(viewInput(a,t))return;
  const g=GROUPS.find(x=>x.id===t.dataset.g),it=g.items[+t.dataset.i];
  if(a==='vol'){it.vol=+t.value;t.nextElementSibling.textContent=t.value;if(window.Bridge)Bridge.soon()}
  if(a==='gmin'){it.min=Math.max(1,+t.value||1);t.closest('.row').querySelector('.info span').textContent='Fecha o portão depois de '+it.min+' min aberto';save()}
  if(a==='st'||a==='sm'||a==='sa'){const s=it.sch[+t.dataset.j];if(a==='st')s.t=t.value;if(a==='sm')s.m=Math.max(1,+t.value||1);if(a==='sa')s.a=t.value;t.closest('.item').querySelector('.schline span').textContent='⏱ '+(schTxt(it)||'Sem programação');save()}
  if(a==='cvr'){it.pos=+t.value;if(window.Bridge)Bridge.soon();renderTiles();t.closest('.row').querySelector('.info span').textContent=it.pos===0?'Fechada':it.pos===100?'Aberta':'Aberta '+it.pos+'%'}
});
$('#layer').addEventListener('click',e=>{if(e.target.id==='layer')closeLayer()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeLayer()});

function tick(){$('#clock').textContent=new Date().toLocaleString('pt-BR',{weekday:'long',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'})}
tick();setInterval(tick,30000);
setInterval(()=>{const e=document.getElementById('ctimer');if(e&&call==='talk'){const s=Math.floor((Date.now()-t0)/1000);e.textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}},1000);
renderCams();refresh();requestAnimationFrame(drawCams);
setView(location.hash==='#planta'?'plan':'panel');
if(window.Bridge)Bridge.start();

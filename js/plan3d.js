/* ---------- planta 3D da casa (baseada na planta enviada) ---------- */
const PXM=46.5,PX0=68,PZ0=815;
const mx=p=>(p-PX0)/PXM,mz=p=>(p-PZ0)/PXM;
const wx=x=>x*PXM+PX0,wz=z=>z*PXM+PZ0;
let OPS=OPS0.map(o=>Object.assign({},o)),SEL=null,EDITM='dev';
try{const c=JSON.parse(localStorage.getItem('casa.cfg')||'null');if(c&&c.ops&&c.ops.length&&c.planVer===PLAN_VER)OPS=c.ops}catch(e){}
const FLOORS=[
 ['Banho social',[80,822,170,940],'#8fa6ad',null,'5,00'],['Depósito',[80,948,166,1082],'#a9a79f',null,'6,00'],['Área para varal',[70,1092,170,1212],'#aaa99f',null,'5,59'],
 ['Lavanderia',[80,1216,166,1340],'#8fa6ad',null,'4,99'],['Despensa',[80,1346,166,1462],'#a9a79f',null,'4,99'],
 ['Área gourmet',[182,822,424,1212],'#9a7650','lights:2','44,49'],['Cozinha',[182,1224,424,1462],'#b9b2a4','lights:1','26,08'],
 ['Sala de estar',[228,1468,424,1716],'#8a6446','lights:0','23,01'],['Lavabo',[150,1470,214,1594],'#8fa6ad',null,'1,88'],
 ['Escritório',[80,1598,212,1714],'#7d5f48','lights:4','7,35'],['Corredor',[436,1090,474,1440],'#7c5d44','lights:3',''],
 ['Suíte 3',[436,822,625,986],'#7d5f48','lights:7','17,02'],['Banho',[487,998,625,1062],'#8fa6ad',null,'4,39'],['Suíte 2',[488,1070,625,1264],'#7d5f48','lights:6','12,45'],
 ['Banho',[487,1278,625,1342],'#8fa6ad',null,'4,39'],['Banho',[487,1352,625,1422],'#8fa6ad',null,'4,39'],['Suíte 1',[436,1430,625,1596],'#7d5f48','lights:5','15,45'],
 ['Garagem',[440,1600,702,1925],'#7d838a','outside:1','30,17']
];
const FURN=[
 [522,858,600,905,.5,'#ece8df'],[548,1185,620,1260,.5,'#ece8df'],[516,1510,596,1588,.5,'#ece8df'],
 [232,1535,284,1650,.8,'#4a6fa5'],[283,1545,365,1640,.4,'#8a6a4a'],[267,1480,312,1530,.8,'#4a6fa5'],[268,1653,312,1705,.8,'#4a6fa5'],
 [255,1260,336,1372,.9,'#8d949b'],[180,1220,205,1420,.9,'#cfcabd'],
 [280,850,346,965,.95,'#8d949b'],[278,995,355,1130,.75,'#6b4a31'],[396,945,422,1012,.9,'#cfcabd'],[386,858,426,938,2,'#b9b5ab'],
 [465,1630,545,1795,.9,'#aeb6bf'],[580,1630,660,1795,.9,'#aeb6bf'],
 [88,1630,176,1660,.75,'#6b4a31']
];
const MK=[
 {r:'lights:0',x:330,y:1590,c:'luz'},{r:'lights:1',x:300,y:1330,c:'luz'},{r:'lights:2',x:300,y:1000,c:'luz'},{r:'lights:3',x:455,y:1250,c:'luz'},
 {r:'lights:4',x:140,y:1660,c:'luz'},{r:'lights:5',x:555,y:1500,c:'luz'},{r:'lights:6',x:590,y:1160,c:'luz'},{r:'lights:7',x:555,y:880,c:'luz'},
 {r:'blinds:0',x:625,y:1470,c:'pers'},{r:'blinds:1',x:625,y:1150,c:'pers'},{r:'blinds:2',x:625,y:930,c:'pers'},
 {r:'ac:0',x:390,y:1530,c:'clima'},{r:'ac:1',x:520,y:1450,c:'clima'},{r:'ac:2',x:520,y:1100,c:'clima'},{r:'ac:3',x:520,y:850,c:'clima'},{r:'ac:4',x:185,y:1630,c:'clima'},
 {r:'tv:0',x:240,y:1500,c:'clima'},{r:'tv:1',x:590,y:1560,c:'clima'},
 {r:'pool:0',x:323,y:634,c:'ext'},{r:'pool:1',x:190,y:600,c:'ext'},{r:'pool:2',x:330,y:530,c:'ext'},{r:'pool:3',x:455,y:640,c:'ext'},
 {r:'outside:0',x:330,y:1735,c:'ext'},{r:'outside:1',x:560,y:1650,c:'ext'},{r:'outside:2',x:200,y:1850,c:'ext'},{r:'outside:3',x:500,y:300,c:'ext'},{r:'outside:4',x:130,y:650,c:'ext'},
 {r:'irrig:0',x:350,y:1840,c:'ext'},{r:'irrig:1',x:330,y:340,c:'ext'},{r:'irrig:2',x:130,y:430,c:'ext'},
 {r:'gate:0',x:520,y:1915,c:'out'},{r:'call:0',x:450,y:1900,c:'out'},{r:'pet:0',x:120,y:1400,c:'out'},{r:'pet:1',x:360,y:1380,c:'out'},
 {r:'cam:0',x:300,y:1905,c:'cam'},{r:'cam:1',x:600,y:1640,c:'cam'},{r:'cam:2',x:400,y:1735,c:'cam'},{r:'cam:3',x:450,y:300,c:'cam'},
 {r:'cam:4',x:450,y:700,c:'cam'},{r:'cam:5',x:170,y:460,c:'cam'},{r:'cam:6',x:400,y:1480,c:'cam'},{r:'cam:7',x:200,y:1250,c:'cam'}
];
let T3=null,WALLH=1.1,ORIG=false,SPIN=false;
const matCache={};
function mat3(c,o){const k=c+JSON.stringify(o||{});return matCache[k]||(matCache[k]=new THREE.MeshLambertMaterial(Object.assign({color:c},o||{})))}
function bx(x0,y0,x1,y1,h,c,y,o,shadow){
  const g=new THREE.BoxGeometry((x1-x0)/PXM,h,(y1-y0)/PXM);g.translate(0,h/2,0);
  const m=new THREE.Mesh(g,mat3(c,o));m.position.set(mx((x0+x1)/2),y||0,mz((y0+y1)/2));
  m.castShadow=shadow!==false;m.receiveShadow=true;return m;
}
function hedge(a,b,c,d){
  const dx=(c-a)/PXM,dz=(d-b)/PXM,L=Math.hypot(dx,dz);
  const g=new THREE.BoxGeometry(L,1.1,.7);g.translate(0,.55,0);const m=new THREE.Mesh(g,mat3('#2f6e3f'));
  m.position.set(mx((a+c)/2),0,mz((b+d)/2));m.rotation.y=-Math.atan2(dz,dx);m.castShadow=true;return m;
}
function palm(px,py){
  const gr=new THREE.Group();gr.position.set(mx(px),0,mz(py));
  const tr=new THREE.Mesh(new THREE.CylinderGeometry(.14,.2,4,8),mat3('#6b4d34'));tr.position.y=2;tr.castShadow=true;gr.add(tr);
  for(let i=0;i<8;i++){
    const p=new THREE.Group();p.position.y=4;p.rotation.y=i*Math.PI/4;
    const l=new THREE.Mesh(new THREE.BoxGeometry(2.6,.06,.5),mat3(i%2?'#3f8a4c':'#52a55e'));l.position.x=1.2;l.rotation.z=-.4;l.castShadow=true;p.add(l);gr.add(p);
  }
  return gr;
}
/* aberturas: t = p (porta), j (janela), v (vão livre), x (parede fechada) */
const {opRect,opHoriz,subRect,snapToWall}=Logic;
function rebuildWalls(){
  const g=T3.walls;
  while(g.children.length){const c=g.children[0];g.remove(c);if(c.geometry)c.geometry.dispose()}
  const WC='#dcd6ca';let pieces=WALLS.map(r=>r.slice());
  OPS.forEach(o=>{if(o.t==='x')return;const r=opRect(o),h=opHoriz(o)?[r[0],r[1]-3,r[2],r[3]+3]:[r[0]-3,r[1],r[2]+3,r[3]];pieces=pieces.flatMap(p=>subRect(p,h))});
  pieces.forEach(r=>g.add(bx(r[0],r[1],r[2],r[3],2.7,WC)));
  OPS.forEach(o=>{
    const r=opRect(o),H=opHoriz(o),mid=H?(r[1]+r[3])/2:(r[0]+r[2])/2;
    if(o.t==='x'){g.add(bx(r[0],r[1],r[2],r[3],2.7,WC));return}
    if(o.t==='j'){
      g.add(bx(r[0],r[1],r[2],r[3],.9,WC));g.add(bx(r[0],r[1],r[2],r[3],.6,WC,2.1));
      const t=H?[r[0],mid-2,r[2],mid+2]:[mid-2,r[1],mid+2,r[3]];
      g.add(bx(t[0],t[1],t[2],t[3],1.2,'#a9d6ea',.9,{transparent:true,opacity:.35},false));return;
    }
    g.add(bx(r[0],r[1],r[2],r[3],.6,WC,2.1));
    if(o.t==='p'){const t=H?[r[0]+1,mid-2,r[2]-1,mid+2]:[mid-2,r[1]+1,mid+2,r[3]-1];g.add(bx(t[0],t[1],t[2],t[3],2.1,'#b08457'))}
  });
}
function init3D(){
  if(T3)return T3;
  const st=$('#stage');
  if(!window.THREE||!THREE.OrbitControls){st.innerHTML='<p class="note" style="padding:24px">Não foi possível carregar o 3D neste aparelho. Verifique a internet e abra a página de novo.</p>';return null}
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  st.innerHTML='';st.appendChild(renderer.domElement);
  const lay=document.createElement('div');lay.className='mks';lay.id='mks';st.appendChild(lay);
  const pan=document.createElement('div');pan.className='oppanel';pan.id='opPanel';pan.hidden=true;st.appendChild(pan);
  const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(38,1,.5,500);
  const ctl=new THREE.OrbitControls(cam,renderer.domElement);
  ctl.enableDamping=true;ctl.dampingFactor=.08;ctl.maxPolarAngle=1.5;ctl.minDistance=5;ctl.maxDistance=90;ctl.autoRotateSpeed=1.6;
  const center=new THREE.Vector3(mx(330),0,mz(1050));ctl.target.copy(center);
  scene.add(new THREE.HemisphereLight(0xdfe8f5,0x2a3340,.8));
  const sun=new THREE.DirectionalLight(0xfff1dc,.85);sun.position.set(center.x-16,38,center.z+22);sun.target.position.copy(center);
  sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);const sc=sun.shadow.camera;sc.left=-36;sc.right=36;sc.top=36;sc.bottom=-36;sc.near=1;sc.far=130;
  scene.add(sun,sun.target);
  const base=new THREE.Mesh(new THREE.PlaneGeometry(320,320),mat3('#161c22'));base.rotation.x=-Math.PI/2;base.position.y=-.03;base.receiveShadow=true;scene.add(base);
  const POOL=[216,551,430,718];
  const lot=new THREE.Shape();[[68,25],[690,515],[745,1925],[68,1925]].forEach((p,i)=>i?lot.lineTo(mx(p[0]),-mz(p[1])):lot.moveTo(mx(p[0]),-mz(p[1])));
  const hole=new THREE.Path();[[POOL[0],POOL[1]],[POOL[2],POOL[1]],[POOL[2],POOL[3]],[POOL[0],POOL[3]]].forEach((p,i)=>i?hole.lineTo(mx(p[0]),-mz(p[1])):hole.moveTo(mx(p[0]),-mz(p[1])));
  lot.holes.push(hole);
  const lg=new THREE.ShapeGeometry(lot);lg.rotateX(-Math.PI/2);const lawn=new THREE.Mesh(lg,mat3('#2c5a3a'));lawn.receiveShadow=true;scene.add(lawn);
  scene.add(bx(68,100,460,505,.04,'#3f8c4c',0,null,false),bx(125,1785,360,1900,.07,'#3f8c4c',0,null,false));
  [[68,510,216,815],[216,718,436,815],[216,510,436,551],[430,551,436,718]].forEach(r=>scene.add(bx(r[0],r[1],r[2],r[3],.08,'#8a6a45')));
  scene.add(bx(436,510,630,552,.06,'#a5a9ae'),bx(436,552,630,815,.05,'#3f8c4c'),bx(630,815,692,1598,.06,'#a5a9ae'),bx(68,1750,410,1925,.05,'#8f949a'));
  [[216,551,430,565],[216,704,430,718],[216,565,230,704],[416,565,430,704]].forEach(r=>{scene.add(bx(r[0],r[1],r[2],r[3],.12,'#e6e1d6'));scene.add(bx(r[0],r[1],r[2],r[3],1.5,'#4ba7d1',-1.5,null,false))});
  scene.add(bx(230,565,416,704,.05,'#2f7fa6',-1.5,null,false));
  const water=new THREE.Mesh(new THREE.PlaneGeometry(186/PXM,139/PXM),mat3('#4fb6e0',{transparent:true,opacity:.8}));water.rotation.x=-Math.PI/2;water.position.set(mx(323),-.18,mz(634.5));scene.add(water);
  const floors=[];
  FLOORS.forEach(f=>{const m=bx(f[1][0],f[1][1],f[1][2],f[1][3],.05,f[2],0,null,false);m.material=m.material.clone();scene.add(m);floors.push({m,ref:f[3],name:f[0],area:f[4],rect:f[1],c:[mx((f[1][0]+f[1][2])/2),mz((f[1][1]+f[1][3])/2)]})});
  const walls=new THREE.Group();scene.add(walls);
  FURN.forEach(f=>scene.add(bx(f[0],f[1],f[2],f[3],f[4],f[5])));
  [[170,95,490,370],[575,435,665,515],[681,520,683,1595]].forEach(h=>scene.add(hedge(h[0],h[1],h[2],h[3])));
  [[110,80],[300,255],[520,440]].forEach(p=>scene.add(palm(p[0],p[1])));
  const orig=new THREE.Mesh(new THREE.PlaneGeometry(923/PXM,2000/PXM),new THREE.MeshBasicMaterial({map:new THREE.TextureLoader().load(PLAN_URI),transparent:true,opacity:.75,depthWrite:false}));
  orig.rotation.x=-Math.PI/2;orig.position.set(mx(461.5),.2,mz(1000));orig.visible=false;scene.add(orig);
  T3={st,renderer,scene,cam,ctl,center,walls,orig,floors,mks:[],labels:[],ops:[],anim:null,raf:0,ray:new THREE.Raycaster(),plane:new THREE.Plane(new THREE.Vector3(0,1,0),-1.6),planeOp:new THREE.Plane(new THREE.Vector3(0,1,0),-1.2)};
  const fit=()=>{const w=st.clientWidth,h=st.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()};
  new ResizeObserver(fit).observe(st);fit();
  rebuildWalls();view3('persp',true);
  return T3;
}
function view3(name,now){
  const t=T3,c=t.center,r={persp:29,front:46,right:29,back:46,left:29,top:48}[name],az={persp:1.25,front:0,right:Math.PI/2,back:Math.PI,left:-Math.PI/2,top:0}[name],el=name==='top'?1.48:name==='persp'?.8:.95;
  const to=new THREE.Vector3(c.x+Math.sin(az)*r*Math.cos(el),c.y+Math.sin(el)*r,c.z+Math.cos(az)*r*Math.cos(el));
  if(now){t.cam.position.copy(to);t.ctl.target.copy(c);t.ctl.update();return}
  t.anim={t0:performance.now(),from:t.cam.position.clone(),to,tf:t.ctl.target.clone(),tt:c.clone()};
}
function focusRoom(i){
  const t=T3,f=t.floors[i],c=new THREE.Vector3(f.c[0],0,f.c[1]),r=13,el=.95,az=1.0;
  t.anim={t0:performance.now(),from:t.cam.position.clone(),to:new THREE.Vector3(c.x+Math.sin(az)*r*Math.cos(el),Math.sin(el)*r,c.z+Math.cos(az)*r*Math.cos(el)),tf:t.ctl.target.clone(),tt:c};
}
const V3=()=>new THREE.Vector3();
function loop(){
  const t=T3;if(!t||VIEW!=='plan'){if(t)t.raf=0;return}
  t.raf=requestAnimationFrame(loop);
  if(t.anim){const a=t.anim,k=Math.min(1,(performance.now()-a.t0)/700),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;t.cam.position.lerpVectors(a.from,a.to,e);t.ctl.target.lerpVectors(a.tf,a.tt,e);if(k>=1)t.anim=null}
  t.ctl.autoRotate=SPIN;t.ctl.update();t.renderer.render(t.scene,t.cam);
  placeAll(t);
}
/* posiciona ícones, nomes e marcas sobre a cena (projeção 3D -> tela) */
function placeAll(t){
  const w=t.st.clientWidth,h=t.st.clientHeight,v=V3();
  t.cam.updateMatrixWorld();
  const place=o=>{v.copy(o.pos).project(t.cam);const ok=v.z<1&&Math.abs(v.x)<1.1&&Math.abs(v.y)<1.1;o.el.style.display=ok?'':'none';if(ok)o.el.style.transform=`translate(${((v.x+1)/2*w).toFixed(1)}px,${((1-v.y)/2*h).toFixed(1)}px) translate(-50%,-50%)`};
  t.mks.forEach(place);t.labels.forEach(place);t.ops.forEach(place);
}
function mkInfo(m){
  const [id,ix]=m.r.split(':'),i=+ix;
  if(id==='cam')return {name:CAMS[i].n,on:false,ico:'cam'};
  if(id==='call')return {name:'Interfone',on:!!call,ico:'bell'};
  const g=GROUPS.find(q=>q.id===id),it=g.items[i];
  const on=it.k==='cover'?it.pos>0:it.k==='gate'?it.state==='Aberto':it.k==='vac'?it.state==='Limpando':!!it.on;
  return {name:lab(g,it),on,ico:g.icon};
}
function mkClick(ref){
  const [id,ix]=ref.split(':'),i=+ix;
  if(id==='cam')return openLayer({cam:i});
  if(id==='call')return openLayer({v:'call'});
  const it=GROUPS.find(q=>q.id===id).items[i];
  if(it.k==='cover')it.pos=it.pos>0?0:100;
  else if(it.k==='gate')it.state=it.state==='Aberto'?'Fechado':'Aberto';
  else if(it.k==='feeder'||it.k==='vac')return openLayer({g:id});
  else it.on=!it.on;
  refresh();
}
function mkHold(ref){const [id,ix]=ref.split(':');if(id==='cam')return openLayer({cam:+ix});if(id==='call')return openLayer({v:'call'});openLayer({g:id})}
const mkPx=m=>{const p=POS3[m.r];return p?[wx(p[0]),wz(p[1])]:[m.x,m.y]};
function roomHTML(i){
  const f=FLOORS[i],r=f[1];
  const inRoom=m=>{const p=mkPx(m);return p[0]>=r[0]&&p[0]<=r[2]&&p[1]>=r[1]&&p[1]<=r[3]};
  const list=MK.filter(inRoom);
  const rows=list.map(m=>{
    const [id,ix]=m.r.split(':'),n=+ix;
    if(id==='cam')return `<div class='item'><div class='row'><div class='info'><b>${esc(CAMS[n].n)}</b><span>Câmera ${CAMS[n].b}</span></div><button class='btn small' data-c='${n}'>Ver câmera</button></div></div>`;
    if(id==='call')return `<div class='item'><div class='row'><div class='info'><b>Interfone</b><span>Atender e abrir o portão</span></div><button class='btn small' data-view='call'>Abrir</button></div></div>`;
    const g=GROUPS.find(q=>q.id===id);return `<p class='note' style='padding:12px 0 0;text-transform:uppercase;letter-spacing:.06em;font-size:10px'>${esc(g.name)}</p>`+itemHTML(g,n);
  }).join('');
  return `<div class='item noprint'><div class='row'><div class='info'><b>Ver de perto</b><span>Leva a câmera 3D até este cômodo</span></div><button class='btn small' data-a='rfocus' data-i='${i}'>Aproximar a câmera</button></div></div>`+(rows||`<p class='note'>Nenhum dispositivo neste cômodo. Em Editar posições você arrasta os ícones para cá.</p>`);
}
function opPanelHTML(){
  const o=OPS.find(q=>q.id===SEL);
  const types=[['p','Porta'],['j','Janela'],['v','Vão livre'],['x','Parede']];
  const head=`<b>Portas e janelas</b><span>Toque numa marca para escolher. Arraste para mover pela parede.</span>`;
  const add=`<button class='btn small' data-op='add:p'>+ Porta</button><button class='btn small' data-op='add:j'>+ Janela</button><button class='btn small danger' data-op='reset'>Redefinir tudo</button>`;
  if(!o)return `<div class='oph'>${head}</div><div class='opb'>${add}</div>`;
  const r=opRect(o),len=Math.round((opHoriz(o)?r[2]-r[0]:r[3]-r[1])/PXM*100);
  return `<div class='oph'>${head}</div><div class='opb'>${types.map(([k,t])=>`<button class='btn small' aria-pressed='${o.t===k}' data-op='t:${k}'>${t}</button>`).join('')}<button class='btn small' data-op='w:-'>−</button><span class='val'>${len} cm</span><button class='btn small' data-op='w:+'>+</button><button class='btn small danger' data-op='del'>Excluir</button></div><div class='opb'>${add}</div>`;
}
function renderPlan(){
  const CATS=[['all','Tudo'],['luz','Luzes'],['cam','Câmeras'],['clima','Ar e TV'],['pers','Persianas'],['ext','Piscina e jardim'],['out','Portão e outros']];
  $('#planChips').innerHTML=CATS.map(([v,t])=>`<button class='chip' aria-pressed='${FILTER===v}' data-pf='${v}'>${t}</button>`).join('');
  $('#planTools').innerHTML=`<button class='btn small' data-pt='names' aria-pressed='${NAMES}'>Nomes</button><button class='btn small ${EDIT?'primary':''}' data-pt='edit'>${EDIT?'Concluir edição':'Editar mapa'}</button>`
    +(EDIT?`<button class='btn small' data-pt='em:dev' aria-pressed='${EDITM==='dev'}'>Dispositivos</button><button class='btn small' data-pt='em:ops' aria-pressed='${EDITM==='ops'}'>Portas e janelas</button>`:'')
    +(EDIT&&EDITM==='dev'?`<button class='btn small danger' data-pt='reset'>Redefinir ícones</button>`:'');
  $('#planViews').innerHTML=[['persp','Perspectiva'],['front','Frente'],['right','Direita'],['back','Fundos'],['left','Esquerda'],['top','Topo']].map(([v,t])=>`<button class='chip' data-pv='${v}'>${t}</button>`).join('')
    +`<button class='btn small' data-pt='spin' aria-pressed='${SPIN}'>Girar sozinha</button><button class='btn small' data-pt='walls'>${WALLH>2?'Paredes baixas':'Paredes inteiras'}</button><button class='btn small' data-pt='orig' aria-pressed='${ORIG}'>Planta original</button>`;
  const t=init3D();if(!t)return;
  const opm=EDIT&&EDITM==='ops';
  t.st.className='stage'+(EDIT?' edit':'')+(NAMES?' names':'')+(opm?' opmode':' devmode');
  t.walls.scale.y=WALLH/2.7;t.orig.visible=ORIG;
  t.floors.forEach(f=>{if(f.ref){const r=resolve(f.ref);f.m.material.emissive.set(r&&r.items[0].on?0x5a4320:0x000000)}});
  const pan=$('#opPanel');pan.hidden=!opm;if(opm)pan.innerHTML=opPanelHTML();
  const lay=$('#mks');
  t.labels=[];t.mks=[];t.ops=[];
  lay.innerHTML=t.floors.map((f,i)=>`<button class='rl' data-room='${i}'>${esc(f.name)}</button>`).join('')
    +MK.filter(m=>FILTER==='all'||m.c===FILTER).map(m=>{const f=mkInfo(m);return `<button class='mk ${f.on?'on':''} ${m.c==='cam'?'cam':''}' data-mk='${m.r}' data-n='${esc(f.name)}' title='${esc(f.name)}' aria-label='${esc(f.name)}${f.on?' (ligado)':''}'>${ic(f.ico)}</button>`}).join('')
    +(opm?OPS.map(o=>`<button class='op ${o.t} ${o.id===SEL?'sel':''}' data-op-id='${o.id}' aria-label='${{p:'Porta',j:'Janela',v:'Vão livre',x:'Parede'}[o.t]}'>${{p:'P',j:'J',v:'V',x:'X'}[o.t]}</button>`).join(''):'');
  lay.querySelectorAll('.rl').forEach(el=>{const f=t.floors[+el.dataset.room];t.labels.push({el,pos:new THREE.Vector3(f.c[0],.35,f.c[1])})});
  lay.querySelectorAll('.mk').forEach(el=>{const m=MK.find(q=>q.r===el.dataset.mk),p=POS3[m.r]||[mx(m.x),mz(m.y)];t.mks.push({el,ref:m.r,pos:new THREE.Vector3(p[0],1.6,p[1])})});
  lay.querySelectorAll('.op').forEach(el=>{const o=OPS.find(q=>q.id===el.dataset.opId),r=opRect(o);t.ops.push({el,id:o.id,pos:new THREE.Vector3(mx((r[0]+r[2])/2),1.2,mz((r[1]+r[3])/2))})});
  placeAll(t);
  if(!t.raf&&VIEW==='plan')loop();
}
function snapOp(o,px,py){return snapToWall(WALLS,o,px,py)}
function setOp(o,r){o.x0=r[0];o.y0=r[1];o.x1=r[2];o.y1=r[3]}
function opAction(a){
  const o=OPS.find(q=>q.id===SEL);
  if(a==='reset'){OPS=OPS0.map(q=>Object.assign({},q));SEL=null}
  else if(a.startsWith('add:')){
    const t=a.slice(4),c=[330,1050];let best=null,bd=1e9;
    WALLS.forEach(r=>{if(Math.max(r[2]-r[0],r[3]-r[1])<60)return;const d=Math.hypot(Math.max(r[0]-c[0],0,c[0]-r[2]),Math.max(r[1]-c[1],0,c[1]-r[3]));if(d<bd){bd=d;best=r}});
    const r=best,L=t==='p'?44:66,H=(r[2]-r[0])>=(r[3]-r[1]);
    const n={id:'o'+Date.now(),t};
    if(H){const m=(r[0]+r[2])/2;setOp(n,[Math.round(m-L/2),r[1],Math.round(m+L/2),r[3]])}else{const m=(r[1]+r[3])/2;setOp(n,[r[0],Math.round(m-L/2),r[2],Math.round(m+L/2)])}
    OPS.push(n);SEL=n.id;
  }
  else if(!o)return;
  else if(a.startsWith('t:'))o.t=a.slice(2);
  else if(a==='del'){OPS=OPS.filter(q=>q.id!==o.id);SEL=null}
  else if(a==='w:-'||a==='w:+'){
    const r=opRect(o),H=opHoriz(o),d=(a==='w:+'?4:-4);
    if(H){const L=Math.max(24,r[2]-r[0]+2*d),c=(r[0]+r[2])/2;setOp(o,[Math.round(c-L/2),r[1],Math.round(c+L/2),r[3]])}
    else{const L=Math.max(24,r[3]-r[1]+2*d),c=(r[1]+r[3])/2;setOp(o,[r[0],Math.round(c-L/2),r[2],Math.round(c+L/2)])}
  }
  save();rebuildWalls();renderPlan();
}
function setView(v){
  VIEW=v;$('#viewPanel').hidden=v!=='panel';$('#viewPlan').hidden=v!=='plan';
  $('#tabPanel').setAttribute('aria-pressed',String(v==='panel'));$('#tabPlan').setAttribute('aria-pressed',String(v==='plan'));
  try{const h=v==='plan'?'#planta':'#painel';if(location.hash!==h)location.hash=h}catch(e){}
  if(v==='plan')renderPlan();
}
window.addEventListener('hashchange',()=>setView(location.hash==='#planta'?'plan':'panel'));
async function toggleFS(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch(e){toast('Tela cheia indisponível aqui. Abra o painel direto no navegador do tablet.')}}
document.addEventListener('fullscreenchange',()=>{$('#fs').textContent=document.fullscreenElement?'Sair da tela cheia':'Tela cheia'});
document.addEventListener('click',e=>{
  const g=e.target.closest('[data-view-go]');if(g)return setView(g.dataset.viewGo);
  if(e.target.closest('#fs'))toggleFS();
});
{
  const stage=$('#stage');let drag=null,lp=null,lastRb=0;
  const ground=(e,plane)=>{const r=stage.getBoundingClientRect();T3.ray.setFromCamera({x:(e.clientX-r.left)/r.width*2-1,y:-((e.clientY-r.top)/r.height)*2+1},T3.cam);const pt=V3();return T3.ray.ray.intersectPlane(plane,pt)?pt:null};
  stage.addEventListener('contextmenu',e=>e.preventDefault());
  stage.addEventListener('pointerdown',e=>{
    const op=e.target.closest('.op');
    if(op){SEL=op.dataset.opId;drag={kind:'op',b:op,id:SEL};try{op.setPointerCapture(e.pointerId)}catch(x){}e.preventDefault();stage.querySelectorAll('.op').forEach(q=>q.classList.toggle('sel',q===op));$('#opPanel').innerHTML=opPanelHTML();return}
    const b=e.target.closest('.mk');if(!b)return;
    if(EDIT){drag={kind:'mk',b,m:b.dataset.mk};try{b.setPointerCapture(e.pointerId)}catch(x){}e.preventDefault();return}
    lp=setTimeout(()=>{lp=null;mkHold(b.dataset.mk)},550);
  });
  stage.addEventListener('pointermove',e=>{
    if(!drag||!T3)return;
    if(drag.kind==='mk'){const pt=ground(e,T3.plane);if(!pt)return;POS3[drag.m]=[+pt.x.toFixed(2),+pt.z.toFixed(2)];const o=T3.mks.find(q=>q.ref===drag.m);if(o)o.pos.set(pt.x,1.6,pt.z);return}
    const pt=ground(e,T3.planeOp);if(!pt)return;
    const o=OPS.find(q=>q.id===drag.id),r=snapOp(o,wx(pt.x),wz(pt.z));if(!r)return;
    setOp(o,r);const h=T3.ops.find(q=>q.id===o.id);if(h)h.pos.set(mx((r[0]+r[2])/2),1.2,mz((r[1]+r[3])/2));
    const now=performance.now();if(now-lastRb>80){lastRb=now;rebuildWalls()}
  });
  stage.addEventListener('pointerup',e=>{
    if(drag){if(drag.kind==='op'){rebuildWalls()}save();drag=null;return}
    if(lp){clearTimeout(lp);lp=null;const b=e.target.closest('.mk');if(b)mkClick(b.dataset.mk)}
  });
  stage.addEventListener('pointercancel',()=>{drag=null;if(lp){clearTimeout(lp);lp=null}});
  stage.addEventListener('click',e=>{
    const rl=e.target.closest('.rl');if(rl&&!EDIT)return openLayer({v:'room',i:+rl.dataset.room});
    const od=e.target.closest('[data-op]');if(od)return opAction(od.dataset.op);
    const b=e.target.closest('.mk');if(b&&e.detail===0&&!EDIT)mkClick(b.dataset.mk);
  });
  $('#viewPlan').addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.pf){FILTER=b.dataset.pf;return renderPlan()}
    if(b.dataset.pv){if(T3){SPIN=false;view3(b.dataset.pv)}return renderPlan()}
    const t=b.dataset.pt;if(!t)return;
    if(t==='names')NAMES=!NAMES;
    else if(t==='edit'){EDIT=!EDIT;SEL=null}
    else if(t.startsWith('em:')){EDITM=t.slice(3);SEL=null}
    else if(t==='reset'){POS3={};save()}
    else if(t==='spin')SPIN=!SPIN;
    else if(t==='walls')WALLH=WALLH>2?1.1:2.7;
    else if(t==='orig')ORIG=!ORIG;
    renderPlan();
  });
}

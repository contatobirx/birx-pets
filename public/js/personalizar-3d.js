import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/+esm';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js/+esm';

const $=id=>document.getElementById(id);
const state={shape:'redonda',color:'#f5f2ea',colorName:'Branco',name:'THOR',icon:'🐾',font:'forte'};
const holder=$('viewer3d');

function showLoadError(message){
  const loading=$('viewerLoading');
  if(loading){
    loading.textContent=message||'Não foi possível carregar a visualização 3D. Atualize a página.';
    loading.style.color='#b42318';
  }
}

try{
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(38,1,.1,100);
camera.position.set(0,0,7.2);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.shadowMap.enabled=true;
holder.appendChild(renderer.domElement);
$('viewerLoading')?.remove();
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=4.2;controls.maxDistance=10;controls.autoRotate=false;
scene.add(new THREE.HemisphereLight(0xffffff,0x6e7b92,2.2));
const key=new THREE.DirectionalLight(0xffffff,4);key.position.set(4,5,6);key.castShadow=true;scene.add(key);
const fill=new THREE.DirectionalLight(0xb9d0ff,1.5);fill.position.set(-5,1,2);scene.add(fill);
const rim=new THREE.DirectionalLight(0xffffff,1.6);rim.position.set(0,-4,-4);scene.add(rim);

const root=new THREE.Group();root.rotation.x=-.12;scene.add(root);
let tagMesh,frontPlane,backPlane,holeMesh;

function shape2d(kind){
  const s=new THREE.Shape();
  if(kind==='redonda'){s.absarc(0,0,2.05,0,Math.PI*2,false);return s}
  if(kind==='coracao'){
    s.moveTo(0,-1.95);s.bezierCurveTo(-.4,-1.55,-2.25,-.35,-2.05,1);s.bezierCurveTo(-1.92,2.05,-.7,2.35,0,1.4);s.bezierCurveTo(.7,2.35,1.92,2.05,2.05,1);s.bezierCurveTo(2.25,-.35,.4,-1.55,0,-1.95);return s;
  }
  s.moveTo(-1.45,-1.05);s.bezierCurveTo(-2.35,-1.55,-2.7,-.75,-2.15,-.25);s.bezierCurveTo(-2.75,.3,-2.25,1.15,-1.45,.75);s.lineTo(1.45,.75);s.bezierCurveTo(2.25,1.15,2.75,.3,2.15,-.25);s.bezierCurveTo(2.7,-.75,2.35,-1.55,1.45,-1.05);s.lineTo(-1.45,-1.05);return s;
}
function makeTexture(back=false){
  const c=document.createElement('canvas');c.width=1024;c.height=1024;const x=c.getContext('2d');x.clearRect(0,0,1024,1024);x.textAlign='center';x.textBaseline='middle';
  if(back){
    x.fillStyle='rgba(255,255,255,.94)';x.font='900 110px Arial';x.fillText('BIRX',512,225);x.font='700 48px Arial';x.fillText('SCAN ME',512,315);
    const size=340,start=342,cell=size/13;for(let r=0;r<13;r++)for(let col=0;col<13;col++){const border=r<2||col<2||r>10||col>10;const on=border?((r+col)%2===0):(Math.sin((r+1)*17+(col+3)*29)>0);if(on){x.fillStyle='rgba(255,255,255,.95)';x.fillRect(start+col*cell,start+r*cell,cell*.82,cell*.82)}}
    x.font='600 34px Arial';x.fillText('NFC + QR CODE',512,755);
  }else{
    x.fillStyle='rgba(255,255,255,.98)';x.font='700 130px Arial';x.fillText(state.icon,512,315);
    const font=state.font==='delicado'?'600 118px Georgia':state.font==='moderno'?'700 116px Arial':'900 124px Arial';x.font=font;x.fillText((state.name||'PET').toUpperCase(),512,555);
    x.font='700 32px Arial';x.fillText('BIRX ID',512,690);
  }
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.needsUpdate=true;return t;
}
function clear(){for(const o of [tagMesh,frontPlane,backPlane,holeMesh])if(o){root.remove(o);o.geometry?.dispose();if(o.material){if(o.material.map)o.material.map.dispose();o.material.dispose()}}}
function build(){
  clear();const shape=shape2d(state.shape),geom=new THREE.ExtrudeGeometry(shape,{depth:.42,bevelEnabled:true,bevelSegments:5,steps:1,bevelSize:.09,bevelThickness:.07,curveSegments:64});geom.center();
  const mat=new THREE.MeshPhysicalMaterial({color:new THREE.Color(state.color),roughness:.28,metalness:.03,clearcoat:.42,clearcoatRoughness:.24});tagMesh=new THREE.Mesh(geom,mat);tagMesh.castShadow=true;tagMesh.receiveShadow=true;root.add(tagMesh);
  const planeGeom=new THREE.PlaneGeometry(state.shape==='osso'?3.45:3.25,state.shape==='osso'?2.0:3.25);frontPlane=new THREE.Mesh(planeGeom,new THREE.MeshBasicMaterial({map:makeTexture(false),transparent:true,depthWrite:false}));frontPlane.position.z=.285;root.add(frontPlane);
  backPlane=new THREE.Mesh(planeGeom.clone(),new THREE.MeshBasicMaterial({map:makeTexture(true),transparent:true,depthWrite:false}));backPlane.position.z=-.285;backPlane.rotation.y=Math.PI;root.add(backPlane);
  const ring=new THREE.TorusGeometry(.22,.085,20,48);holeMesh=new THREE.Mesh(ring,new THREE.MeshStandardMaterial({color:0x8d96a8,metalness:.55,roughness:.35}));holeMesh.position.set(0,state.shape==='osso'?1.02:1.58,.28);root.add(holeMesh);
  updateSummary();
}
function updateTexture(){if(frontPlane){frontPlane.material.map.dispose();frontPlane.material.map=makeTexture(false);frontPlane.material.needsUpdate=true}updateSummary()}
function updateSummary(){$('sumShape').textContent=state.shape[0].toUpperCase()+state.shape.slice(1);$('sumColor').textContent=state.colorName;$('sumName').textContent=(state.name||'PET').toUpperCase()}
function resize(){const w=Math.max(holder.clientWidth,320),h=Math.max(holder.clientHeight,360);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
function animate(){requestAnimationFrame(animate);controls.update();renderer.render(scene,camera)}
new ResizeObserver(resize).observe(holder);resize();build();animate();

document.querySelectorAll('[data-shape]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-shape]').forEach(x=>x.classList.toggle('selected',x===b));state.shape=b.dataset.shape;build()}));
document.querySelectorAll('[data-color]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-color]').forEach(x=>x.classList.toggle('selected',x===b));state.color=b.dataset.color;state.colorName=b.dataset.name;build()}));
$('petName').addEventListener('input',e=>{state.name=e.target.value.replace(/[^A-Za-zÀ-ÿ0-9 -]/g,'').slice(0,12);e.target.value=state.name;updateTexture()});
$('petIcon').addEventListener('change',e=>{state.icon=e.target.value;updateTexture()});
$('fontStyle').addEventListener('change',e=>{state.font=e.target.value;updateTexture()});
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{const v=b.dataset.view;if(v==='front'){root.rotation.set(-.12,0,0);camera.position.set(0,0,7.2)}else if(v==='back'){root.rotation.set(-.12,Math.PI,0);camera.position.set(0,0,7.2)}else{root.rotation.set(-.12,0,0);camera.position.set(0,0,7.2)}controls.target.set(0,0,0);controls.update()}));
$('addCustom').addEventListener('click',()=>{const payload={...state,criadoEm:new Date().toISOString()};try{localStorage.setItem('birx_personalizacao_pendente',JSON.stringify(payload));$('customMessage').textContent='Personalização salva. Abrindo a loja…';$('customMessage').hidden=false;setTimeout(()=>location.href='/loja?personalizada=1',350)}catch{$('customMessage').textContent='Não foi possível salvar a personalização neste navegador.';$('customMessage').hidden=false}});
}catch(error){
  console.error('BIRX personalizador 3D',error);
  showLoadError('Não foi possível iniciar o 3D neste navegador. Atualize a página ou tente novamente em alguns segundos.');
}

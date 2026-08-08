import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/+esm';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js/+esm';

const $=id=>document.getElementById(id);
const state={shape:'redonda',sizeMm:30,color:'#151515',colorName:'Preto',name:'THOR'};
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
  const camera=new THREE.PerspectiveCamera(36,1,.1,100);
  camera.position.set(0,.15,6.6);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.shadowMap.enabled=true;
  holder.appendChild(renderer.domElement);
  $('viewerLoading')?.remove();

  const controls=new OrbitControls(camera,renderer.domElement);
  controls.enableDamping=true;
  controls.minDistance=4.2;
  controls.maxDistance=9;
  controls.autoRotate=false;

  scene.add(new THREE.HemisphereLight(0xffffff,0x758097,2.3));
  const key=new THREE.DirectionalLight(0xffffff,4.5);key.position.set(4,5,6);scene.add(key);
  const fill=new THREE.DirectionalLight(0xbfd4ff,1.4);fill.position.set(-5,1,2);scene.add(fill);
  const rim=new THREE.DirectionalLight(0xffffff,1.5);rim.position.set(0,-4,-4);scene.add(rim);

  const root=new THREE.Group();root.rotation.x=-.08;scene.add(root);
  let tagMesh,frontPlane,backPlane,loopOuter,loopInner;

  function makeFrontTexture(){
    const c=document.createElement('canvas');c.width=1024;c.height=1024;
    const x=c.getContext('2d');x.clearRect(0,0,1024,1024);x.textAlign='center';x.textBaseline='middle';
    x.fillStyle='rgba(255,255,255,.97)';
    x.font='900 170px Arial';x.fillText('✦',512,300);
    const name=(state.name||'PET').toUpperCase();
    let fontSize=160;if(name.length>8)fontSize=125;if(name.length>10)fontSize=108;
    x.font=`900 ${fontSize}px Arial`;
    x.fillText(name,512,560);
    x.font='700 42px Arial';x.fillText('BIRX ID',512,700);
    return texture(c);
  }

  function makeBackTexture(){
    const c=document.createElement('canvas');c.width=1024;c.height=1024;
    const x=c.getContext('2d');x.clearRect(0,0,1024,1024);x.textAlign='center';x.textBaseline='middle';
    x.fillStyle='rgba(255,255,255,.97)';x.font='900 125px Arial';x.fillText('SCAN',512,205);
    const size=430,startX=(1024-size)/2,startY=300,cell=size/17;
    const finder=(ox,oy)=>{x.strokeStyle='rgba(255,255,255,.98)';x.lineWidth=26;x.strokeRect(startX+ox*cell,startY+oy*cell,6*cell,6*cell);x.strokeRect(startX+(ox+2)*cell,startY+(oy+2)*cell,2*cell,2*cell)};
    finder(0,0);finder(11,0);finder(0,11);
    for(let r=0;r<17;r++)for(let col=0;col<17;col++){
      const inFinder=(r<6&&col<6)||(r<6&&col>10)||(r>10&&col<6);if(inFinder)continue;
      const on=((r*13+col*7+r*col)%5)<2;if(on)x.fillRect(startX+col*cell,startY+r*cell,cell*.78,cell*.78);
    }
    x.font='700 34px Arial';x.fillText('NFC + QR CODE',512,820);
    return texture(c);
  }

  function texture(canvas){const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.needsUpdate=true;return t}

  function dispose(obj){if(!obj)return;root.remove(obj);obj.geometry?.dispose();if(obj.material){if(obj.material.map)obj.material.map.dispose();obj.material.dispose()}}
  function clear(){[tagMesh,frontPlane,backPlane,loopOuter,loopInner].forEach(dispose)}

  function build(){
    clear();
    const radius=1.5;
    const shape=new THREE.Shape();shape.absarc(0,0,radius,0,Math.PI*2,false);
    const geom=new THREE.ExtrudeGeometry(shape,{depth:.22,bevelEnabled:true,bevelSegments:4,steps:1,bevelSize:.045,bevelThickness:.04,curveSegments:96});geom.center();
    const bodyMat=new THREE.MeshPhysicalMaterial({color:new THREE.Color(state.color),roughness:.42,metalness:.015,clearcoat:.18,clearcoatRoughness:.35});
    tagMesh=new THREE.Mesh(geom,bodyMat);root.add(tagMesh);

    const planeGeom=new THREE.PlaneGeometry(2.45,2.45);
    frontPlane=new THREE.Mesh(planeGeom,new THREE.MeshBasicMaterial({map:makeFrontTexture(),transparent:true,depthWrite:false}));frontPlane.position.z=.155;root.add(frontPlane);
    backPlane=new THREE.Mesh(planeGeom.clone(),new THREE.MeshBasicMaterial({map:makeBackTexture(),transparent:true,depthWrite:false}));backPlane.position.z=-.155;backPlane.rotation.y=Math.PI;root.add(backPlane);

    const outer=new THREE.TorusGeometry(.32,.11,24,64,Math.PI);
    loopOuter=new THREE.Mesh(outer,bodyMat.clone());loopOuter.rotation.z=Math.PI;loopOuter.position.set(0,1.49,.02);root.add(loopOuter);
    const bridgeGeom=new THREE.BoxGeometry(.86,.18,.26);loopInner=new THREE.Mesh(bridgeGeom,bodyMat.clone());loopInner.position.set(0,1.36,0);root.add(loopInner);
    updateSummary();
  }

  function updateFront(){if(frontPlane){frontPlane.material.map.dispose();frontPlane.material.map=makeFrontTexture();frontPlane.material.needsUpdate=true}updateSummary()}
  function updateSummary(){$('sumColor').textContent=state.colorName;$('sumName').textContent=(state.name||'PET').toUpperCase()}
  function resize(){const w=Math.max(holder.clientWidth,320),h=Math.max(holder.clientHeight,360);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
  function animate(){requestAnimationFrame(animate);controls.update();renderer.render(scene,camera)}
  new ResizeObserver(resize).observe(holder);resize();build();animate();

  document.querySelectorAll('[data-color]').forEach(b=>b.addEventListener('click',()=>{
    document.querySelectorAll('[data-color]').forEach(x=>x.classList.toggle('selected',x===b));
    state.color=b.dataset.color;state.colorName=b.dataset.name;build();
  }));
  $('petName').addEventListener('input',e=>{state.name=e.target.value.replace(/[^A-Za-zÀ-ÿ0-9 -]/g,'').slice(0,12);e.target.value=state.name;updateFront()});
  document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{
    const v=b.dataset.view;
    if(v==='back')root.rotation.set(-.08,Math.PI,0);else root.rotation.set(-.08,0,0);
    camera.position.set(0,.15,6.6);controls.target.set(0,.15,0);controls.update();
  }));
  $('addCustom').addEventListener('click',()=>{
    const payload={...state,frente:'simbolo-birx+nome',verso:'scan+qr+nfc',criadoEm:new Date().toISOString()};
    try{localStorage.setItem('birx_personalizacao_pendente',JSON.stringify(payload));$('customMessage').textContent='Personalização salva. Abrindo a loja…';$('customMessage').hidden=false;setTimeout(()=>location.href='/loja?personalizada=1',350)}
    catch{$('customMessage').textContent='Não foi possível salvar a personalização neste navegador.';$('customMessage').hidden=false}
  });
}catch(error){
  console.error('BIRX personalizador 3D',error);
  showLoadError('Não foi possível iniciar o 3D neste navegador. Atualize a página ou tente novamente em alguns segundos.');
}

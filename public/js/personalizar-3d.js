import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/+esm';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js/+esm';
import { ThreeMFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/3MFLoader.js/+esm';

const $=id=>document.getElementById(id);
const state={shape:'redonda',sizeMm:30,color:'#151515',colorName:'Preto',name:'THOR'};
const holder=$('viewer3d');
let root,modelRoot,nameMask,namePlane,modelBox,frontZ=0,modelScale=1;

function showLoadError(message){
  const loading=$('viewerLoading');
  if(loading){loading.textContent=message||'Não foi possível carregar a visualização 3D.';loading.style.color='#b42318'}
}
function texture(canvas){const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.needsUpdate=true;return t}
function luminance(color){return .2126*color.r+.7152*color.g+.0722*color.b}

try{
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(34,1,.1,100);
  camera.position.set(0,.1,7.2);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.shadowMap.enabled=true;
  holder.appendChild(renderer.domElement);

  const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=3.5;controls.maxDistance=11;controls.target.set(0,.12,0);
  scene.add(new THREE.HemisphereLight(0xffffff,0x667188,2.4));
  const key=new THREE.DirectionalLight(0xffffff,4.2);key.position.set(4,5,7);scene.add(key);
  const fill=new THREE.DirectionalLight(0xc8d8ff,1.45);fill.position.set(-5,2,3);scene.add(fill);
  const rim=new THREE.DirectionalLight(0xffffff,1.4);rim.position.set(0,-3,-5);scene.add(rim);

  root=new THREE.Group();root.rotation.x=-.06;scene.add(root);

  function styleModel(){
    if(!modelRoot)return;
    modelRoot.traverse(obj=>{
      if(!obj.isMesh)return;
      obj.castShadow=true;obj.receiveShadow=true;
      const materials=Array.isArray(obj.material)?obj.material:[obj.material];
      obj.material=materials.map(mat=>{
        const m=mat?.clone?.()||new THREE.MeshStandardMaterial();
        if(m.color){
          const bright=luminance(m.color)>.58;
          if(bright){m.color.set('#f5f5f2');m.roughness=.48;m.metalness=.02}
          else{m.color.set(state.color);m.roughness=.46;m.metalness=.01}
        }
        return m;
      });
      if(!Array.isArray(obj.material))obj.material=obj.material[0];
    });
  }

  function makeNameTexture(){
    const c=document.createElement('canvas');c.width=1200;c.height=460;const x=c.getContext('2d');x.clearRect(0,0,c.width,c.height);x.textAlign='center';x.textBaseline='middle';
    x.fillStyle='rgba(248,248,245,.99)';const name=(state.name||'PET').toUpperCase();let size=210;if(name.length>6)size=180;if(name.length>8)size=150;if(name.length>10)size=125;
    x.font=`900 ${size}px Arial, sans-serif`;x.fillText(name,600,230);
    return texture(c);
  }

  function rebuildCustomization(){
    if(!modelBox||!root)return;
    if(nameMask){root.remove(nameMask);nameMask.geometry.dispose();nameMask.material.dispose()}
    if(namePlane){root.remove(namePlane);namePlane.geometry.dispose();namePlane.material.map?.dispose();namePlane.material.dispose()}
    const size=new THREE.Vector3();modelBox.getSize(size);
    const width=size.x*.72,height=size.y*.30;
    const maskGeom=new THREE.PlaneGeometry(width,height);
    const maskMat=new THREE.MeshBasicMaterial({color:new THREE.Color(state.color),polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4});
    nameMask=new THREE.Mesh(maskGeom,maskMat);nameMask.position.set(0,-size.y*.19,frontZ+.018);root.add(nameMask);
    const nameGeom=new THREE.PlaneGeometry(width*.95,height*.82);
    namePlane=new THREE.Mesh(nameGeom,new THREE.MeshBasicMaterial({map:makeNameTexture(),transparent:true,depthWrite:false}));
    namePlane.position.set(0,-size.y*.19,frontZ+.024);root.add(namePlane);
    updateSummary();
  }

  function normalizeModel(group){
    const box=new THREE.Box3().setFromObject(group);const size=new THREE.Vector3(),center=new THREE.Vector3();box.getSize(size);box.getCenter(center);
    group.position.sub(center);
    const targetHeight=3.55;modelScale=targetHeight/Math.max(size.y,size.x);group.scale.setScalar(modelScale);
    modelBox=new THREE.Box3().setFromObject(group);const normalizedSize=new THREE.Vector3();modelBox.getSize(normalizedSize);
    const normalizedCenter=new THREE.Vector3();modelBox.getCenter(normalizedCenter);group.position.x-=normalizedCenter.x;group.position.y-=normalizedCenter.y;
    modelBox=new THREE.Box3().setFromObject(group);frontZ=modelBox.max.z;
  }

  async function loadRealModel(){
    const loader=new ThreeMFLoader();
    try{
      const response=await fetch('/api/modelo-birx-publico',{cache:'force-cache'});
      if(!response.ok)throw new Error(`Modelo 3D indisponível (${response.status})`);
      const buffer=await response.arrayBuffer();
      const group=loader.parse(buffer);
      modelRoot=group;normalizeModel(modelRoot);styleModel();root.add(modelRoot);rebuildCustomization();$('viewerLoading')?.remove();
    }catch(error){console.error('3MF BIRX',error);showLoadError('Não consegui carregar o modelo real da BIRX ID. Verifique o arquivo 3MF no R2.')}
  }

  function updateColor(){
    if(modelRoot){
      modelRoot.traverse(obj=>{if(!obj.isMesh)return;const mats=Array.isArray(obj.material)?obj.material:[obj.material];for(const m of mats){if(m?.color&&luminance(m.color)<.85)m.color.set(state.color)}});
    }
    if(nameMask)nameMask.material.color.set(state.color);
    updateSummary();
  }
  function updateName(){if(namePlane){namePlane.material.map?.dispose();namePlane.material.map=makeNameTexture();namePlane.material.needsUpdate=true}updateSummary()}
  function updateSummary(){$('sumColor').textContent=state.colorName;$('sumName').textContent=(state.name||'PET').toUpperCase()}
  function resize(){const w=Math.max(holder.clientWidth,320),h=Math.max(holder.clientHeight,360);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
  function animate(){requestAnimationFrame(animate);controls.update();renderer.render(scene,camera)}
  new ResizeObserver(resize).observe(holder);resize();animate();loadRealModel();

  document.querySelectorAll('[data-color]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-color]').forEach(x=>x.classList.toggle('selected',x===b));state.color=b.dataset.color;state.colorName=b.dataset.name;updateColor()}));
  $('petName').addEventListener('input',e=>{state.name=e.target.value.replace(/[^A-Za-zÀ-ÿ0-9 -]/g,'').slice(0,12);e.target.value=state.name;updateName()});
  document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{const v=b.dataset.view;if(v==='back')root.rotation.set(-.06,Math.PI,0);else root.rotation.set(-.06,0,0);camera.position.set(0,.1,7.2);controls.target.set(0,.12,0);controls.update()}));
  $('addCustom').addEventListener('click',()=>{const payload={...state,modeloBase:'NOVO-BIRX.3mf',frente:'logo-original+nome-personalizado',verso:'original-scan-qr',criadoEm:new Date().toISOString()};try{localStorage.setItem('birx_personalizacao_pendente',JSON.stringify(payload));$('customMessage').textContent='Personalização salva. Abrindo a loja…';$('customMessage').hidden=false;setTimeout(()=>location.href='/loja?personalizada=1',350)}catch{$('customMessage').textContent='Não foi possível salvar a personalização neste navegador.';$('customMessage').hidden=false}});
}catch(error){console.error('BIRX personalizador 3D',error);showLoadError('Não foi possível iniciar o visualizador 3D neste navegador.')}

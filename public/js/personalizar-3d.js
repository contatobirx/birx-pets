import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/+esm';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js/+esm';
import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/FontLoader.js/+esm';
import { TextGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/geometries/TextGeometry.js/+esm';
import { unzipSync, strFromU8 } from 'https://cdn.jsdelivr.net/npm/fflate@0.8.2/+esm';

const $=id=>document.getElementById(id);
const state={shape:'redonda',sizeMm:30,color:'#151515',colorName:'Preto',name:'THOR'};
const holder=$('viewer3d');
let scene,camera,renderer,controls,root,modelRoot,nameMesh,font=null,originalTextBox=null,originalTextMesh=null;
let bodyMeshes=[],detailMeshes=[];
let lastWidth=0,lastHeight=0,resizeFrame=0;

function showLoadError(message){const loading=$('viewerLoading');if(loading){loading.textContent=message||'Não foi possível carregar a visualização 3D.';loading.style.color='#b42318'}}
function parseTransform(value){const a=String(value||'1 0 0 0 1 0 0 0 1 0 0 0').trim().split(/\s+/).map(Number);return a.length===12?a:[1,0,0,0,1,0,0,0,1,0,0,0]}
function transformPoint(v,t){const[a,b,c,d,e,f,g,h,i,j,k,l]=t,[x,y,z]=v;return[a*x+d*y+g*z+j,b*x+e*y+h*z+k,c*x+f*y+i*z+l]}
function cleanPath(path){return String(path||'').replace(/^\//,'')}

function meshFromXml(xml,componentTransform,buildTransform,material,name){
  const doc=new DOMParser().parseFromString(xml,'application/xml');
  const vertices=[...doc.getElementsByTagNameNS('*','vertex')].map(v=>[Number(v.getAttribute('x')),Number(v.getAttribute('y')),Number(v.getAttribute('z'))]);
  const triangles=[...doc.getElementsByTagNameNS('*','triangle')];
  const positions=new Float32Array(triangles.length*9);let p=0;
  for(const tri of triangles){
    for(const key of ['v1','v2','v3']){
      let point=vertices[Number(tri.getAttribute(key))];
      point=transformPoint(point,componentTransform);point=transformPoint(point,buildTransform);
      positions[p++]=point[0];positions[p++]=point[1];positions[p++]=point[2];
    }
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.computeVertexNormals();
  const mesh=new THREE.Mesh(geometry,material);mesh.name=name;mesh.castShadow=true;mesh.receiveShadow=true;return mesh;
}

function readNames(files){
  const raw=files['Metadata/model_settings.config'];if(!raw)return{};
  const doc=new DOMParser().parseFromString(strFromU8(raw),'application/xml');const result={};
  for(const obj of [...doc.querySelectorAll('object')]){const id=obj.getAttribute('id');const meta=[...obj.children].find(x=>x.tagName==='metadata'&&x.getAttribute('key')==='name');if(id&&meta)result[id]=meta.getAttribute('value')||''}
  return result;
}

function parseBambu3mf(buffer){
  const files=unzipSync(new Uint8Array(buffer));const main=files['3D/3dmodel.model'];if(!main)throw new Error('3D/3dmodel.model não encontrado.');
  const doc=new DOMParser().parseFromString(strFromU8(main),'application/xml');
  const names=readNames(files),builds={};
  for(const item of [...doc.getElementsByTagNameNS('*','item')])builds[item.getAttribute('objectid')]=parseTransform(item.getAttribute('transform'));
  const pieces=[];
  for(const obj of [...doc.querySelectorAll('resources > object')]){
    const buildId=obj.getAttribute('id'),component=obj.querySelector('component');if(!component)continue;
    const path=cleanPath(component.getAttributeNS('http://schemas.microsoft.com/3dmanufacturing/production/2015/06','path')||component.getAttribute('p:path'));
    const file=files[path];if(!file)continue;
    pieces.push({id:buildId,name:names[buildId]||`Objeto ${buildId}`,xml:strFromU8(file),componentTransform:parseTransform(component.getAttribute('transform')),buildTransform:builds[buildId]||parseTransform('')});
  }
  if(!pieces.length)throw new Error('Nenhuma peça foi encontrada no projeto.');return pieces;
}

function role(name){const n=String(name||'').toLowerCase();if(n.includes('texto'))return'text';if(n.includes('merged'))return'detail';if(n.includes('black')||n.includes('cilindro'))return'body';return'detail'}

function buildSeparatedModel(pieces){
  modelRoot=new THREE.Group();bodyMeshes=[];detailMeshes=[];originalTextBox=null;originalTextMesh=null;
  const bodyMaterial=new THREE.MeshPhysicalMaterial({color:state.color,roughness:.43,metalness:.01,clearcoat:.12,clearcoatRoughness:.38});
  const detailMaterial=new THREE.MeshStandardMaterial({color:'#f4f4f1',roughness:.46,metalness:.01});
  for(const piece of pieces){
    const r=role(piece.name),mesh=meshFromXml(piece.xml,piece.componentTransform,piece.buildTransform,r==='body'?bodyMaterial.clone():detailMaterial.clone(),piece.name);
    if(r==='text'){originalTextMesh=mesh;modelRoot.add(mesh)}
    else if(r==='body'){bodyMeshes.push(mesh);modelRoot.add(mesh)}
    else{detailMeshes.push(mesh);modelRoot.add(mesh)}
  }

  // As coordenadas do 3MF ainda estão na mesa da Bambu (~155 mm). Primeiro
  // calculamos a escala e só então compensamos o centro já escalado. Antes a
  // translação ficava sem escala e empurrava o modelo para fora da câmera.
  const box=new THREE.Box3().setFromObject(modelRoot),center=new THREE.Vector3(),size=new THREE.Vector3();box.getCenter(center);box.getSize(size);
  const scale=3.65/Math.max(size.x,size.y);
  modelRoot.scale.setScalar(scale);
  modelRoot.position.set(-center.x*scale,-center.y*scale,-center.z*scale);
  modelRoot.rotation.y=Math.PI;
  modelRoot.updateMatrix();
  root.add(modelRoot);

  if(originalTextMesh){
    originalTextBox=new THREE.Box3().setFromBufferAttribute(originalTextMesh.geometry.getAttribute('position')).applyMatrix4(modelRoot.matrix);
    originalTextMesh.visible=false;
  }
}

async function loadFont(){if(font)return font;const response=await fetch('https://cdn.jsdelivr.net/npm/three@0.180.0/examples/fonts/helvetiker_bold.typeface.json');if(!response.ok)throw new Error('Fonte 3D não carregou.');font=new FontLoader().parse(await response.json());return font}

async function rebuildName(){
  if(!modelRoot||!originalTextBox)return;
  if(nameMesh){root.remove(nameMesh);nameMesh.geometry.dispose();nameMesh.material.dispose();nameMesh=null}
  const f=await loadFont(),text=(state.name||'PET').toUpperCase();
  const geom=new TextGeometry(text,{font:f,size:.44,depth:.055,curveSegments:5,bevelEnabled:true,bevelThickness:.012,bevelSize:.008,bevelSegments:2});geom.computeBoundingBox();
  const textSize=new THREE.Vector3();geom.boundingBox.getSize(textSize);const target=new THREE.Vector3();originalTextBox.getSize(target);const maxWidth=Math.max(target.x,1.25),textScale=Math.min(1,maxWidth/Math.max(textSize.x,.001));geom.scale(textScale,textScale,textScale);geom.computeBoundingBox();
  const center=new THREE.Vector3();geom.boundingBox.getCenter(center);geom.translate(-center.x,-center.y,-center.z);
  const targetCenter=new THREE.Vector3();originalTextBox.getCenter(targetCenter);
  // A face personalizada é o lado que, depois da rotação Y=PI do modelo,
  // aponta para a câmera. Rotacionamos o texto para o relevo crescer para fora.
  nameMesh=new THREE.Mesh(geom,new THREE.MeshStandardMaterial({color:'#f4f4f1',roughness:.42}));
  nameMesh.rotation.y=Math.PI;
  nameMesh.position.set(targetCenter.x,targetCenter.y,originalTextBox.max.z+.025);nameMesh.castShadow=true;root.add(nameMesh);updateSummary();
}

function updateColor(){for(const mesh of bodyMeshes){const mats=Array.isArray(mesh.material)?mesh.material:[mesh.material];for(const m of mats)m?.color?.set(state.color)}updateSummary()}
function updateSummary(){$('sumColor').textContent=state.colorName;$('sumName').textContent=(state.name||'PET').toUpperCase()}
function resizeNow(){
  if(!renderer||!camera||!holder)return;
  const rect=holder.getBoundingClientRect();const w=Math.max(1,Math.round(rect.width)),h=Math.max(1,Math.round(rect.height));
  if(w===lastWidth&&h===lastHeight)return;lastWidth=w;lastHeight=h;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
}
function scheduleResize(){if(resizeFrame)return;resizeFrame=requestAnimationFrame(()=>{resizeFrame=0;resizeNow()})}
function animate(){requestAnimationFrame(animate);controls.update();renderer.render(scene,camera)}

async function loadRealModel(){
  try{
    const response=await fetch('/api/modelo-birx-publico',{cache:'no-store'});if(!response.ok)throw new Error(`Modelo 3D indisponível (${response.status})`);
    const key=response.headers.get('X-BIRX-Model-Key')||'';const buffer=await response.arrayBuffer();const pieces=parseBambu3mf(buffer);
    if(!pieces.some(p=>/texto/i.test(p.name)))throw new Error('Este 3MF ainda não é a versão com as peças separadas.');
    buildSeparatedModel(pieces);await rebuildName();$('viewerLoading')?.remove();console.info('BIRX modelo carregado:',key,pieces.map(p=>p.name));
  }catch(error){console.error('BIRX 3MF',error);showLoadError(error.message.includes('separadas')?'Envie o arquivo Separados.3mf para a Biblioteca 3D do Admin.':'Não consegui carregar o modelo separado da BIRX ID.')}
}

try{
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(34,1,.1,100);camera.position.set(0,.12,7.2);
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.shadowMap.enabled=true;holder.appendChild(renderer.domElement);
  controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=3.5;controls.maxDistance=11;controls.target.set(0,.12,0);
  scene.add(new THREE.HemisphereLight(0xffffff,0x667188,2.5));const key=new THREE.DirectionalLight(0xffffff,4.1);key.position.set(4,5,7);scene.add(key);const fill=new THREE.DirectionalLight(0xc8d8ff,1.4);fill.position.set(-5,2,3);scene.add(fill);
  root=new THREE.Group();root.rotation.x=-.08;scene.add(root);
  const observer=new ResizeObserver(scheduleResize);observer.observe(holder);window.addEventListener('resize',scheduleResize,{passive:true});
  resizeNow();animate();loadRealModel();
  document.querySelectorAll('[data-color]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-color]').forEach(x=>x.classList.toggle('selected',x===b));state.color=b.dataset.color;state.colorName=b.dataset.name;updateColor()}));
  $('petName').addEventListener('input',e=>{state.name=e.target.value.replace(/[^A-Za-zÀ-ÿ0-9 -]/g,'').slice(0,12);e.target.value=state.name;rebuildName().catch(console.error)});
  document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{const v=b.dataset.view;if(v==='back')root.rotation.set(-.08,Math.PI,0);else root.rotation.set(-.08,0,0);camera.position.set(0,.12,7.2);controls.target.set(0,.12,0);controls.update()}));
  $('addCustom').addEventListener('click',()=>{const payload={...state,modeloBase:'Separados.3mf',frente:'logo-original+nome-personalizado',verso:'original',criadoEm:new Date().toISOString()};try{localStorage.setItem('birx_personalizacao_pendente',JSON.stringify(payload));$('customMessage').textContent='Personalização salva. Abrindo a loja…';$('customMessage').hidden=false;setTimeout(()=>location.href='/loja?personalizada=1',350)}catch{$('customMessage').textContent='Não foi possível salvar a personalização neste navegador.';$('customMessage').hidden=false}});
}catch(error){console.error('BIRX personalizador 3D',error);showLoadError('Não foi possível iniciar o visualizador 3D neste navegador.')}

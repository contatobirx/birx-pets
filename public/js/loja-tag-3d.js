import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/+esm';
import { unzipSync, strFromU8 } from 'https://cdn.jsdelivr.net/npm/fflate@0.8.2/+esm';

const holder = document.querySelector('.store-3d-tag');
if (!holder) throw new Error('Viewer da loja não encontrado');

function parseTransform(value) {
  const a = String(value || '1 0 0 0 1 0 0 0 1 0 0 0').trim().split(/\s+/).map(Number);
  return a.length === 12 ? a : [1,0,0,0,1,0,0,0,1,0,0,0];
}
function transformPoint(v,t){const[a,b,c,d,e,f,g,h,i,j,k,l]=t;const[x,y,z]=v;return[a*x+d*y+g*z+j,b*x+e*y+h*z+k,c*x+f*y+i*z+l]}
function cleanPath(path){return String(path||'').replace(/^\//,'')}
function geometryFromXml(xml,componentTransform,buildTransform){
  const doc=new DOMParser().parseFromString(xml,'application/xml');
  const vertices=[...doc.getElementsByTagNameNS('*','vertex')].map(v=>[Number(v.getAttribute('x')),Number(v.getAttribute('y')),Number(v.getAttribute('z'))]);
  const positions=[];
  for(const tri of [...doc.getElementsByTagNameNS('*','triangle')]){
    ['v1','v2','v3'].forEach(key=>positions.push(...transformPoint(transformPoint(vertices[Number(tri.getAttribute(key))],componentTransform),buildTransform)));
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.computeVertexNormals();return g;
}
function readNames(files){
  const raw=files['Metadata/model_settings.config'];if(!raw)return{};
  const doc=new DOMParser().parseFromString(strFromU8(raw),'application/xml');const result={};
  for(const obj of [...doc.querySelectorAll('object')]){const id=obj.getAttribute('id');const meta=[...obj.children].find(x=>x.tagName==='metadata'&&x.getAttribute('key')==='name');if(id&&meta)result[id]=meta.getAttribute('value')||''}return result;
}
function parse3mf(buffer){
  const files=unzipSync(new Uint8Array(buffer));const main=files['3D/3dmodel.model'];if(!main)throw new Error('3MF inválido');
  const doc=new DOMParser().parseFromString(strFromU8(main),'application/xml');const names=readNames(files),builds={};
  for(const item of [...doc.getElementsByTagNameNS('*','item')])builds[item.getAttribute('objectid')]=parseTransform(item.getAttribute('transform'));
  const pieces=[];
  for(const obj of [...doc.querySelectorAll('resources > object')]){const id=obj.getAttribute('id'),component=obj.querySelector('component');if(!component)continue;const path=cleanPath(component.getAttributeNS('http://schemas.microsoft.com/3dmanufacturing/production/2015/06','path')||component.getAttribute('p:path'));const file=files[path];if(!file)continue;pieces.push({name:names[id]||'',xml:strFromU8(file),componentTransform:parseTransform(component.getAttribute('transform')),buildTransform:builds[id]||parseTransform('')})}return pieces;
}
function pieceType(name){const n=String(name||'').toLowerCase();return n.includes('black')||n.includes('cilindro')?'body':'detail'}

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(32,1,.1,100);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
holder.innerHTML='';holder.appendChild(renderer.domElement);holder.style.cursor='pointer';holder.title='Clique para mudar a cor';
scene.add(new THREE.HemisphereLight(0xffffff,0x61708c,2.8));const key=new THREE.DirectionalLight(0xffffff,4.2);key.position.set(4,5,7);scene.add(key);

const root=new THREE.Group();scene.add(root);
const palettes=[['#151515','#f5f5f2'],['#245eea','#f5f5f2'],['#d93636','#f5f5f2'],['#e978a7','#f5f5f2'],['#f5f2ea','#151515']];
let paletteIndex=0,bodyMaterials=[],detailMaterials=[];

async function load(){
  const response=await fetch('/api/modelo-birx-publico',{cache:'no-store'});if(!response.ok)throw new Error('Modelo indisponível');
  const pieces=parse3mf(await response.arrayBuffer());const model=new THREE.Group();
  for(const piece of pieces){const type=pieceType(piece.name);const mat=new THREE.MeshStandardMaterial({color:type==='body'?palettes[0][0]:palettes[0][1],roughness:.43,metalness:.01,polygonOffset:type!=='body',polygonOffsetFactor:-3,polygonOffsetUnits:-3});(type==='body'?bodyMaterials:detailMaterials).push(mat);model.add(new THREE.Mesh(geometryFromXml(piece.xml,piece.componentTransform,piece.buildTransform),mat));}
  const box=new THREE.Box3().setFromObject(model),center=new THREE.Vector3(),size=new THREE.Vector3();box.getCenter(center);box.getSize(size);const scale=3.65/Math.max(size.x,size.y);model.scale.setScalar(scale);model.position.set(-center.x*scale,-center.y*scale,-center.z*scale);model.rotation.y=Math.PI;root.add(model);
  const bounds=new THREE.Box3().setFromObject(root),c=new THREE.Vector3(),s=new THREE.Vector3();bounds.getCenter(c);bounds.getSize(s);const vf=THREE.MathUtils.degToRad(camera.fov);const hf=2*Math.atan(Math.tan(vf/2)*Math.max(camera.aspect,.1));const distance=Math.max((s.y/2)/Math.tan(vf/2),(s.x/2)/Math.tan(hf/2),s.z*2)*1.2;camera.position.set(c.x,c.y,c.z+distance);camera.lookAt(c);resize();render();
}
function resize(){const r=holder.getBoundingClientRect(),w=Math.max(1,Math.round(r.width)),h=Math.max(1,Math.round(r.height));renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
function render(){renderer.render(scene,camera)}
holder.addEventListener('click',()=>{paletteIndex=(paletteIndex+1)%palettes.length;const[body,detail]=palettes[paletteIndex];bodyMaterials.forEach(m=>m.color.set(body));detailMaterials.forEach(m=>m.color.set(detail));render()});
new ResizeObserver(()=>{resize();render()}).observe(holder);
resize();load().catch(err=>{console.error('BIRX loja 3D',err);holder.innerHTML='<span class="birx-3d-fallback">BIRX ID</span>'});

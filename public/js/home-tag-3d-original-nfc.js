import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/+esm';
import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/FontLoader.js/+esm';
import { TextGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/geometries/TextGeometry.js/+esm';
import { unzipSync, strFromU8 } from 'https://cdn.jsdelivr.net/npm/fflate@0.8.2/+esm';

let cachedPieces=null,font=null;
const parseTransform=v=>{const a=String(v||'1 0 0 0 1 0 0 0 1 0 0 0').trim().split(/\s+/).map(Number);return a.length===12?a:[1,0,0,0,1,0,0,0,1,0,0,0]};
const transformPoint=(v,t)=>{const[a,b,c,d,e,f,g,h,i,j,k,l]=t,[x,y,z]=v;return[a*x+d*y+g*z+j,b*x+e*y+h*z+k,c*x+f*y+i*z+l]};
const cleanPath=p=>String(p||'').replace(/^\//,'');

function geometryFromXml(xml,componentTransform,buildTransform,filter){
  const doc=new DOMParser().parseFromString(xml,'application/xml');
  const vertices=[...doc.getElementsByTagNameNS('*','vertex')].map(v=>[+v.getAttribute('x'),+v.getAttribute('y'),+v.getAttribute('z')]);
  const positions=[];
  for(const tri of [...doc.getElementsByTagNameNS('*','triangle')]){
    const pts=['v1','v2','v3'].map(k=>transformPoint(transformPoint(vertices[+tri.getAttribute(k)],componentTransform),buildTransform));
    if(filter&&!filter(pts))continue;
    pts.forEach(p=>positions.push(...p));
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.computeVertexNormals();return g;
}
function readNames(files){const raw=files['Metadata/model_settings.config'];if(!raw)return{};const doc=new DOMParser().parseFromString(strFromU8(raw),'application/xml'),out={};for(const obj of [...doc.querySelectorAll('object')]){const id=obj.getAttribute('id'),m=[...obj.children].find(x=>x.tagName==='metadata'&&x.getAttribute('key')==='name');if(id&&m)out[id]=m.getAttribute('value')||''}return out}
function parse3mf(buffer){const files=unzipSync(new Uint8Array(buffer)),main=files['3D/3dmodel.model'];if(!main)throw new Error('3MF inválido');const doc=new DOMParser().parseFromString(strFromU8(main),'application/xml'),names=readNames(files),builds={};for(const item of [...doc.getElementsByTagNameNS('*','item')])builds[item.getAttribute('objectid')]=parseTransform(item.getAttribute('transform'));const pieces=[];for(const obj of [...doc.querySelectorAll('resources > object')]){const id=obj.getAttribute('id'),component=obj.querySelector('component');if(!component)continue;const path=cleanPath(component.getAttributeNS('http://schemas.microsoft.com/3dmanufacturing/production/2015/06','path')||component.getAttribute('p:path')),file=files[path];if(!file)continue;pieces.push({id,name:names[id]||`Objeto ${id}`,xml:strFromU8(file),componentTransform:parseTransform(component.getAttribute('transform')),buildTransform:builds[id]||parseTransform('')})}return pieces}
async function getPieces(){if(cachedPieces)return cachedPieces;const r=await fetch('/api/modelo-birx-publico',{cache:'force-cache'});if(!r.ok)throw new Error('Modelo indisponível');cachedPieces=parse3mf(await r.arrayBuffer());return cachedPieces}
async function getFont(){if(font)return font;const r=await fetch('https://cdn.jsdelivr.net/npm/three@0.180.0/examples/fonts/helvetiker_bold.typeface.json');font=new FontLoader().parse(await r.json());return font}
function role(name){const n=name.toLowerCase();if(n.includes('texto'))return'text';if(n.includes('merged'))return'detail';if(n.includes('black')||n.includes('cilindro'))return'body';return'detail'}
function logoFilter(piece){if(!/merged/i.test(piece.name))return null;const all=geometryFromXml(piece.xml,piece.componentTransform,piece.buildTransform);const p=all.getAttribute('position');let minY=Infinity,maxY=-Infinity;for(let i=0;i<p.count;i++){minY=Math.min(minY,p.getY(i));maxY=Math.max(maxY,p.getY(i))}all.dispose();const cut=minY+(maxY-minY)*.31;return pts=>(pts[0][1]+pts[1][1]+pts[2][1])/3>cut}

async function buildViewer(holder){
  const bodyColor=holder.dataset.body||'#151515',detailColor=holder.dataset.detail||'#f5f5f2',name=(holder.dataset.name||'').trim().toUpperCase().slice(0,8);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(32,1,.1,100),renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;holder.innerHTML='';holder.appendChild(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xffffff,0x61708c,2.8));const key=new THREE.DirectionalLight(0xffffff,4.2);key.position.set(4,5,7);scene.add(key);const root=new THREE.Group();scene.add(root);
  const pieces=await getPieces(),model=new THREE.Group();let textPiece=null;
  for(const piece of pieces){const r=role(piece.name);if(r==='text'){textPiece=piece;const g=geometryFromXml(piece.xml,piece.componentTransform,piece.buildTransform),m=new THREE.MeshStandardMaterial({color:detailColor,roughness:.43,metalness:.01,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}),mesh=new THREE.Mesh(g,m);mesh.renderOrder=5;model.add(mesh}continue}const filter=r==='detail'&&name?logoFilter(piece):null,g=geometryFromXml(piece.xml,piece.componentTransform,piece.buildTransform,filter),m=new THREE.MeshStandardMaterial({color:r==='body'?bodyColor:detailColor,roughness:.43,metalness:.01,polygonOffset:r==='detail',polygonOffsetFactor:-3,polygonOffsetUnits:-3}),mesh=new THREE.Mesh(g,m);mesh.renderOrder=r==='detail'?5:1;model.add(mesh)}
  let box=new THREE.Box3().setFromObject(model),center=new THREE.Vector3(),size=new THREE.Vector3();box.getCenter(center);box.getSize(size);const scale=3.65/Math.max(size.x,size.y);model.scale.setScalar(scale);model.position.set(-center.x*scale,-center.y*scale,-center.z*scale);model.rotation.y=Math.PI;root.add(model);root.updateMatrixWorld(true);box=new THREE.Box3().setFromObject(model);box.getCenter(center);box.getSize(size);
  if(name){const f=await getFont(),makeText=(label,fontSize,maxWidth,depth)=>{const g=new TextGeometry(label,{font:f,size:fontSize,depth,curveSegments:5,bevelEnabled:true,bevelThickness:.014,bevelSize:.009,bevelSegments:2});g.computeBoundingBox();const labelSize=new THREE.Vector3();g.boundingBox.getSize(labelSize);const textScale=Math.min(1,maxWidth/Math.max(labelSize.x,.001));g.scale(textScale,textScale,textScale);g.computeBoundingBox();const labelCenter=new THREE.Vector3();g.boundingBox.getCenter(labelCenter);g.translate(-labelCenter.x,-labelCenter.y,-labelCenter.z);const mesh=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:detailColor,roughness:.4,polygonOffset:true,polygonOffsetFactor:-5,polygonOffsetUnits:-5}));mesh.renderOrder=6;return mesh},nameMesh=makeText(name,.48,size.x*.70,.065);nameMesh.position.set(center.x,center.y-size.y*.22,box.max.z+.035);root.add(nameMesh)}
  function fit(){const rect=holder.getBoundingClientRect(),w=Math.max(1,rect.width),h=Math.max(1,rect.height);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();root.rotation.set(0,0,0);root.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(root),c=new THREE.Vector3(),s=new THREE.Vector3();b.getCenter(c);b.getSize(s);const vf=THREE.MathUtils.degToRad(camera.fov),hf=2*Math.atan(Math.tan(vf/2)*Math.max(camera.aspect,.1)),d=Math.max((s.y/2)/Math.tan(vf/2),(s.x/2)/Math.tan(hf/2),s.z*2)*1.22;camera.position.set(c.x,c.y,c.z+d);camera.lookAt(c);renderer.render(scene,camera)}
  fit();new ResizeObserver(fit).observe(holder);
}

Promise.all([...document.querySelectorAll('[data-birx-3d]')].map(el=>buildViewer(el).catch(err=>{console.error('BIRX home 3D',err);el.innerHTML='<span class="birx-3d-fallback">BIRX ID</span>'})));

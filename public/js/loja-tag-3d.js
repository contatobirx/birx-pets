import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/+esm';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js/+esm';
import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/FontLoader.js/+esm';
import { TextGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/geometries/TextGeometry.js/+esm';
import { unzipSync, strFromU8 } from 'https://cdn.jsdelivr.net/npm/fflate@0.8.2/+esm';

const holder = document.querySelector('.store-3d-tag');
if (!holder) throw new Error('Viewer da loja não encontrado');

let font = null;

function parseTransform(value) {
  const a = String(value || '1 0 0 0 1 0 0 0 1 0 0 0').trim().split(/\s+/).map(Number);
  return a.length === 12 ? a : [1,0,0,0,1,0,0,0,1,0,0,0];
}
function transformPoint(v, t) {
  const [a,b,c,d,e,f,g,h,i,j,k,l] = t;
  const [x,y,z] = v;
  return [a*x+d*y+g*z+j, b*x+e*y+h*z+k, c*x+f*y+i*z+l];
}
function cleanPath(path) { return String(path || '').replace(/^\//, ''); }
function geometryFromXml(xml, componentTransform, buildTransform, filter = null) {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const vertices = [...doc.getElementsByTagNameNS('*', 'vertex')].map(v => [
    Number(v.getAttribute('x')), Number(v.getAttribute('y')), Number(v.getAttribute('z'))
  ]);
  const positions = [];
  for (const tri of [...doc.getElementsByTagNameNS('*', 'triangle')]) {
    const points = ['v1','v2','v3'].map(key =>
      transformPoint(transformPoint(vertices[Number(tri.getAttribute(key))], componentTransform), buildTransform)
    );
    if (filter && !filter(points)) continue;
    points.forEach(p => positions.push(...p));
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.computeVertexNormals();
  return g;
}
function readNames(files) {
  const raw = files['Metadata/model_settings.config'];
  if (!raw) return {};
  const doc = new DOMParser().parseFromString(strFromU8(raw), 'application/xml');
  const result = {};
  for (const obj of [...doc.querySelectorAll('object')]) {
    const id = obj.getAttribute('id');
    const meta = [...obj.children].find(x => x.tagName === 'metadata' && x.getAttribute('key') === 'name');
    if (id && meta) result[id] = meta.getAttribute('value') || '';
  }
  return result;
}
function parse3mf(buffer) {
  const files = unzipSync(new Uint8Array(buffer));
  const main = files['3D/3dmodel.model'];
  if (!main) throw new Error('3D/3dmodel.model não encontrado.');
  const doc = new DOMParser().parseFromString(strFromU8(main), 'application/xml');
  const names = readNames(files), builds = {};
  for (const item of [...doc.getElementsByTagNameNS('*', 'item')]) {
    builds[item.getAttribute('objectid')] = parseTransform(item.getAttribute('transform'));
  }
  const pieces = [];
  for (const obj of [...doc.querySelectorAll('resources > object')]) {
    const id = obj.getAttribute('id');
    const component = obj.querySelector('component');
    if (!component) continue;
    const path = cleanPath(component.getAttributeNS('http://schemas.microsoft.com/3dmanufacturing/production/2015/06', 'path') || component.getAttribute('p:path'));
    const file = files[path];
    if (!file) continue;
    pieces.push({
      id,
      name: names[id] || `Objeto ${id}`,
      xml: strFromU8(file),
      componentTransform: parseTransform(component.getAttribute('transform')),
      buildTransform: builds[id] || parseTransform('')
    });
  }
  if (!pieces.length) throw new Error('Nenhuma peça foi encontrada no 3MF.');
  return pieces;
}
function pieceType(name) {
  const n = String(name || '').trim().toLowerCase();
  if (n === 'birx') return 'birx';
  if (n === 'nfc') return 'nfc';
  if (n.includes('black') || n.includes('cilindro')) return 'body';
  return 'detail';
}
function keepOnlyBirxSymbol(piece) {
  const all = geometryFromXml(piece.xml, piece.componentTransform, piece.buildTransform);
  const pos = all.getAttribute('position');
  let minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < pos.count; i++) {
    minY = Math.min(minY, pos.getY(i));
    maxY = Math.max(maxY, pos.getY(i));
  }
  all.dispose();
  const cut = minY + (maxY - minY) * 0.31;
  return points => (points[0][1] + points[1][1] + points[2][1]) / 3 > cut;
}
async function loadFont() {
  if (font) return font;
  const r = await fetch('https://cdn.jsdelivr.net/npm/three@0.180.0/examples/fonts/helvetiker_bold.typeface.json');
  if (!r.ok) throw new Error('Fonte 3D não carregou.');
  font = new FontLoader().parse(await r.json());
  return font;
}
function makeLabel(fontValue, label, fontSize, maxWidth, depth) {
  const g = new TextGeometry(label, {
    font: fontValue, size: fontSize, depth, curveSegments: 6,
    bevelEnabled: true, bevelThickness: .014, bevelSize: .009, bevelSegments: 2
  });
  g.computeBoundingBox();
  const s = new THREE.Vector3();
  g.boundingBox.getSize(s);
  const sc = Math.min(1, maxWidth / Math.max(s.x, .001));
  g.scale(sc, sc, sc);
  g.computeBoundingBox();
  const c = new THREE.Vector3();
  g.boundingBox.getCenter(c);
  g.translate(-c.x, -c.y, -c.z);
  const mesh = new THREE.Mesh(g, new THREE.MeshStandardMaterial({
    color:'#f5f5f2', roughness:.4,
    polygonOffset:true, polygonOffsetFactor:-5, polygonOffsetUnits:-5
  }));
  mesh.renderOrder = 6;
  return mesh;
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
holder.innerHTML = '';
holder.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.enableZoom = true;
controls.rotateSpeed = 1;

scene.add(new THREE.HemisphereLight(0xffffff, 0x667188, 2.5));
const key = new THREE.DirectionalLight(0xffffff, 4.1);
key.position.set(4,5,7);
scene.add(key);
const fill = new THREE.DirectionalLight(0xc8d8ff, 1.4);
fill.position.set(-5,2,3);
scene.add(fill);

const root = new THREE.Group();
scene.add(root);
let modelRoot = null;
let currentView = 'front';
let lastWidth = 0, lastHeight = 0;

function fitView(view = 'front') {
  if (!modelRoot) return;
  currentView = view === 'back' ? 'back' : 'front';
  root.rotation.set(0, currentView === 'back' ? Math.PI : 0, 0);
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const center = new THREE.Vector3(), size = new THREE.Vector3();
  box.getCenter(center); box.getSize(size);
  const vf = THREE.MathUtils.degToRad(camera.fov);
  const hf = 2 * Math.atan(Math.tan(vf / 2) * Math.max(camera.aspect, .1));
  const distance = Math.max((size.y/2)/Math.tan(vf/2), (size.x/2)/Math.tan(hf/2), size.z*2) * 1.20;
  controls.target.copy(center);
  camera.position.set(center.x, center.y, center.z + distance);
  camera.near = Math.max(.01, distance / 100);
  camera.far = Math.max(100, distance * 20);
  camera.updateProjectionMatrix();
  controls.minDistance = Math.max(.4, distance * .48);
  controls.maxDistance = Math.max(8, distance * 3.2);
  controls.update();
}
function resizeNow() {
  const rect = holder.getBoundingClientRect();
  const w = Math.max(1, Math.round(rect.width)), h = Math.max(1, Math.round(rect.height));
  if (w === lastWidth && h === lastHeight) return;
  lastWidth = w; lastHeight = h;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  if (modelRoot) fitView(currentView);
}
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

async function loadRealModel() {
  const response = await fetch('/api/modelo-birx-publico', { cache:'no-store' });
  if (!response.ok) throw new Error(`Modelo 3D indisponível (${response.status})`);
  const pieces = parse3mf(await response.arrayBuffer());
  modelRoot = new THREE.Group();
  const bodyMat = new THREE.MeshPhysicalMaterial({ color:'#151515', roughness:.43, metalness:.01, clearcoat:.12, clearcoatRoughness:.38 });
  const detailMat = new THREE.MeshStandardMaterial({ color:'#f5f5f2', roughness:.42, metalness:.01, polygonOffset:true, polygonOffsetFactor:-4, polygonOffsetUnits:-4 });
  for (const piece of pieces) {
    const type = pieceType(piece.name);
    const filter = type === 'birx' ? keepOnlyBirxSymbol(piece) : null;
    const mesh = new THREE.Mesh(geometryFromXml(piece.xml, piece.componentTransform, piece.buildTransform, filter), type === 'body' ? bodyMat.clone() : detailMat.clone());
    if (type !== 'body') mesh.renderOrder = 5;
    modelRoot.add(mesh);
  }
  const box = new THREE.Box3().setFromObject(modelRoot);
  const center = new THREE.Vector3(), size = new THREE.Vector3();
  box.getCenter(center); box.getSize(size);
  const scale = 3.65 / Math.max(size.x, size.y);
  modelRoot.scale.setScalar(scale);
  modelRoot.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
  modelRoot.rotation.y = Math.PI;
  root.add(modelRoot);
  root.updateMatrixWorld(true);
  const displayBox = new THREE.Box3().setFromObject(modelRoot);
  const displaySize = new THREE.Vector3(), displayCenter = new THREE.Vector3();
  displayBox.getSize(displaySize); displayBox.getCenter(displayCenter);
  const f = await loadFont();
  const nameMesh = makeLabel(f, 'BIRX', .43, displaySize.x * .72, .065);
  nameMesh.position.set(displayCenter.x, displayCenter.y - displaySize.y * .19, displayBox.max.z + .035);
  root.add(nameMesh);
  resizeNow();
  fitView('front');
}

new ResizeObserver(resizeNow).observe(holder);
window.addEventListener('resize', resizeNow, { passive:true });
resizeNow();
animate();
loadRealModel().catch(err => {
  console.error('BIRX loja 3D', err);
  holder.innerHTML = '<span class="birx-3d-fallback">BIRX ID</span>';
});

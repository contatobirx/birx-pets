import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/+esm';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js/+esm';
import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/FontLoader.js/+esm';
import { TextGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/geometries/TextGeometry.js/+esm';
import { unzipSync, strFromU8 } from 'https://cdn.jsdelivr.net/npm/fflate@0.8.2/+esm';

const $ = (id) => document.getElementById(id);
const MAX_PET_NAME_LENGTH = 8;
const WHATSAPP_BIRX = '5541988315017';
const state = {
  color: '#151515', colorName: 'Preto',
  detailColor: '#f5f5f2', detailColorName: 'Branco',
  name: 'THOR', sizeMm: 30, shape: 'redonda'
};

const holder = $('viewer3d');
let scene, camera, renderer, controls, root, modelRoot, nameMesh, font = null;
let bodyMeshes = [], detailMeshes = [];
let modelDisplayBox = null, currentView = 'front';
let lastWidth = 0, lastHeight = 0, resizeFrame = 0;

const petNameInput = $('petName');
if (petNameInput) {
  petNameInput.maxLength = MAX_PET_NAME_LENGTH;
  petNameInput.addEventListener('input', (event) => {
    event.target.value = event.target.value.replace(/[^A-Za-zÀ-ÿ0-9 -]/g, '').slice(0, MAX_PET_NAME_LENGTH);
  }, true);
}

function showLoadError(message) {
  const el = $('viewerLoading');
  if (!el) return;
  el.textContent = message || 'Não foi possível carregar a visualização 3D.';
  el.style.color = '#b42318';
}

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
  // No arquivo Separados correto há um vão natural entre o símbolo e as letras BIRX.
  // 31% da altura fica dentro desse vão e preserva integralmente o símbolo superior.
  const cut = minY + (maxY - minY) * 0.31;
  return points => (points[0][1] + points[1][1] + points[2][1]) / 3 > cut;
}

function buildSeparatedModel(pieces) {
  modelRoot = new THREE.Group();
  bodyMeshes = [];
  detailMeshes = [];

  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: state.color, roughness: .43, metalness: .01, clearcoat: .12, clearcoatRoughness: .38
  });
  const detailMaterial = new THREE.MeshStandardMaterial({
    color: state.detailColor, roughness: .42, metalness: .01,
    polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4
  });

  for (const piece of pieces) {
    const type = pieceType(piece.name);
    const filter = type === 'birx' ? keepOnlyBirxSymbol(piece) : null;
    const material = type === 'body' ? bodyMaterial.clone() : detailMaterial.clone();
    const mesh = new THREE.Mesh(geometryFromXml(piece.xml, piece.componentTransform, piece.buildTransform, filter), material);
    mesh.name = piece.name;
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    if (type === 'body') {
      bodyMeshes.push(mesh);
    } else {
      mesh.renderOrder = 5;
      detailMeshes.push(mesh);
    }
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
  modelDisplayBox = new THREE.Box3().setFromObject(modelRoot);
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
  const scale = Math.min(1, maxWidth / Math.max(s.x, .001));
  g.scale(scale, scale, scale);
  g.computeBoundingBox();
  const c = new THREE.Vector3();
  g.boundingBox.getCenter(c);
  g.translate(-c.x, -c.y, -c.z);
  const mesh = new THREE.Mesh(g, new THREE.MeshStandardMaterial({
    color: state.detailColor, roughness: .4,
    polygonOffset: true, polygonOffsetFactor: -5, polygonOffsetUnits: -5
  }));
  mesh.castShadow = true;
  mesh.renderOrder = 6;
  return mesh;
}

function disposeLabel(mesh) {
  if (!mesh) return;
  root.remove(mesh);
  mesh.geometry.dispose();
  mesh.material.dispose();
}

async function rebuildName() {
  if (!modelDisplayBox) return;
  disposeLabel(nameMesh);
  const f = await loadFont();
  const text = (state.name || 'PET').toUpperCase().slice(0, MAX_PET_NAME_LENGTH);
  const size = new THREE.Vector3(), center = new THREE.Vector3();
  modelDisplayBox.getSize(size); modelDisplayBox.getCenter(center);
  nameMesh = makeLabel(f, text, .43, size.x * .72, .065);
  // O nome ocupa exatamente a região onde estavam as letras BIRX.
  nameMesh.position.set(center.x, center.y - size.y * .19, modelDisplayBox.max.z + .035);
  root.add(nameMesh);
  updateSummary();
}

function updateBodyColor() {
  bodyMeshes.forEach(mesh => mesh.material.color.set(state.color));
  updateSummary();
}
function updateDetailColor() {
  detailMeshes.forEach(mesh => mesh.material.color.set(state.detailColor));
  if (nameMesh) nameMesh.material.color.set(state.detailColor);
  updateSummary();
}
function updateSummary() {
  $('sumColor').textContent = state.colorName;
  $('sumDetailColor').textContent = state.detailColorName;
  $('sumName').textContent = (state.name || 'PET').toUpperCase();
}

function fitView(view = 'front') {
  if (!root || !camera || !controls || !modelRoot) return;
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
  if (!renderer || !camera || !holder) return;
  const rect = holder.getBoundingClientRect(), w = Math.max(1, Math.round(rect.width)), h = Math.max(1, Math.round(rect.height));
  if (w === lastWidth && h === lastHeight) return;
  lastWidth = w; lastHeight = h;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  if (modelRoot) fitView(currentView);
}
function scheduleResize() {
  if (resizeFrame) return;
  resizeFrame = requestAnimationFrame(() => { resizeFrame = 0; resizeNow(); });
}
function animate() { requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera); }

function waitFrames(count = 3) {
  return new Promise(resolve => {
    const step = () => count-- <= 0 ? resolve() : requestAnimationFrame(step);
    requestAnimationFrame(step);
  });
}
function canvasBlob() {
  return new Promise((resolve, reject) => renderer.domElement.toBlob(
    blob => blob ? resolve(blob) : reject(new Error('Não foi possível gerar a imagem da BIRX ID.')),
    'image/png', .96
  ));
}
async function enviarPrevia(blob) {
  const form = new FormData();
  form.append('imagem', blob, 'birx-id-personalizada.png');
  form.append('nome', (state.name || 'PET').toUpperCase());
  const r = await fetch('/api/personalizacao-preview', { method: 'POST', body: form });
  const data = await r.json().catch(() => ({}));
  if (!r.ok || !data.sucesso || !data.url) throw new Error(data.mensagem || 'Não foi possível gerar a prévia do pedido.');
  return data.url;
}
function montarMensagemWhatsApp(previewUrl) {
  return [
    'Olá! Montei uma BIRX ID personalizada pelo site e quero fazer o pedido. 🐾','',
    `Nome: ${(state.name || 'PET').toUpperCase()}`,
    `Cor da peça: ${state.colorName}`,
    `Logo e letras: ${state.detailColorName}`,
    'Tamanho: 30 × 30 mm','Valor: R$ 49,90','',
    'Prévia frontal da minha BIRX ID:',previewUrl,'','Podem me ajudar a finalizar o pedido?'
  ].join('\n');
}
async function finalizarNoWhatsApp() {
  const button = $('addCustom'), message = $('customMessage');
  if (!(state.name || '').trim()) {
    message.textContent = 'Digite o nome do pet antes de finalizar.'; message.hidden = false; $('petName').focus(); return;
  }
  const popup = window.open('about:blank', '_blank');
  const oldText = button.textContent;
  button.disabled = true; button.textContent = 'Gerando sua prévia…';
  message.textContent = 'Preparando a imagem frontal da sua BIRX ID…'; message.hidden = false;
  try {
    fitView('front'); await waitFrames(); renderer.render(scene, camera);
    const previewUrl = await enviarPrevia(await canvasBlob());
    const payload = {...state, modeloBase:'Separados.3mf', frente:'simbolo-original+nome-personalizado+nfc-original', verso:'original', previewUrl, criadoEm:new Date().toISOString()};
    try { localStorage.setItem('birx_personalizacao_pendente', JSON.stringify(payload)); } catch {}
    const url = `https://wa.me/${WHATSAPP_BIRX}?text=${encodeURIComponent(montarMensagemWhatsApp(previewUrl))}`;
    if (popup && !popup.closed) popup.location.href = url; else window.location.href = url;
  } catch (error) {
    if (popup && !popup.closed) popup.close();
    console.error(error); message.textContent = error.message || 'Não foi possível preparar o pedido.';
    button.disabled = false; button.textContent = oldText;
  }
}

async function loadRealModel() {
  try {
    const response = await fetch('/api/modelo-birx-publico', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Modelo 3D indisponível (${response.status})`);
    const pieces = parse3mf(await response.arrayBuffer());
    const names = pieces.map(p => p.name.trim().toLowerCase());
    if (!names.includes('birx') || !names.includes('nfc')) {
      throw new Error('O arquivo 3MF ativo não é o Separados correto com as peças BIRX e NFC.');
    }
    buildSeparatedModel(pieces);
    await rebuildName();
    fitView('front');
    $('viewerLoading')?.remove();
    console.info('BIRX peças:', pieces.map(p => p.name));
  } catch (error) {
    console.error('BIRX 3MF', error);
    showLoadError(error.message);
  }
}

try {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
  renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true, preserveDrawingBuffer:true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  holder.appendChild(renderer.domElement);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x667188, 2.5));
  const key = new THREE.DirectionalLight(0xffffff, 4.1); key.position.set(4,5,7); scene.add(key);
  const fill = new THREE.DirectionalLight(0xc8d8ff, 1.4); fill.position.set(-5,2,3); scene.add(fill);
  root = new THREE.Group(); scene.add(root);
  new ResizeObserver(scheduleResize).observe(holder);
  window.addEventListener('resize', scheduleResize, { passive:true });
  resizeNow(); animate(); loadRealModel();

  document.querySelectorAll('#colorGrid [data-color]').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('#colorGrid [data-color]').forEach(x => x.classList.toggle('selected', x === b));
    state.color = b.dataset.color; state.colorName = b.dataset.name; updateBodyColor();
  }));
  document.querySelectorAll('#detailColorGrid [data-detail-color]').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('#detailColorGrid [data-detail-color]').forEach(x => x.classList.toggle('selected', x === b));
    state.detailColor = b.dataset.detailColor; state.detailColorName = b.dataset.name; updateDetailColor();
  }));
  $('petName').addEventListener('input', e => {
    state.name = e.target.value.replace(/[^A-Za-zÀ-ÿ0-9 -]/g, '').slice(0, MAX_PET_NAME_LENGTH);
    e.target.value = state.name;
    rebuildName().then(() => fitView(currentView)).catch(console.error);
  });
  document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => fitView(b.dataset.view === 'back' ? 'back' : 'front')));
  $('addCustom').addEventListener('click', finalizarNoWhatsApp);
} catch (error) {
  console.error('BIRX personalizador 3D', error);
  showLoadError('Não foi possível iniciar o visualizador 3D neste navegador.');
}

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/+esm';
import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/FontLoader.js/+esm';
import { TextGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/geometries/TextGeometry.js/+esm';
import { unzipSync, strFromU8 } from 'https://cdn.jsdelivr.net/npm/fflate@0.8.2/+esm';

let cachedPieces = null;
let font = null;

const parseTransform = (value) => {
  const a = String(value || '1 0 0 0 1 0 0 0 1 0 0 0').trim().split(/\s+/).map(Number);
  return a.length === 12 ? a : [1,0,0,0,1,0,0,0,1,0,0,0];
};

const transformPoint = (v, t) => {
  const [a,b,c,d,e,f,g,h,i,j,k,l] = t;
  const [x,y,z] = v;
  return [a*x+d*y+g*z+j, b*x+e*y+h*z+k, c*x+f*y+i*z+l];
};

const cleanPath = (path) => String(path || '').replace(/^\//, '');

function geometryFromXml(xml, componentTransform, buildTransform, filter = null) {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const vertices = [...doc.getElementsByTagNameNS('*', 'vertex')].map(v => [
    Number(v.getAttribute('x')),
    Number(v.getAttribute('y')),
    Number(v.getAttribute('z')),
  ]);

  const positions = [];
  for (const tri of [...doc.getElementsByTagNameNS('*', 'triangle')]) {
    const points = ['v1', 'v2', 'v3'].map(key =>
      transformPoint(
        transformPoint(vertices[Number(tri.getAttribute(key))], componentTransform),
        buildTransform,
      )
    );
    if (filter && !filter(points)) continue;
    points.forEach(point => positions.push(...point));
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  return geometry;
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
  if (!main) throw new Error('3MF inválido');

  const doc = new DOMParser().parseFromString(strFromU8(main), 'application/xml');
  const names = readNames(files);
  const builds = {};

  for (const item of [...doc.getElementsByTagNameNS('*', 'item')]) {
    builds[item.getAttribute('objectid')] = parseTransform(item.getAttribute('transform'));
  }

  const pieces = [];
  for (const obj of [...doc.querySelectorAll('resources > object')]) {
    const id = obj.getAttribute('id');
    const component = obj.querySelector('component');
    if (!component) continue;

    const path = cleanPath(
      component.getAttributeNS(
        'http://schemas.microsoft.com/3dmanufacturing/production/2015/06',
        'path',
      ) || component.getAttribute('p:path'),
    );
    const file = files[path];
    if (!file) continue;

    pieces.push({
      id,
      name: names[id] || `Objeto ${id}`,
      xml: strFromU8(file),
      componentTransform: parseTransform(component.getAttribute('transform')),
      buildTransform: builds[id] || parseTransform(''),
    });
  }

  if (!pieces.length) throw new Error('Nenhuma peça encontrada no 3MF');
  return pieces;
}

async function getPieces() {
  if (cachedPieces) return cachedPieces;
  const response = await fetch('/api/modelo-birx-publico', { cache: 'no-store' });
  if (!response.ok) throw new Error('Modelo indisponível');
  cachedPieces = parse3mf(await response.arrayBuffer());
  return cachedPieces;
}

async function getFont() {
  if (font) return font;
  const response = await fetch('https://cdn.jsdelivr.net/npm/three@0.180.0/examples/fonts/helvetiker_bold.typeface.json');
  if (!response.ok) throw new Error('Fonte 3D indisponível');
  font = new FontLoader().parse(await response.json());
  return font;
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
  let minY = Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < pos.count; i++) {
    minY = Math.min(minY, pos.getY(i));
    maxY = Math.max(maxY, pos.getY(i));
  }
  all.dispose();

  const cut = minY + (maxY - minY) * 0.31;
  return points => (points[0][1] + points[1][1] + points[2][1]) / 3 > cut;
}

function makeTextMesh(fontValue, label, fontSize, maxWidth, depth, color) {
  const geometry = new TextGeometry(label, {
    font: fontValue,
    size: fontSize,
    depth,
    curveSegments: 5,
    bevelEnabled: true,
    bevelThickness: 0.014,
    bevelSize: 0.009,
    bevelSegments: 2,
  });

  geometry.computeBoundingBox();
  const labelSize = new THREE.Vector3();
  geometry.boundingBox.getSize(labelSize);
  const textScale = Math.min(1, maxWidth / Math.max(labelSize.x, 0.001));
  geometry.scale(textScale, textScale, textScale);
  geometry.computeBoundingBox();

  const labelCenter = new THREE.Vector3();
  geometry.boundingBox.getCenter(labelCenter);
  geometry.translate(-labelCenter.x, -labelCenter.y, -labelCenter.z);

  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.4,
      polygonOffset: true,
      polygonOffsetFactor: -5,
      polygonOffsetUnits: -5,
    }),
  );
  mesh.renderOrder = 6;
  return mesh;
}

async function buildViewer(holder) {
  const bodyColor = holder.dataset.body || '#151515';
  const detailColor = holder.dataset.detail || '#f5f5f2';
  const name = (holder.dataset.name || '').trim().toUpperCase().slice(0, 8);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  holder.innerHTML = '';
  holder.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x61708c, 2.8));
  const key = new THREE.DirectionalLight(0xffffff, 4.2);
  key.position.set(4, 5, 7);
  scene.add(key);

  const root = new THREE.Group();
  const model = new THREE.Group();
  scene.add(root);

  const pieces = await getPieces();
  for (const piece of pieces) {
    const type = pieceType(piece.name);
    const filter = name && type === 'birx' ? keepOnlyBirxSymbol(piece) : null;
    const geometry = geometryFromXml(piece.xml, piece.componentTransform, piece.buildTransform, filter);
    const material = new THREE.MeshStandardMaterial({
      color: type === 'body' ? bodyColor : detailColor,
      roughness: 0.43,
      metalness: 0.01,
      polygonOffset: type !== 'body',
      polygonOffsetFactor: -3,
      polygonOffsetUnits: -3,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.renderOrder = type === 'body' ? 1 : 5;
    model.add(mesh);
  }

  let box = new THREE.Box3().setFromObject(model);
  const center = new THREE.Vector3();
  const size = new THREE.Vector3();
  box.getCenter(center);
  box.getSize(size);

  if (!Number.isFinite(size.x) || !Number.isFinite(size.y) || Math.max(size.x, size.y) <= 0) {
    throw new Error('Geometria inválida');
  }

  const scale = 3.65 / Math.max(size.x, size.y);
  model.scale.setScalar(scale);
  model.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
  model.rotation.y = Math.PI;
  root.add(model);
  root.updateMatrixWorld(true);

  box = new THREE.Box3().setFromObject(model);
  box.getCenter(center);
  box.getSize(size);

  if (name) {
    const f = await getFont();
    const nameMesh = makeTextMesh(f, name, 0.43, size.x * 0.72, 0.065, detailColor);
    nameMesh.position.set(center.x, center.y - size.y * 0.19, box.max.z + 0.035);
    root.add(nameMesh);
  }

  function fit() {
    const rect = holder.getBoundingClientRect();
    const w = Math.max(1, rect.width);
    const h = Math.max(1, rect.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    root.rotation.set(0, 0, 0);
    root.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(root);
    const c = new THREE.Vector3();
    const s = new THREE.Vector3();
    bounds.getCenter(c);
    bounds.getSize(s);

    const vf = THREE.MathUtils.degToRad(camera.fov);
    const hf = 2 * Math.atan(Math.tan(vf / 2) * Math.max(camera.aspect, 0.1));
    const distance = Math.max(
      (s.y / 2) / Math.tan(vf / 2),
      (s.x / 2) / Math.tan(hf / 2),
      s.z * 2,
    ) * 1.22;

    camera.position.set(c.x, c.y, c.z + distance);
    camera.lookAt(c);
    renderer.render(scene, camera);
  }

  fit();
  new ResizeObserver(fit).observe(holder);
}

Promise.all(
  [...document.querySelectorAll('[data-birx-3d]')].map(el =>
    buildViewer(el).catch(err => {
      console.error('BIRX home 3D', err);
      el.innerHTML = '<span class="birx-3d-fallback">BIRX ID</span>';
    })
  )
);

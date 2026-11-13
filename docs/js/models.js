import * as THREE from 'three';
import { plankTexture, woodTexture, roofTexture, brickTexture, barkTexture, cowTexture, faceTexture } from './textures.js';

const M = (opts) => new THREE.MeshLambertMaterial(opts);
function box(w, h, d, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
function cyl(rt, rb, h, mat, x = 0, y = 0, z = 0, seg = 8) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  return m;
}
function blob(r, mat, x = 0, y = 0, z = 0, detail = 0) {
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, detail), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  return m;
}

// ==================== ЗДАНИЯ ====================

export function createHouse({ wall = '#e8d5b0', roof = '#8b3a2a', w = 8, h = 4, d = 6 } = {}) {
  const g = new THREE.Group();
  const wallMat = M({ map: plankTexture(wall, 3) });
  const roofMat = M({ map: roofTexture(roof) });
  g.add(box(w, h, d, wallMat, 0, h / 2, 0));
  // Двускатная крыша
  const roofL = new THREE.Mesh(new THREE.BoxGeometry(w + 1.2, 0.3, Math.hypot(d / 2 + 0.8, 2.6)), roofMat);
  roofL.position.set(0, h + 1.15, -(d / 4 + 0.2));
  roofL.rotation.x = Math.atan2(2.6, d / 2 + 0.8);
  roofL.castShadow = true;
  const roofR = roofL.clone(); roofR.rotation.x = -roofL.rotation.x; roofR.position.z = d / 4 + 0.2;
  g.add(roofL, roofR);
  // Конёк и фронтоны
  g.add(box(w + 1.2, 0.35, 0.5, M({ color: 0x5a3c24 }), 0, h + 2.45, 0));
  const gableGeo = new THREE.CylinderGeometry(0.01, Math.min(w, d) * 0.02, 0.01, 3);
  const tri = new THREE.Shape();
  tri.moveTo(-w / 2, 0); tri.lineTo(w / 2, 0); tri.lineTo(0, 2.6); tri.closePath();
  const gableMat = wallMat;
  const gableL = new THREE.Mesh(new THREE.ShapeGeometry(tri), gableMat);
  gableL.position.set(0, h, -d / 2 - 0.01);
  const gableR = gableL.clone(); gableR.position.z = d / 2 + 0.01; gableR.rotation.y = Math.PI;
  g.add(gableL, gableR);
  // Труба с дымом
  const chimney = box(0.9, 2.2, 0.9, M({ map: brickTexture() }), w / 4, h + 2.2, -d / 4);
  g.add(chimney);
  g.add(box(1.1, 0.25, 1.1, M({ color: 0x555555 }), w / 4, h + 3.35, -d / 4));
  // Дверь с рамой и крылечком
  g.add(box(1.6, 2.6, 0.2, M({ color: 0x6b451f }), 0, 1.3, d / 2 + 0.05));
  g.add(box(1.9, 0.2, 0.4, M({ color: 0x8b6a3f }), 0, 2.75, d / 2 + 0.1));
  g.add(box(2.4, 0.25, 1.2, M({ map: plankTexture('#a5772a', 8) }), 0, 0.12, d / 2 + 0.7));
  g.add(box(0.15, 0.6, 0.15, M({ color: 0x6b451f }), -1, 0.5, d / 2 + 1.1));
  g.add(box(0.15, 0.6, 0.15, M({ color: 0x6b451f }), 1, 0.5, d / 2 + 1.1));
  // Окна со ставнями
  for (const wx of [-w / 4, w / 4]) {
    g.add(box(1.5, 1.3, 0.12, M({ color: 0x9fd4e8, emissive: 0x223a44 }), wx, h * 0.55, d / 2 + 0.04));
    g.add(box(1.7, 0.15, 0.16, M({ color: 0x5a3c24 }), wx, h * 0.55 + 0.75, d / 2 + 0.05));
    g.add(box(1.7, 0.15, 0.16, M({ color: 0x5a3c24 }), wx, h * 0.55 - 0.75, d / 2 + 0.05));
    g.add(box(0.5, 1.3, 0.1, M({ map: plankTexture('#7a9a4a', 4) }), wx - 1.05, h * 0.55, d / 2 + 0.06));
    g.add(box(0.5, 1.3, 0.1, M({ map: plankTexture('#7a9a4a', 4) }), wx + 1.05, h * 0.55, d / 2 + 0.06));
  }
  return g;
}

export function createBarn() {
  const g = new THREE.Group();
  const red = M({ map: plankTexture('#b0413e', 2) });
  const white = M({ color: 0xf0ece0 });
  g.add(box(9, 5, 7, red, 0, 2.5, 0));
  const roofL = new THREE.Mesh(new THREE.BoxGeometry(10, 0.3, 4.6), M({ map: roofTexture('#6b451f') }));
  roofL.position.set(0, 6, -1.9); roofL.rotation.x = 0.62; roofL.castShadow = true;
  const roofR = roofL.clone(); roofR.rotation.x = -0.62; roofR.position.z = 1.9;
  g.add(roofL, roofR);
  // Большие ворота с крестом
  g.add(box(3.4, 3.6, 0.2, white, 0, 1.8, 3.55));
  g.add(box(3.6, 0.25, 0.24, M({ color: 0x6b451f }), 0, 1.8, 3.62));
  const cross1 = box(0.25, 4.4, 0.24, M({ color: 0x6b451f }), 0, 1.8, 3.62);
  cross1.rotation.z = 0.65; g.add(cross1);
  const cross2 = cross1.clone(); cross2.rotation.z = -0.65; g.add(cross2);
  // Сеновал наверху
  g.add(box(2.6, 2, 0.2, M({ color: 0x9fd4e8 }), 0, 5.6, 3.55));
  return g;
}

export function createCoop() {
  const g = new THREE.Group();
  g.add(box(4.5, 2.6, 3.5, M({ map: plankTexture('#d9a441', 6) }), 0, 1.3, 0));
  const roofL = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.25, 2.4), M({ map: roofTexture('#8b5a2b') }));
  roofL.position.set(0, 3.1, -1); roofL.rotation.x = 0.7; roofL.castShadow = true;
  const roofR = roofL.clone(); roofR.rotation.x = -0.7; roofR.position.z = 1;
  g.add(roofL, roofR);
  g.add(box(1, 1.2, 0.15, M({ color: 0x4a3a2a }), 0, 0.6, 1.78));
  g.add(box(1.4, 0.12, 1.6, M({ map: plankTexture('#a5772a', 9) }), 0, 0.06, 2.6));
  g.add(box(0.12, 0.5, 1.2, M({ color: 0xa5772a }), -0.6, 0.3, 2.6));
  return g;
}

export function createWindmill() {
  const g = new THREE.Group();
  const body = cyl(1.4, 2.2, 7, M({ map: plankTexture('#c9b8a0', 12) }), 0, 3.5, 0, 8);
  g.add(body);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(1.9, 1.6, 8), M({ map: roofTexture('#6b451f') }));
  cap.position.y = 7.8; cap.castShadow = true;
  g.add(cap);
  const blades = new THREE.Group();
  const bladeMat = M({ map: plankTexture('#e8dcc8', 14), side: THREE.DoubleSide });
  for (let i = 0; i < 4; i++) {
    const b = box(0.5, 5.4, 0.08, bladeMat, 0, 2.7, 0);
    const pivot = new THREE.Group();
    pivot.add(b);
    pivot.rotation.z = (i / 4) * Math.PI * 2;
    blades.add(pivot);
  }
  blades.position.set(0, 7, 2.1);
  g.add(blades);
  g.userData.blades = blades;
  return g;
}

export function createWell() {
  const g = new THREE.Group();
  g.add(cyl(1.1, 1.2, 1, M({ map: brickTexture() }), 0, 0.5, 0, 10));
  g.add(box(0.2, 2, 0.2, M({ color: 0x6b451f }), -1, 1.5, 0));
  g.add(box(0.2, 2, 0.2, M({ color: 0x6b451f }), 1, 1.5, 0));
  const roofL = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.2, 1.4), M({ map: roofTexture('#8b3a2a') }));
  roofL.position.set(0, 2.7, -0.45); roofL.rotation.x = 0.55; roofL.castShadow = true;
  const roofR = roofL.clone(); roofR.rotation.x = -0.55; roofR.position.z = 0.45;
  g.add(roofL, roofR);
  const axle = cyl(0.08, 0.08, 1.6, M({ color: 0x8b6a3f }), 0, 2, 0, 6);
  axle.rotation.z = Math.PI / 2;
  g.add(axle);
  return g;
}

export function createLampPost() {
  const g = new THREE.Group();
  const poleMat = M({ color: 0x3a3a3a });
  g.add(cyl(0.08, 0.12, 3, poleMat, 0, 1.5, 0, 6));
  const lampMat = M({ color: 0xf5d442, emissive: 0x000000 });
  g.add(box(0.45, 0.55, 0.45, lampMat, 0, 3.3, 0));
  const capMesh = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.35, 4), poleMat);
  capMesh.position.y = 3.75;
  g.add(capMesh);
  g.userData.lampMat = lampMat;
  return g;
}

export function createChurch() {
  const g = new THREE.Group();
  const white = M({ map: plankTexture('#efe8d8', 17) });
  g.add(box(5, 6, 5, white, 0, 3, 0));
  const apse = cyl(2, 2, 6, white, 0, 3, 3.4, 8);
  g.add(apse);
  const dome = new THREE.Mesh(new THREE.ConeGeometry(3.9, 3, 4), M({ map: roofTexture('#4a6a8f') }));
  dome.position.y = 7.4; dome.castShadow = true;
  g.add(dome);
  g.add(box(0.7, 2.6, 0.7, M({ color: 0x8b5a2b }), 0, 9.2, 0));
  g.add(box(0.45, 0.8, 0.12, M({ color: 0xd9a441, emissive: 0x442200 }), 0, 10, 0));
  g.add(box(1.2, 2, 0.15, M({ color: 0x6b451f }), 0, 1, 2.55));
  return g;
}

export function createShopBuilding() {
  const g = createHouse({ wall: '#7ab06b', roof: '#4a8f3c', w: 7, h: 3.6, d: 5 });
  const sign = box(3.2, 1, 0.15, M({ map: plankTexture('#6b451f', 19) }), 0, 3, 2.6);
  g.add(sign);
  for (const [i, ch] of [['🏪', -1], ['М', 0], ['А', 0.7]]) { /* пиктограммы не рисуем на box — пропускаем */ }
  g.add(box(2.2, 0.9, 0.1, M({ color: 0xf5d442 }), 0, 3, 2.7));
  return g;
}

export function createMayorHall() {
  const g = new THREE.Group();
  g.add(box(9, 5, 6, M({ map: plankTexture('#d6cba8', 21) }), 0, 2.5, 0));
  const roofL = new THREE.Mesh(new THREE.BoxGeometry(10, 0.3, 4), M({ map: roofTexture('#5a6a7a') }));
  roofL.position.set(0, 5.6, -1.6); roofL.rotation.x = 0.65; roofL.castShadow = true;
  const roofR = roofL.clone(); roofR.rotation.x = -0.65; roofR.position.z = 1.6;
  g.add(roofL, roofR);
  for (const cx of [-3, 0, 3]) {
    g.add(cyl(0.18, 0.18, 3.4, M({ color: 0xf0ece0 }), cx, 1.7, 3.2, 6));
  }
  g.add(box(7.4, 0.4, 1.6, M({ map: plankTexture('#d6cba8', 23) }), 0, 3.5, 3.4));
  g.add(box(0.5, 2.4, 0.5, M({ color: 0x8b5a2b }), -3, 6.6, 0));
  g.add(box(1.3, 1.3, 1.3, M({ color: 0xd9a441, emissive: 0x332200 }), -3, 8.1, 0));
  return g;
}

export function createLighthouse() {
  const g = new THREE.Group();
  g.add(cyl(1.1, 1.6, 8, M({ map: plankTexture('#e8e8e8', 25) }), 0, 4, 0, 10));
  g.add(cyl(1.15, 1.15, 1.2, M({ color: 0xb0413e }), 0, 2.2, 0, 10));
  g.add(cyl(1.15, 1.15, 1.2, M({ color: 0xb0413e }), 0, 5.2, 0, 10));
  g.add(cyl(1.3, 1.3, 1.2, M({ color: 0xf5d442, emissive: 0x664400 }), 0, 8.6, 0, 10));
  const top = new THREE.Mesh(new THREE.ConeGeometry(1.6, 1.2, 10), M({ color: 0xb0413e }));
  top.position.y = 9.8;
  g.add(top);
  return g;
}

export function createBridge() {
  const g = new THREE.Group();
  const woodMat = M({ map: plankTexture('#8b5a2b', 27) });
  g.add(box(3.4, 0.35, 18, woodMat, 0, 0.4, 0));
  for (const sx of [-1.6, 1.6]) {
    g.add(box(0.25, 1, 18, M({ color: 0x6b451f }), sx, 0.95, 0));
    for (let z = -8; z <= 8; z += 4) g.add(box(0.3, 1.3, 0.3, M({ color: 0x6b451f }), sx, 0.9, z));
  }
  for (const z of [-6, 0, 6]) {
    g.add(box(0.4, 1.8, 0.4, M({ color: 0x6b451f }), -1.4, 0.2, z));
    g.add(box(0.4, 1.8, 0.4, M({ color: 0x6b451f }), 1.4, 0.2, z));
  }
  return g;
}

export function createPier() {
  const g = new THREE.Group();
  const woodMat = M({ map: plankTexture('#8b5a2b', 29) });
  g.add(box(2.4, 0.25, 6, woodMat, 0, 0.35, 0));
  for (const z of [-2.4, 0, 2.4]) {
    g.add(cyl(0.1, 0.1, 2, M({ color: 0x6b451f }), -1, -0.3, z, 6));
    g.add(cyl(0.1, 0.1, 2, M({ color: 0x6b451f }), 1, -0.3, z, 6));
  }
  return g;
}

export function createBoat() {
  const g = new THREE.Group();
  const woodMat = M({ map: plankTexture('#a5772a', 31) });
  g.add(box(1.2, 0.5, 2.6, woodMat, 0, 0.25, 0));
  g.add(box(1, 0.4, 0.3, M({ color: 0x6b451f }), 0, 0.5, 1.2));
  g.add(box(1, 0.4, 0.3, M({ color: 0x6b451f }), 0, 0.5, -1.2));
  g.add(cyl(0.05, 0.05, 2, M({ color: 0x6b451f }), 0, 1.3, 0, 6));
  g.add(box(0.05, 1.2, 0.9, M({ color: 0xf0ece0, side: THREE.DoubleSide }), 0.4, 1.4, 0));
  return g;
}

export function createMineEntrance() {
  const g = new THREE.Group();
  const rockMat = M({ color: 0x7a7a72, flatShading: true });
  g.add(blob(2.6, rockMat, -2, 0.8, 0));
  g.add(blob(2.2, rockMat, 2, 0.7, 0));
  g.add(blob(1.8, rockMat, 0, 2.2, -0.5));
  const beamMat = M({ map: plankTexture('#6b451f', 33) });
  g.add(box(0.4, 2.6, 0.4, beamMat, -1.2, 1.3, 1));
  g.add(box(0.4, 2.6, 0.4, beamMat, 1.2, 1.3, 1));
  g.add(box(3, 0.4, 0.5, beamMat, 0, 2.7, 1));
  g.add(box(2, 1.8, 0.2, M({ color: 0x0a0a0a }), 0, 0.9, 1.05));
  return g;
}

export function createChest() {
  const g = new THREE.Group();
  const woodMat = M({ map: plankTexture('#8b5a2b', 35) });
  g.add(box(1.5, 0.8, 1, woodMat, 0, 0.4, 0));
  g.add(box(1.5, 0.4, 1, woodMat, 0, 1, 0));
  g.add(box(1.56, 0.14, 1.06, M({ color: 0xd9a441, emissive: 0x332200 }), 0, 0.95, 0));
  g.add(box(0.3, 0.3, 0.1, M({ color: 0xd9a441, emissive: 0x332200 }), 0, 0.55, 0.52));
  return g;
}

// ==================== ПРИРОДА ====================

const foliageMats = [];
export function seasonFoliageMats() { return foliageMats; }

export function createTree({ type = 'oak', scale = 1 } = {}) {
  const g = new THREE.Group();
  const birch = type === 'birch';
  const trunkMat = M({ map: barkTexture(birch) });
  const leafMat = M({ color: type === 'pine' ? 0x2f6a35 : 0x4a9a3f, flatShading: true });
  if (type !== 'pine') foliageMats.push({ mat: leafMat, kind: 'leaf' });
  if (type === 'pine') {
    g.add(cyl(0.22 * scale, 0.4 * scale, 2.6 * scale, trunkMat, 0, 1.3 * scale, 0, 6));
    for (let i = 0; i < 3; i++) {
      const cone = new THREE.Mesh(new THREE.ConeGeometry((1.9 - i * 0.45) * scale, 2.2 * scale, 7), leafMat);
      cone.position.y = (2.6 + i * 1.3) * scale;
      cone.castShadow = true;
      g.add(cone);
    }
  } else {
    g.add(cyl(0.3 * scale, 0.5 * scale, 2.6 * scale, trunkMat, 0, 1.3 * scale, 0, 6));
    const blobs = birch ? 2 : 3;
    for (let i = 0; i < blobs; i++) {
      const b = blob((1.5 - i * 0.25) * scale, leafMat, (Math.random() - 0.5) * 1.2 * scale, (3.4 + i * 0.9) * scale, (Math.random() - 0.5) * 1.2 * scale, 0);
      g.add(b);
    }
  }
  return g;
}

export function createBush(scale = 1) {
  const mat = M({ color: 0x3f8a35, flatShading: true });
  foliageMats.push({ mat, kind: 'leaf' });
  const g = new THREE.Group();
  g.add(blob(0.7 * scale, mat, 0, 0.5 * scale, 0));
  g.add(blob(0.5 * scale, mat, 0.5 * scale, 0.35 * scale, 0.2 * scale));
  return g;
}

export function createFlower(color = 0xe05a7a) {
  const g = new THREE.Group();
  const stem = cyl(0.02, 0.03, 0.4, M({ color: 0x4a8a32 }), 0, 0.2, 0, 4);
  g.add(stem);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 5), M({ color, emissive: 0x110000 }));
  head.position.y = 0.44;
  g.add(head);
  for (let p = 0; p < 4; p++) {
    const petal = new THREE.Mesh(new THREE.SphereGeometry(0.06, 5, 4), M({ color }));
    const a = (p / 4) * Math.PI * 2;
    petal.position.set(Math.cos(a) * 0.1, 0.44, Math.sin(a) * 0.1);
    g.add(petal);
  }
  return g;
}

export function createMushroom() {
  const g = new THREE.Group();
  g.add(cyl(0.06, 0.09, 0.25, M({ color: 0xf0e8d8 }), 0, 0.12, 0, 6));
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.18, 7, 5, 0, Math.PI * 2, 0, Math.PI / 2), M({ color: 0xc44a3a }));
  cap.position.y = 0.24;
  g.add(cap);
  return g;
}

export function createRock(size = 1) {
  return blob(0.9 * size, M({ color: 0x8f8f8f, flatShading: true }), 0, 0.55 * size, 0);
}

export function createStump() {
  const g = new THREE.Group();
  g.add(cyl(0.5, 0.6, 0.7, M({ map: barkTexture(false) }), 0, 0.35, 0, 7));
  g.add(cyl(0.48, 0.48, 0.06, M({ color: 0xc9a86a }), 0, 0.72, 0, 7));
  return g;
}

export function createHaystack() {
  const g = new THREE.Group();
  const hayMat = M({ color: 0xd9b84a, flatShading: true });
  g.add(blob(1.1, hayMat, 0, 0.8, 0));
  g.add(blob(0.7, hayMat, 0.6, 0.5, 0.3));
  return g;
}

export function createCrateStack() {
  const g = new THREE.Group();
  const mat = M({ map: plankTexture('#a5772a', 37) });
  g.add(box(0.9, 0.9, 0.9, mat, 0, 0.45, 0));
  g.add(box(0.8, 0.8, 0.8, mat, 0.2, 1.3, 0.1));
  return g;
}

export function createBarrel() {
  const g = new THREE.Group();
  g.add(cyl(0.45, 0.38, 1.1, M({ map: plankTexture('#8b6a3f', 39) }), 0, 0.55, 0, 9));
  g.add(cyl(0.47, 0.47, 0.08, M({ color: 0x444444 }), 0, 0.3, 0, 9));
  g.add(cyl(0.47, 0.47, 0.08, M({ color: 0x444444 }), 0, 0.85, 0, 9));
  return g;
}

export function createSign(text = 'Берёзовка') {
  const g = new THREE.Group();
  g.add(cyl(0.07, 0.07, 1.6, M({ color: 0x6b451f }), 0, 0.8, 0, 5));
  const [c, x] = [document.createElement('canvas'), null];
  c.width = 256; c.height = 64;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#a5772a'; ctx.fillRect(0, 0, 256, 64);
  ctx.strokeStyle = '#6b451f'; ctx.lineWidth = 6; ctx.strokeRect(3, 3, 250, 58);
  ctx.fillStyle = '#3a2a10';
  ctx.font = 'bold 30px sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 34);
  const tex = new THREE.CanvasTexture(c);
  const board = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.55, 0.1), [M({ color: 0x8b6a3f }), M({ color: 0x8b6a3f }), M({ color: 0x8b6a3f }), M({ color: 0x8b6a3f }), new THREE.MeshLambertMaterial({ map: tex }), M({ color: 0x8b6a3f })]);
  board.position.y = 1.5;
  board.castShadow = true;
  g.add(board);
  return g;
}

export function createCloud() {
  const g = new THREE.Group();
  const mat = M({ color: 0xffffff, transparent: true, opacity: 0.92, flatShading: true });
  for (let i = 0; i < 4 + Math.floor(Math.random() * 3); i++) {
    const b = blob(1 + Math.random() * 1.4, mat, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 3);
    b.castShadow = false;
    g.add(b);
  }
  return g;
}

export function createButterfly(color = 0xe05a7a) {
  const g = new THREE.Group();
  const wingMat = new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
  const wingL = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.16), wingMat);
  wingL.position.x = -0.11;
  const wingR = wingL.clone(); wingR.position.x = 0.11;
  g.add(wingL, wingR);
  g.userData.wings = [wingL, wingR];
  return g;
}

export function createBird() {
  const g = new THREE.Group();
  const mat = M({ color: 0x3a3a3a, side: THREE.DoubleSide });
  const wL = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.16), mat);
  wL.position.x = -0.25;
  const wR = wL.clone(); wR.position.x = 0.25;
  g.add(wL, wR);
  g.userData.wings = [wL, wR];
  return g;
}

// ==================== ПЕРСОНАЖИ ====================

export function createHumanoid(shirtColor = 0x4a8f3c, skinColor = 0xf0c8a0, pantsColor = 0x3a5a8f, { hat = 'straw', hair = '#5a3a1a' } = {}) {
  const g = new THREE.Group();
  const shirt = M({ map: plankTexture('#' + shirtColor.toString(16).padStart(6, '0'), 41) });
  const skin = M({ color: skinColor });
  const pants = M({ color: pantsColor });

  const body = box(0.72, 0.9, 0.42, shirt, 0, 1.05, 0);
  g.add(body);
  // Голова с лицом
  const headMats = [skin, skin, skin, skin, new THREE.MeshLambertMaterial({ map: faceTexture('#' + skinColor.toString(16).padStart(6, '0')) }), skin];
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), headMats);
  head.position.y = 1.82; head.castShadow = true;
  g.add(head);
  // Волосы
  const hairMat = M({ color: hair });
  const hairTop = box(0.54, 0.14, 0.54, hairMat, 0, 2.06, 0);
  const hairBack = box(0.54, 0.3, 0.12, hairMat, 0, 1.9, -0.22);
  g.add(hairTop, hairBack);
  // Ноги с шарнирами
  const mkLeg = (x) => {
    const pivot = new THREE.Group();
    pivot.position.set(x, 0.62, 0);
    const leg = box(0.24, 0.62, 0.28, pants, 0, -0.31, 0);
    const boot = box(0.26, 0.16, 0.34, M({ color: 0x4a3a2a }), 0, -0.62, 0.03);
    pivot.add(leg, boot);
    g.add(pivot);
    return pivot;
  };
  const mkArm = (x) => {
    const pivot = new THREE.Group();
    pivot.position.set(x, 1.42, 0);
    const arm = box(0.18, 0.55, 0.22, shirt, 0, -0.28, 0);
    const hand = box(0.16, 0.16, 0.18, skin, 0, -0.62, 0);
    pivot.add(arm, hand);
    g.add(pivot);
    return pivot;
  };
  const legL = mkLeg(-0.19), legR = mkLeg(0.19);
  const armL = mkArm(-0.5), armR = mkArm(0.5);
  // Шляпа
  if (hat === 'straw') {
    const hatMat = M({ map: plankTexture('#d9a441', 43) });
    const brim = cyl(0.45, 0.45, 0.06, hatMat, 0, 2.16, 0, 10);
    const top = cyl(0.24, 0.27, 0.24, hatMat, 0, 2.3, 0, 10);
    g.add(brim, top);
  } else if (hat === 'cap') {
    g.add(box(0.54, 0.16, 0.54, M({ color: 0x4a6a8f }), 0, 2.16, 0));
    g.add(box(0.4, 0.06, 0.3, M({ color: 0x4a6a8f }), 0, 2.1, 0.36));
  } else if (hat === 'kerchief') {
    g.add(box(0.56, 0.2, 0.56, M({ color: 0xb05a8f }), 0, 2.1, 0));
  }
  g.userData.limbs = { legL, legR, armL, armR };
  return g;
}

// ==================== ЖИВОТНЫЕ ====================

export function createAnimal(type) {
  const g = new THREE.Group();
  const legs = [];
  const mkLegs = (w, h, y, mat, spread) => {
    for (const [lx, lz] of [[-spread, -spread * 0.6], [spread, -spread * 0.6], [-spread, spread * 0.6], [spread, spread * 0.6]]) {
      const pivot = new THREE.Group();
      pivot.position.set(lx * w, y, lz * w);
      const leg = box(0.12, h, 0.12, mat, 0, -h / 2, 0);
      pivot.add(leg);
      g.add(pivot);
      legs.push(pivot);
    }
  };
  if (type === 'chicken') {
    const white = M({ color: 0xf5f5f5 });
    g.add(box(0.5, 0.45, 0.4, white, 0, 0.55, 0));
    const head = box(0.26, 0.28, 0.24, white, 0.28, 0.9, 0);
    g.add(head);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 4), M({ color: 0xe8a03a }));
    beak.rotation.z = -Math.PI / 2; beak.position.set(0.48, 0.9, 0);
    g.add(beak);
    g.add(box(0.1, 0.12, 0.06, M({ color: 0xd94a3a }), 0.26, 1.08, 0));
    g.add(box(0.14, 0.22, 0.05, M({ color: 0xe8e8e8, side: THREE.DoubleSide }), -0.1, 0.55, 0.22));
    g.add(box(0.14, 0.22, 0.05, M({ color: 0xe8e8e8, side: THREE.DoubleSide }), -0.1, 0.55, -0.22));
    g.add(box(0.3, 0.28, 0.35, M({ color: 0xf5e8d0 }), 0.05, 0.32, 0));
    mkLegs(1, 0.28, 0.28, M({ color: 0xe8a03a }), 0.12);
    g.userData.wings = true;
  } else if (type === 'cow') {
    const hide = M({ map: cowTexture() });
    g.add(box(1.6, 1, 0.9, hide, 0, 1.05, 0));
    const head = box(0.55, 0.5, 0.5, hide, 1, 1.35, 0);
    g.add(head);
    g.add(box(0.35, 0.2, 0.4, M({ color: 0xe8b8c8 }), 1.3, 1.15, 0));
    for (const z of [-0.2, 0.2]) {
      const ear = box(0.12, 0.1, 0.18, M({ color: 0xd9c8b0 }), 1, 1.62, z);
      g.add(ear);
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.2, 5), M({ color: 0xe8e0d0 }));
      horn.position.set(0.95, 1.72, z * 1.4);
      g.add(horn);
    }
    g.add(box(0.35, 0.25, 0.4, M({ color: 0xe8b8c8 }), 0.3, 0.55, 0));
    mkLegs(1, 0.6, 0.6, M({ color: 0xd9c8b0 }), 0.55);
  } else if (type === 'sheep') {
    const wool = M({ color: 0xf0ede4, flatShading: true });
    g.add(blob(0.62, wool, 0, 0.85, 0));
    g.add(blob(0.4, wool, 0.45, 1.05, 0));
    const head = box(0.3, 0.35, 0.28, M({ color: 0x3a3a3a }), 0.85, 0.95, 0);
    g.add(head);
    for (const z of [-0.16, 0.16]) g.add(box(0.1, 0.14, 0.08, M({ color: 0x3a3a3a }), 0.85, 1.2, z));
    mkLegs(1, 0.5, 0.5, M({ color: 0x3a3a3a }), 0.3);
  } else if (type === 'bee') {
    const yellow = M({ color: 0xe8b84a });
    g.add(blob(0.16, yellow, 0, 0, 0));
    g.add(blob(0.12, M({ color: 0x3a3a3a }), 0, 0, 0.14));
    const wingMat = new THREE.MeshLambertMaterial({ color: 0xdff0ff, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
    const wL = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.12), wingMat);
    wL.position.set(-0.1, 0.12, 0); wL.rotation.x = -Math.PI / 2.4;
    const wR = wL.clone(); wR.position.x = 0.1;
    g.add(wL, wR);
    g.userData.wings = [wL, wR];
  }
  g.userData.legs = legs;
  return g;
}

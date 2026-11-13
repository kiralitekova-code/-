import * as THREE from 'three';

export const WORLD = { size: 220 };

export function createRenderer() {
  const canvas = document.getElementById('game-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 500);
  return { renderer, camera };
}

function boxMesh(w, h, d, color, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color }));
  m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

function coneMesh(r, h, color, x, y, z) {
  const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), new THREE.MeshLambertMaterial({ color }));
  m.position.set(x, y, z);
  m.castShadow = true;
  return m;
}

export function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xbfe3ff);
  scene.fog = new THREE.Fog(0xbfe3ff, 60, 200);

  const hemi = new THREE.HemisphereLight(0xbfd9ff, 0x6b8f4a, 0.9);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff2cc, 1.1);
  sun.position.set(40, 60, 20);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -70; sun.shadow.camera.right = 70;
  sun.shadow.camera.top = 70; sun.shadow.camera.bottom = -70;
  scene.add(sun);
  scene.add(sun.target);

  // Земля
  const groundGeo = new THREE.PlaneGeometry(WORLD.size, WORLD.size, 24, 24);
  const pos = groundGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    const d = Math.sqrt(x * x + y * y);
    let h = Math.sin(x * 0.08) * Math.cos(y * 0.07) * 0.8;
    if (d > 80) h += (d - 80) * 0.12; // холмы по краям
    if (x > 52 && y > -30 && y < 30) h -= 1.4; // русло реки
    pos.setZ(i, h);
  }
  groundGeo.computeVertexNormals();
  const groundMat = new THREE.MeshLambertMaterial({ color: 0x6fae4e });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Река
  const river = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 90),
    new THREE.MeshLambertMaterial({ color: 0x3f7fc4, transparent: true, opacity: 0.85 })
  );
  river.rotation.x = -Math.PI / 2;
  river.position.set(60, -0.55, 0);
  scene.add(river);

  // Мост
  const bridge = new THREE.Group();
  bridge.add(boxMesh(3.4, 0.4, 18, 0x8b5a2b, 0, 0.4, 0));
  bridge.add(boxMesh(0.3, 1, 18, 0x6b451f, 1.6, 0.9, 0));
  bridge.add(boxMesh(0.3, 1, 18, 0x6b451f, -1.6, 0.9, 0));
  bridge.position.set(60, 0, 0);
  scene.add(bridge);

  // ==== Ферма ====
  const farm = new THREE.Group();

  // Дом игрока
  const house = new THREE.Group();
  house.add(boxMesh(8, 4, 6, 0xE8D5B0, 0, 2, 0));
  const roof = coneMesh(6.6, 3.2, 0x8b3a2a, 0, 5.2, 0);
  roof.rotation.y = Math.PI / 4;
  house.add(roof);
  house.add(boxMesh(1.4, 2.2, 0.2, 0x6b451f, 0, 1.1, 3.05));
  house.add(boxMesh(1.6, 1.4, 0.15, 0x9fd4e8, -2.4, 2.2, 3.05));
  house.add(boxMesh(1.6, 1.4, 0.15, 0x9fd4e8, 2.4, 2.2, 3.05));
  house.position.set(-16, 0, -10);
  farm.add(house);

  // Амбар
  const barn = new THREE.Group();
  barn.add(boxMesh(9, 5, 7, 0xB0413E, 0, 2.5, 0));
  const barnRoof = coneMesh(7.4, 3, 0x6b451f, 0, 6.2, 0);
  barnRoof.rotation.y = Math.PI / 4;
  barn.add(barnRoof);
  barn.add(boxMesh(3, 3.4, 0.2, 0x7a2a28, 0, 1.7, 3.55));
  barn.position.set(16, 0, -12);
  farm.add(barn);

  // Курятник
  const coop = new THREE.Group();
  coop.add(boxMesh(4.5, 2.6, 3.5, 0xD9A441, 0, 1.3, 0));
  const coopRoof = coneMesh(3.6, 1.6, 0x8b5a2b, 0, 3.2, 0);
  coopRoof.rotation.y = Math.PI / 4;
  coop.add(coopRoof);
  coop.position.set(-16, 0, 4);
  farm.add(coop);

  // Пасека (ульи)
  for (let i = 0; i < 3; i++) {
    const hive = boxMesh(1.2, 1.4, 1.2, 0xE8B84A, 10 + i * 2.2, 0.7, 4);
    farm.add(hive);
  }

  // Забор фермы
  const fenceMat = new THREE.MeshLambertMaterial({ color: 0x8b6a3f });
  const fence = new THREE.Group();
  for (let x = -24; x <= 24; x += 3) {
    fence.add(boxMesh(0.25, 1.4, 0.25, 0x8b6a3f, x, 0.7, 9));
    fence.add(boxMesh(0.25, 1.4, 0.25, 0x8b6a3f, x, 0.7, -18));
  }
  for (let z = -18; z <= 9; z += 3) {
    fence.add(boxMesh(0.25, 1.4, 0.25, 0x8b6a3f, -24, 0.7, z));
    if (Math.abs(z - 9) > 1 && Math.abs(z + 18) > 1) fence.add(boxMesh(0.25, 1.4, 0.25, 0x8b6a3f, 24, 0.7, z));
  }
  fence.traverse(o => { if (o.isMesh) { o.material = fenceMat; o.castShadow = true; } });
  farm.add(fence);

  scene.add(farm);

  // ==== Грядки ====
  const plotMeshes = [];
  for (let i = 0; i < 12; i++) {
    const col = i % 4, row = Math.floor(i / 4);
    const px = -9 + col * 5.2, pz = -2 + row * 4.2;
    const soil = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.3, 3.2), new THREE.MeshLambertMaterial({ color: 0x6b4a2f }));
    soil.position.set(px, 0.15, pz);
    soil.receiveShadow = true;
    soil.visible = false;
    scene.add(soil);
    const plant = new THREE.Group();
    plant.position.set(px, 0.3, pz);
    scene.add(plant);
    plotMeshes.push({ soil, plant, x: px, z: pz });
  }

  // ==== Деревня ====
  const village = new THREE.Group();
  const villageHouseColors = [0xE8C89A, 0xC9D6A3, 0xD9B8C9, 0xA3C4D6, 0xE8D5A3];
  const villagePositions = [[-20, 36], [-8, 48], [4, 36], [16, 48], [28, 36], [-32, 44]];
  villagePositions.forEach((p, i) => {
    const h = new THREE.Group();
    h.add(boxMesh(6, 3.4, 5, villageHouseColors[i % villageHouseColors.length], 0, 1.7, 0));
    const r = coneMesh(5, 2.6, 0x7a4a2a, 0, 4.4, 0);
    r.rotation.y = Math.PI / 4;
    h.add(r);
    h.position.set(p[0], 0, p[1]);
    village.add(h);
  });
  // Мэрия
  const hall = new THREE.Group();
  hall.add(boxMesh(9, 5, 6, 0xD6CBA8, 0, 2.5, 0));
  hall.add(boxMesh(0.6, 2.6, 0.6, 0x8b5a2b, -3, 6, 0));
  hall.add(boxMesh(1.4, 1.4, 1.4, 0xd9a441, -3, 7.6, 0));
  hall.position.set(12, 0, 40);
  village.add(hall);
  // Магазин
  const shopB = new THREE.Group();
  shopB.add(boxMesh(7, 3.6, 5, 0x7ab06b, 0, 1.8, 0));
  shopB.add(boxMesh(6.4, 0.8, 5.4, 0x4a8f3c, 0, 3.9, 0));
  shopB.position.set(-8, 0, 32);
  village.add(shopB);
  // Церковь
  const church = new THREE.Group();
  church.add(boxMesh(5, 6, 5, 0xEFE8D8, 0, 3, 0));
  church.add(coneMesh(4, 3, 0x4a6a8f, 0, 7.5, 0));
  church.add(boxMesh(0.8, 3, 0.8, 0x8b5a2b, 0, 10, 0));
  church.add(boxMesh(0.5, 0.9, 0.1, 0xd9a441, 0, 10.8, 0));
  church.position.set(30, 0, 52);
  village.add(church);
  // Дорога
  const road = new THREE.Mesh(new THREE.PlaneGeometry(70, 3.4), new THREE.MeshLambertMaterial({ color: 0xB59A6E }));
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0.06, 33);
  road.receiveShadow = true;
  village.add(road);
  scene.add(village);

  // ==== Лес (север) и камни ====
  const trees = [];
  const treeTrunkMat = new THREE.MeshLambertMaterial({ color: 0x6b451f });
  const treeTopMat = new THREE.MeshLambertMaterial({ color: 0x3f7a35 });
  function addTree(x, z, s = 1) {
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35 * s, 0.5 * s, 2.4 * s, 6), treeTrunkMat);
    trunk.position.y = 1.2 * s; trunk.castShadow = true;
    const top = new THREE.Mesh(new THREE.ConeGeometry(1.9 * s, 4.4 * s, 7), treeTopMat.clone());
    top.position.y = 4 * s; top.castShadow = true;
    g.add(trunk, top);
    g.position.set(x, 0, z);
    scene.add(g);
    trees.push({ group: g, top });
  }
  const rand = mulberry(42);
  for (let i = 0; i < 60; i++) {
    const x = (rand() - 0.5) * 180;
    const z = -55 - rand() * 40;
    if (Math.abs(x) < 8 && z > -66) continue; // тропа к лесу
    addTree(x, z, 0.8 + rand() * 0.9);
  }
  for (let i = 0; i < 18; i++) {
    const x = (rand() - 0.5) * 160;
    const z = 60 + rand() * 30;
    addTree(x, z, 0.7 + rand() * 0.6);
  }

  // Камни (для добычи)
  const rocks = [];
  const rockMat = new THREE.MeshLambertMaterial({ color: 0x8f8f8f });
  for (let i = 0; i < 10; i++) {
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9 + rand() * 0.5, 0), rockMat.clone());
    rock.position.set(-30 + rand() * 60, 0.6, -62 - rand() * 22);
    rock.castShadow = true;
    scene.add(rock);
    rocks.push({ mesh: rock, type: i % 5 === 0 ? 'gem' : (i % 2 === 0 ? 'ore' : 'stone'), alive: true, hp: 3 });
  }

  // Сундук деда (секрет)
  const chest = new THREE.Group();
  chest.add(boxMesh(1.4, 0.9, 1, 0x8b5a2b, 0, 0.45, 0));
  chest.add(boxMesh(1.4, 0.35, 1, 0xd9a441, 0, 1.05, 0));
  chest.position.set(-45, 0, -70);
  chest.visible = false;
  scene.add(chest);

  // Причал для рыбалки
  const pier = boxMesh(2.4, 0.3, 6, 0x8b5a2b, 60, 0.3, 14);
  scene.add(pier);

  // Маяк на реке
  const lighthouse = new THREE.Group();
  lighthouse.add(boxMesh(2, 8, 2, 0xE8E8E8, 0, 4, 0));
  lighthouse.add(boxMesh(2.4, 1.4, 2.4, 0xB0413E, 0, 8.6, 0));
  lighthouse.position.set(70, 0, -20);
  scene.add(lighthouse);

  return { scene, sun, hemi, ground, groundMat, river, trees, rocks, chest, plotMeshes, treeTopMat };
}

function mulberry(seed) {
  let a = seed;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEASON_COLORS = {
  0: { ground: 0x6fae4e, tree: 0x4a9a3f, sky: 0xbfe3ff, sun: 0xfff2cc },
  1: { ground: 0x5a9e3e, tree: 0x3f8a2f, sky: 0xaedcff, sun: 0xffeeaa },
  2: { ground: 0x9a8a3e, tree: 0xc47a2a, sky: 0xd8e0e8, sun: 0xffddaa },
  3: { ground: 0xdde8ee, tree: 0x9ab8c4, sky: 0xcfe0ee, sun: 0xeef2ff },
};

export function applySeason(scene3d, season) {
  const c = SEASON_COLORS[season] || SEASON_COLORS[0];
  scene3d.groundMat.color.setHex(c.ground);
  scene3d.treeTopMat.color.setHex(c.tree);
  scene3d.baseSky = new THREE.Color(c.sky);
  if (!scene3d.scene.background || !scene3d.scene.background.isColor) {
    scene3d.scene.background = new THREE.Color(c.sky);
  }
  scene3d.scene.fog.color.setHex(c.sky);
}

const NIGHT_COLOR = new THREE.Color(0x0a1430);
const _tmpColor = new THREE.Color();

export function applyTimeOfDay(scene3d, t) {
  const dayLight = Math.max(0, Math.sin(t * Math.PI * 2 - Math.PI / 2) * 0.5 + 0.5);
  scene3d.sun.intensity = 0.15 + dayLight * 1.0;
  scene3d.hemi.intensity = 0.25 + dayLight * 0.65;
  const angle = t * Math.PI * 2 - Math.PI / 2;
  scene3d.sun.position.set(Math.cos(angle) * 60, Math.max(6, Math.sin(angle) * 70), 25);
  if (scene3d.baseSky) {
    if (!scene3d.scene.background || !scene3d.scene.background.isColor) {
      scene3d.scene.background = new THREE.Color();
    }
    _tmpColor.copy(NIGHT_COLOR).lerp(scene3d.baseSky, dayLight);
    scene3d.scene.background.copy(_tmpColor);
    scene3d.scene.fog.color.copy(_tmpColor);
  }
}

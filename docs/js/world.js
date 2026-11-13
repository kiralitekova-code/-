import * as THREE from 'three';
import {
  createHouse, createBarn, createCoop, createWindmill, createWell, createLampPost,
  createChurch, createShopBuilding, createMayorHall, createLighthouse, createBridge,
  createPier, createBoat, createMineEntrance, createChest, createTree, createBush,
  createFlower, createMushroom, createRock, createStump, createHaystack, createCrateStack,
  createBarrel, createSign, createCloud, createButterfly, createBird, seasonFoliageMats,
} from './models.js';
import { grassTexture, soilTexture, waterTexture } from './textures.js';

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

function mulberry(seed) {
  let a = seed;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
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
  scene.add(sun, sun.target);

  const rand = mulberry(42);

  const groundGeo = new THREE.PlaneGeometry(WORLD.size, WORLD.size, 24, 24);
  const pos = groundGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    const d = Math.sqrt(x * x + y * y);
    let h = Math.sin(x * 0.08) * Math.cos(y * 0.07) * 0.8;
    if (d > 80) h += (d - 80) * 0.12;
    if (x > 52 && y > -30 && y < 30) h -= 1.4;
    pos.setZ(i, h);
  }
  groundGeo.computeVertexNormals();
  const groundMat = new THREE.MeshLambertMaterial({ map: grassTexture(0) });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const dirtMat = new THREE.MeshLambertMaterial({ map: soilTexture(), transparent: true, opacity: 0.85 });
  const road1 = new THREE.Mesh(new THREE.PlaneGeometry(70, 3.4), dirtMat);
  road1.rotation.x = -Math.PI / 2; road1.position.set(0, 0.07, 33); road1.receiveShadow = true;
  scene.add(road1);
  const road2 = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 50), dirtMat);
  road2.rotation.x = -Math.PI / 2; road2.position.set(0, 0.07, 10); road2.receiveShadow = true;
  scene.add(road2);

  const waterTex = waterTexture();
  const river = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 90),
    new THREE.MeshLambertMaterial({ map: waterTex, transparent: true, opacity: 0.9 })
  );
  river.rotation.x = -Math.PI / 2;
  river.position.set(60, -0.55, 0);
  scene.add(river);

  const bridge = createBridge();
  bridge.position.set(60, 0, 0);
  scene.add(bridge);
  const pier = createPier();
  pier.position.set(60, 0, 14);
  scene.add(pier);
  const boat = createBoat();
  boat.position.set(64, -0.3, 17);
  scene.add(boat);
  const lighthouse = createLighthouse();
  lighthouse.position.set(70, 0, -20);
  scene.add(lighthouse);

  const house = createHouse({ wall: '#e8d5b0', roof: '#8b3a2a' });
  house.position.set(-16, 0, -10);
  scene.add(house);
  const barn = createBarn();
  barn.position.set(16, 0, -12);
  scene.add(barn);
  const coop = createCoop();
  coop.position.set(-16, 0, 4);
  scene.add(coop);
  const windmill = createWindmill();
  windmill.position.set(26, 0, -4);
  scene.add(windmill);

  for (let i = 0; i < 3; i++) {
    const hive = new THREE.Group();
    hive.add(new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 1.2), new THREE.MeshLambertMaterial({ color: 0xe8b84a })));
    hive.position.set(10 + i * 2.2, 0.7, 4);
    scene.add(hive);
  }

  const well1 = createWell(); well1.position.set(-8, 0, 6); scene.add(well1);
  const hay1 = createHaystack(); hay1.position.set(22, 0, 2); scene.add(hay1);
  const hay2 = createHaystack(); hay2.position.set(24.5, 0, 4); scene.add(hay2);
  const crates = createCrateStack(); crates.position.set(-12, 0, -5); scene.add(crates);
  const barrel1 = createBarrel(); barrel1.position.set(-19, 0, -5); scene.add(barrel1);
  const barrel2 = createBarrel(); barrel2.position.set(12, 0, -7); scene.add(barrel2);

  const fenceMat = new THREE.MeshLambertMaterial({ color: 0x8b6a3f });
  const fenceGeo = new THREE.BoxGeometry(0.25, 1.4, 0.25);
  for (let x = -24; x <= 24; x += 3) {
    const f1 = new THREE.Mesh(fenceGeo, fenceMat); f1.position.set(x, 0.7, 9); scene.add(f1);
    const f2 = new THREE.Mesh(fenceGeo, fenceMat); f2.position.set(x, 0.7, -18); scene.add(f2);
  }
  for (let z = -18; z <= 9; z += 3) {
    const f1 = new THREE.Mesh(fenceGeo, fenceMat); f1.position.set(-24, 0.7, z); scene.add(f1);
    if (Math.abs(z - 9) > 1 && Math.abs(z + 18) > 1) {
      const f2 = new THREE.Mesh(fenceGeo, fenceMat); f2.position.set(24, 0.7, z); scene.add(f2);
    }
  }

  const plotMeshes = [];
  const soilMat = new THREE.MeshLambertMaterial({ map: soilTexture() });
  for (let i = 0; i < 12; i++) {
    const col = i % 4, row = Math.floor(i / 4);
    const px = -9 + col * 5.2, pz = -2 + row * 4.2;
    const soil = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.3, 3.2), soilMat);
    soil.position.set(px, 0.15, pz);
    soil.receiveShadow = true;
    soil.visible = false;
    scene.add(soil);
    const plant = new THREE.Group();
    plant.position.set(px, 0.3, pz);
    scene.add(plant);
    plotMeshes.push({ soil, plant, x: px, z: pz });
  }

  const villageColors = [
    { wall: '#e8c89a', roof: '#8b3a2a' }, { wall: '#c9d6a3', roof: '#5a6a7a' },
    { wall: '#d9b8c9', roof: '#8b5a2b' }, { wall: '#a3c4d6', roof: '#4a6a8f' },
    { wall: '#e8d5a3', roof: '#a5772a' }, { wall: '#d6c2a8', roof: '#6b451f' },
  ];
  const villagePositions = [[-20, 44], [-8, 48], [4, 42], [16, 48], [28, 44], [-32, 46]];
  villagePositions.forEach((p, i) => {
    const h = createHouse({ ...villageColors[i], w: 6, h: 3.4, d: 5 });
    h.position.set(p[0], 0, p[1]);
    h.rotation.y = (rand() - 0.5) * 0.4;
    scene.add(h);
  });
  const hall = createMayorHall();
  hall.position.set(12, 0, 38);
  scene.add(hall);
  const shopB = createShopBuilding();
  shopB.position.set(-8, 0, 32);
  scene.add(shopB);
  const church = createChurch();
  church.position.set(30, 0, 54);
  scene.add(church);

  const lamps = [];
  for (const [lx, lz] of [[-14, 36], [0, 30], [14, 36], [-4, 26], [8, 26], [22, 30]]) {
    const lamp = createLampPost();
    lamp.position.set(lx, 0, lz);
    scene.add(lamp);
    lamps.push(lamp.userData.lampMat);
  }

  const sign = createSign('Берёзовка');
  sign.position.set(-3, 0, 24);
  scene.add(sign);
  const well2 = createWell(); well2.position.set(6, 0, 36); scene.add(well2);

  const trees = [];
  for (let i = 0; i < 70; i++) {
    const x = (rand() - 0.5) * 180;
    const z = -55 - rand() * 40;
    if (Math.abs(x) < 8 && z > -66) continue;
    const type = rand() > 0.6 ? 'pine' : (rand() > 0.5 ? 'birch' : 'oak');
    const t = createTree({ type, scale: 0.8 + rand() * 0.9 });
    t.position.set(x, 0, z);
    t.rotation.y = rand() * Math.PI * 2;
    scene.add(t);
    trees.push(t);
  }
  for (let i = 0; i < 20; i++) {
    const x = (rand() - 0.5) * 160;
    const z = 60 + rand() * 30;
    const t = createTree({ type: rand() > 0.5 ? 'oak' : 'birch', scale: 0.7 + rand() * 0.6 });
    t.position.set(x, 0, z);
    scene.add(t);
    trees.push(t);
  }
  for (let i = 0; i < 24; i++) {
    const b = createBush(0.7 + rand() * 0.7);
    b.position.set((rand() - 0.5) * 160, 0, -40 - rand() * 50);
    scene.add(b);
  }
  for (let i = 0; i < 6; i++) {
    const s = createStump();
    s.position.set((rand() - 0.5) * 100, 0, -35 - rand() * 30);
    scene.add(s);
  }
  for (let i = 0; i < 14; i++) {
    const m = createMushroom();
    m.position.set((rand() - 0.5) * 120, 0, -45 - rand() * 40);
    scene.add(m);
  }

  const mine = createMineEntrance();
  mine.position.set(10, 0, -68);
  mine.rotation.y = Math.PI;
  scene.add(mine);

  const rocks = [];
  for (let i = 0; i < 10; i++) {
    const rock = createRock(0.9 + rand() * 0.5);
    rock.position.set(-30 + rand() * 60, 0, -62 - rand() * 22);
    scene.add(rock);
    rocks.push({ mesh: rock, type: i % 5 === 0 ? 'gem' : (i % 2 === 0 ? 'ore' : 'stone'), alive: true, hp: 3 });
  }

  const chest = createChest();
  chest.position.set(-45, 0, -70);
  chest.visible = false;
  scene.add(chest);

  const flowers = new THREE.Group();
  const flowerColors = [0xe05a7a, 0xf5d442, 0x8a6ae0, 0xf59a42, 0xf5f5f5];
  for (let i = 0; i < 60; i++) {
    const f = createFlower(flowerColors[i % flowerColors.length]);
    f.position.set((rand() - 0.5) * 150, 0, 15 + rand() * 60);
    flowers.add(f);
  }
  scene.add(flowers);

  const clouds = [];
  for (let i = 0; i < 10; i++) {
    const c = createCloud();
    c.position.set((rand() - 0.5) * 180, 26 + rand() * 10, (rand() - 0.5) * 180);
    scene.add(c);
    clouds.push({ mesh: c, speed: 0.4 + rand() * 0.6 });
  }

  const butterflies = [];
  for (let i = 0; i < 8; i++) {
    const b = createButterfly(flowerColors[i % flowerColors.length]);
    b.position.set((rand() - 0.5) * 100, 1.5 + rand(), 10 + rand() * 40);
    scene.add(b);
    butterflies.push({ mesh: b, phase: rand() * 10, cx: b.position.x, cz: b.position.z });
  }
  const birds = [];
  for (let i = 0; i < 5; i++) {
    const b = createBird();
    b.position.set((rand() - 0.5) * 120, 18 + rand() * 8, (rand() - 0.5) * 120);
    scene.add(b);
    birds.push({ mesh: b, phase: rand() * 10, r: 20 + rand() * 30, h: b.position.y, speed: 0.3 + rand() * 0.3 });
  }

  const weatherCount = 350;
  const weatherGeo = new THREE.BufferGeometry();
  const wPos = new Float32Array(weatherCount * 3);
  for (let i = 0; i < weatherCount; i++) {
    wPos[i * 3] = (Math.random() - 0.5) * 120;
    wPos[i * 3 + 1] = Math.random() * 30;
    wPos[i * 3 + 2] = (Math.random() - 0.5) * 120;
  }
  weatherGeo.setAttribute('position', new THREE.BufferAttribute(wPos, 3));
  const weatherMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.25, transparent: true, opacity: 0 });
  const weather = new THREE.Points(weatherGeo, weatherMat);
  scene.add(weather);

  const starGeo = new THREE.BufferGeometry();
  const sPos = new Float32Array(200 * 3);
  for (let i = 0; i < 200; i++) {
    const a = Math.random() * Math.PI * 2, r = 120 + Math.random() * 40;
    sPos[i * 3] = Math.cos(a) * r;
    sPos[i * 3 + 1] = 30 + Math.random() * 80;
    sPos[i * 3 + 2] = Math.sin(a) * r;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.7, transparent: true, opacity: 0 }));
  scene.add(stars);

  const seasonState = { season: 0 };

  function updateWeather(dt, dayLight) {
    const s = seasonState.season;
    const mat = weatherMat;
    const arr = weatherGeo.attributes.position.array;
    const now = performance.now();
    if (s === 3) {
      mat.color.setHex(0xffffff); mat.size = 0.28; mat.opacity = 0.9;
      for (let i = 0; i < arr.length; i += 3) {
        arr[i + 1] -= dt * 2.2;
        arr[i] += Math.sin(arr[i + 1] * 0.5 + i) * dt * 0.6;
        if (arr[i + 1] < 0) { arr[i + 1] = 30; arr[i] = (Math.random() - 0.5) * 120; arr[i + 2] = (Math.random() - 0.5) * 120; }
      }
    } else if (s === 0) {
      mat.color.setHex(0xf5c8d8); mat.size = 0.2; mat.opacity = 0.85;
      for (let i = 0; i < arr.length; i += 3) {
        arr[i + 1] -= dt * 1.2;
        arr[i] += Math.sin(arr[i + 1] * 0.3 + i) * dt * 1.4;
        if (arr[i + 1] < 0) { arr[i + 1] = 25; arr[i] = (Math.random() - 0.5) * 120; arr[i + 2] = (Math.random() - 0.5) * 120; }
      }
    } else if (s === 2) {
      mat.color.setHex(0xd98a2a); mat.size = 0.24; mat.opacity = 0.85;
      for (let i = 0; i < arr.length; i += 3) {
        arr[i + 1] -= dt * 1.6;
        arr[i] += Math.sin(arr[i + 1] * 0.4 + i) * dt * 1.8;
        if (arr[i + 1] < 0) { arr[i + 1] = 25; arr[i] = (Math.random() - 0.5) * 120; arr[i + 2] = (Math.random() - 0.5) * 120; }
      }
    } else {
      const night = Math.max(0, 0.4 - dayLight);
      mat.color.setHex(0xd4f56a); mat.size = 0.16; mat.opacity = Math.min(0.9, night * 2);
      for (let i = 0; i < arr.length; i += 3) {
        arr[i] += Math.sin(i + now * 0.0004) * dt * 0.8;
        arr[i + 1] += Math.cos(i * 1.3 + now * 0.0005) * dt * 0.5;
        arr[i + 2] += Math.cos(i * 0.7 + now * 0.0003) * dt * 0.8;
        if (arr[i + 1] < 0.3 || arr[i + 1] > 6) arr[i + 1] = 0.5 + Math.random() * 4;
      }
    }
    weatherGeo.attributes.position.needsUpdate = true;
  }

  function update(dt, timeOfDay) {
    windmill.userData.blades.rotation.z += dt * 0.6;
    waterTex.offset.y -= dt * 0.08;
    boat.position.y = -0.3 + Math.sin(performance.now() * 0.001) * 0.08;
    for (const c of clouds) {
      c.mesh.position.x += c.speed * dt;
      if (c.mesh.position.x > 100) c.mesh.position.x = -100;
    }
    const dayLight = Math.max(0, Math.sin(timeOfDay * Math.PI * 2 - Math.PI / 2) * 0.5 + 0.5);
    for (const b of butterflies) {
      b.phase += dt;
      b.mesh.position.x = b.cx + Math.sin(b.phase * 0.7) * 4;
      b.mesh.position.z = b.cz + Math.cos(b.phase * 0.5) * 4;
      b.mesh.position.y = 1.2 + Math.sin(b.phase * 1.7) * 0.5;
      b.mesh.rotation.y = b.phase * 0.7;
      const flap = Math.sin(b.phase * 14) * 0.9;
      b.mesh.userData.wings[0].rotation.y = flap;
      b.mesh.userData.wings[1].rotation.y = -flap;
      b.mesh.visible = dayLight > 0.3 && seasonState.season !== 3;
    }
    for (const b of birds) {
      b.phase += dt * b.speed;
      b.mesh.position.set(Math.cos(b.phase) * b.r, b.h + Math.sin(b.phase * 2.3) * 1.5, Math.sin(b.phase) * b.r);
      b.mesh.rotation.y = -b.phase + Math.PI / 2;
      const flap = Math.sin(b.phase * 9) * 0.5;
      b.mesh.userData.wings[0].rotation.y = flap;
      b.mesh.userData.wings[1].rotation.y = -flap;
      b.mesh.visible = dayLight > 0.25;
    }
    updateWeather(dt, dayLight);
    stars.material.opacity = Math.max(0, 0.9 - dayLight * 2.2);
    const lampGlow = Math.max(0, 0.5 - dayLight) * 1.6;
    for (const lm of lamps) lm.emissive.setRGB(lampGlow, lampGlow * 0.85, lampGlow * 0.4);
  }

  return {
    scene, sun, hemi, ground, groundMat, river, trees, rocks, chest, plotMeshes,
    flowers, seasonState, update,
  };
}

const SEASON_STYLES = {
  0: { ground: 0xffffff, leaf: 0x4a9a3f, sky: 0xbfe3ff, flowers: true },
  1: { ground: 0xd8ffd0, leaf: 0x3f8a2f, sky: 0xaedcff, flowers: true },
  2: { ground: 0xffe8b8, leaf: 0xc47a2a, sky: 0xd8e0e8, flowers: false },
  3: { ground: 0xe8f0f8, leaf: 0x9ab8c4, sky: 0xcfe0ee, flowers: false },
};

export function applySeason(scene3d, season) {
  const c = SEASON_STYLES[season] || SEASON_STYLES[0];
  scene3d.seasonState.season = season;
  scene3d.groundMat.color.setHex(c.ground);
  scene3d.groundMat.map = grassTexture(season);
  scene3d.groundMat.needsUpdate = true;
  for (const f of seasonFoliageMats()) f.mat.color.setHex(c.leaf);
  scene3d.baseSky = new THREE.Color(c.sky);
  if (!scene3d.scene.background || !scene3d.scene.background.isColor) {
    scene3d.scene.background = new THREE.Color(c.sky);
  }
  scene3d.scene.fog.color.setHex(c.sky);
  scene3d.flowers.visible = c.flowers;
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

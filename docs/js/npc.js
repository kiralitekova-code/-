import * as THREE from 'three';
import { createHumanoid } from './player.js';
import { NPCS, ANIMALS } from './data.js';

export function createNPCs(scene) {
  const list = [];
  for (const def of NPCS) {
    const mesh = createHumanoid(def.color, 0xf0c8a0, 0x555555);
    mesh.position.set(def.pos[0], 0, def.pos[2]);
    mesh.rotation.y = Math.PI;
    scene.add(mesh);
    const label = makeLabel(def.name);
    label.position.set(0, 2.8, 0);
    mesh.add(label);
    list.push({ def, mesh });
  }
  return list;
}

function makeLabel(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(45,90,39,0.85)';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(0, 8, 256, 44, 14); else ctx.rect(0, 8, 256, 44);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 31);
  const tex = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
  sprite.scale.set(3, 0.75, 1);
  return sprite;
}

export function createAnimals(scene) {
  // Визуальные животные создаются динамически; здесь фабрика
  return { spawn };
  function spawn(type, x, z) {
    const g = new THREE.Group();
    const mat = c => new THREE.MeshLambertMaterial({ color: c });
    const cfg = {
      chicken: { body: 0.5, h: 0.45, color: 0xf5f5f5 },
      cow: { body: 1.6, h: 1.0, color: 0xf5f0e8 },
      sheep: { body: 1.1, h: 0.8, color: 0xEDEDED },
      bee: { body: 0.35, h: 0.3, color: 0xE8B84A },
    }[type] || { body: 1, h: 0.7, color: 0xcccccc };
    const body = new THREE.Mesh(new THREE.BoxGeometry(cfg.body, cfg.h, cfg.body * 0.7), mat(cfg.color));
    body.position.y = cfg.h * 0.9; body.castShadow = true;
    g.add(body);
    const head = new THREE.Mesh(new THREE.BoxGeometry(cfg.body * 0.45, cfg.h * 0.7, cfg.body * 0.4), mat(cfg.color));
    head.position.set(cfg.body * 0.55, cfg.h * 1.15, 0);
    g.add(head);
    const legMat = mat(0x8b6a3f);
    const legGeo = new THREE.BoxGeometry(0.12, cfg.h * 0.7, 0.12);
    for (const [lx, lz] of [[-0.3, -0.2], [0.3, -0.2], [-0.3, 0.2], [0.3, 0.2]]) {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(lx * cfg.body, cfg.h * 0.35, lz * cfg.body);
      g.add(leg);
    }
    if (type === 'chicken') {
      const beak = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 4), mat(0xE8A03A));
      beak.rotation.z = -Math.PI / 2;
      beak.position.set(cfg.body * 0.85, cfg.h * 1.15, 0);
      g.add(beak);
    }
    if (type === 'cow') {
      const spot = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.05), mat(0x444444));
      spot.position.set(0, cfg.h * 1.0, cfg.body * 0.36);
      g.add(spot);
    }
    g.position.set(x, 0, z);
    scene.add(g);
    return { type, mesh: g, home: new THREE.Vector3(x, 0, z), phase: Math.random() * 10, produceReady: true };
  }
}

export function updateAnimals(list, dt, t) {
  for (const a of list) {
    a.phase += dt;
    a.mesh.position.x = a.home.x + Math.sin(a.phase * 0.5) * 1.2;
    a.mesh.position.z = a.home.z + Math.cos(a.phase * 0.35) * 1.2;
    a.mesh.rotation.y = Math.sin(a.phase * 0.5) * 1.5;
    a.mesh.position.y = Math.abs(Math.sin(a.phase * 3)) * 0.05;
  }
}

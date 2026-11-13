import * as THREE from 'three';
import { createHumanoid, createAnimal } from './models.js';
import { NPCS } from './data.js';

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

export function createNPCs(scene) {
  const list = [];
  const hats = { nyura: 'kerchief', senya: 'cap', vika: 'kerchief', ashot: 'cap', gromov: 'none' };
  const hairs = { nyura: '#cccccc', senya: '#3a2a1a', vika: '#e0b04a', ashot: '#2a2a2a', gromov: '#4a4a4a' };
  for (const def of NPCS) {
    const mesh = createHumanoid(def.color, 0xf0c8a0, 0x555555, {
      hat: hats[def.id] || 'straw',
      hair: hairs[def.id] || '#5a3a1a',
    });
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

export function createAnimals(scene) {
  return { spawn };
  function spawn(type, x, z) {
    const mesh = createAnimal(type);
    mesh.position.set(x, 0, z);
    scene.add(mesh);
    return { type, mesh, home: new THREE.Vector3(x, 0, z), phase: Math.random() * 10, produceReady: true };
  }
}

export function updateAnimals(list, dt) {
  for (const a of list) {
    a.phase += dt;
    const m = a.mesh;
    if (a.type === 'bee') {
      m.position.set(
        a.home.x + Math.sin(a.phase * 1.3) * 2.5,
        1 + Math.sin(a.phase * 2.1) * 0.6,
        a.home.z + Math.cos(a.phase * 1.1) * 2.5
      );
      const flap = Math.sin(a.phase * 40) * 0.8;
      m.userData.wings[0].rotation.z = flap;
      m.userData.wings[1].rotation.z = -flap;
      continue;
    }
    m.position.x = a.home.x + Math.sin(a.phase * 0.5) * 1.2;
    m.position.z = a.home.z + Math.cos(a.phase * 0.35) * 1.2;
    m.rotation.y = Math.sin(a.phase * 0.5) * 1.5;
    m.position.y = Math.abs(Math.sin(a.phase * 3)) * 0.05;
    // Ноги и крылья
    const swing = Math.sin(a.phase * 4) * 0.35;
    if (m.userData.legs) m.userData.legs.forEach((l, i) => { l.rotation.x = i % 2 ? swing : -swing; });
    if (a.type === 'chicken' && m.userData.wings) {
      m.children.forEach(ch => {
        if (ch.geometry && ch.geometry.type === 'BoxGeometry' && Math.abs(ch.position.z) > 0.2 && ch.position.y > 0.4) {
          ch.rotation.x = Math.sin(a.phase * 6) * 0.3;
        }
      });
    }
  }
}

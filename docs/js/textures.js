import * as THREE from 'three';

// Процедурные текстуры, рисуются на canvas — без внешних файлов
const cache = new Map();

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

function toTexture(c, repeatX = 1, repeatY = 1) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeatX, repeatY);
  t.magFilter = THREE.NearestFilter;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function rnd(seed) {
  let a = seed;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

export function grassTexture(season = 0, size = 128) {
  const key = 'grass' + season;
  if (cache.has(key)) return cache.get(key);
  const [c, x] = makeCanvas(size, size);
  const base = ['#6fae4e', '#5a9e3e', '#9a8a3e', '#e8eef2'][season];
  const blade = ['#7fc25c', '#6bb54a', '#b09a3e', '#f2f7fa'][season];
  const dark = ['#599640', '#4a8a32', '#867634', '#d5dde4'][season];
  x.fillStyle = base; x.fillRect(0, 0, size, size);
  const r = rnd(season * 7 + 3);
  for (let i = 0; i < 420; i++) {
    x.fillStyle = r() > 0.5 ? blade : dark;
    const px = r() * size, py = r() * size, ln = 2 + r() * 4;
    x.fillRect(px, py, 1.5, ln);
  }
  const t = toTexture(c, 24, 24);
  cache.set(key, t);
  return t;
}

export function soilTexture(size = 64) {
  if (cache.has('soil')) return cache.get('soil');
  const [c, x] = makeCanvas(size, size);
  x.fillStyle = '#6b4a2f'; x.fillRect(0, 0, size, size);
  const r = rnd(11);
  for (let i = 0; i < 200; i++) {
    x.fillStyle = r() > 0.5 ? '#5a3c24' : '#7a5638';
    x.fillRect(r() * size, r() * size, 2 + r() * 3, 1.5);
  }
  const t = toTexture(c, 2, 2);
  cache.set('soil', t);
  return t;
}

export function woodTexture(base = '#8b6a3f', seed = 1, size = 64) {
  const key = 'wood' + base + seed;
  if (cache.has(key)) return cache.get(key);
  const [c, x] = makeCanvas(size, size);
  x.fillStyle = base; x.fillRect(0, 0, size, size);
  const r = rnd(seed);
  for (let y = 0; y < size; y += 8) {
    x.fillStyle = 'rgba(0,0,0,0.15)';
    x.fillRect(0, y, size, 1);
    for (let i = 0; i < 6; i++) {
      x.fillStyle = r() > 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
      x.fillRect(r() * size, y + r() * 7, 3 + r() * 10, 1.5);
    }
  }
  const t = toTexture(c, 1, 1);
  cache.set(key, t);
  return t;
}

export function plankTexture(base = '#a5772a', seed = 5, size = 64) {
  const key = 'plank' + base + seed;
  if (cache.has(key)) return cache.get(key);
  const [c, x] = makeCanvas(size, size);
  x.fillStyle = base; x.fillRect(0, 0, size, size);
  const r = rnd(seed);
  for (let y = 0; y < size; y += 10) {
    x.fillStyle = 'rgba(0,0,0,0.22)';
    x.fillRect(0, y, size, 1.5);
    for (let i = 0; i < 8; i++) {
      x.fillStyle = r() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)';
      x.fillRect(r() * size, y + 2 + r() * 6, 4 + r() * 14, 1);
    }
  }
  const t = toTexture(c, 2, 2);
  cache.set(key, t);
  return t;
}

export function roofTexture(color = '#8b3a2a', size = 64) {
  const key = 'roof' + color;
  if (cache.has(key)) return cache.get(key);
  const [c, x] = makeCanvas(size, size);
  x.fillStyle = color; x.fillRect(0, 0, size, size);
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const off = (row % 2) * 8;
      x.strokeStyle = 'rgba(0,0,0,0.3)';
      x.lineWidth = 1.5;
      x.strokeRect(col * 16 + off - 16, row * 16, 16, 16);
      x.fillStyle = 'rgba(255,255,255,0.05)';
      x.fillRect(col * 16 + off - 16, row * 16, 16, 3);
    }
  }
  const t = toTexture(c, 3, 2);
  cache.set(key, t);
  return t;
}

export function brickTexture(size = 64) {
  if (cache.has('brick')) return cache.get('brick');
  const [c, x] = makeCanvas(size, size);
  x.fillStyle = '#c9b8a0'; x.fillRect(0, 0, size, size);
  const r = rnd(99);
  for (let row = 0; row < 8; row++) {
    const off = (row % 2) * 8;
    for (let col = -1; col < 5; col++) {
      x.fillStyle = ['#c9b8a0', '#bfae96', '#d2c2ac'][Math.floor(r() * 3)];
      x.fillRect(col * 16 + off + 1, row * 8 + 1, 14, 6);
    }
  }
  const t = toTexture(c, 4, 2);
  cache.set('brick', t);
  return t;
}

export function waterTexture(size = 64) {
  if (cache.has('water')) return cache.get('water');
  const [c, x] = makeCanvas(size, size);
  x.fillStyle = '#3f7fc4'; x.fillRect(0, 0, size, size);
  const r = rnd(7);
  for (let i = 0; i < 26; i++) {
    x.strokeStyle = 'rgba(255,255,255,0.25)';
    x.lineWidth = 1.5;
    const y = r() * size;
    x.beginPath();
    x.moveTo(r() * size, y);
    x.quadraticCurveTo(r() * size, y + (r() - 0.5) * 6, r() * size, y);
    x.stroke();
  }
  const t = toTexture(c, 4, 8);
  cache.set('water', t);
  return t;
}

export function barkTexture(birch = false, size = 64) {
  const key = 'bark' + birch;
  if (cache.has(key)) return cache.get(key);
  const [c, x] = makeCanvas(size, size);
  x.fillStyle = birch ? '#e8e5dc' : '#6b451f';
  x.fillRect(0, 0, size, size);
  const r = rnd(birch ? 21 : 22);
  if (birch) {
    for (let i = 0; i < 14; i++) {
      x.fillStyle = 'rgba(30,30,30,0.85)';
      x.fillRect(r() * size, r() * size, 3 + r() * 8, 2 + r() * 3);
    }
  } else {
    for (let i = 0; i < 22; i++) {
      x.fillStyle = r() > 0.5 ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.08)';
      x.fillRect(r() * size, 0, 1.5, size);
    }
  }
  const t = toTexture(c, 1, 1);
  cache.set(key, t);
  return t;
}

export function cowTexture(size = 64) {
  if (cache.has('cow')) return cache.get('cow');
  const [c, x] = makeCanvas(size, size);
  x.fillStyle = '#f5f0e8'; x.fillRect(0, 0, size, size);
  const r = rnd(33);
  for (let i = 0; i < 9; i++) {
    x.fillStyle = '#3a3a3a';
    const px = r() * size, py = r() * size;
    x.beginPath(); x.ellipse(px, py, 6 + r() * 10, 4 + r() * 7, r() * 3, 0, 7); x.fill();
  }
  const t = toTexture(c, 1, 1);
  cache.set('cow', t);
  return t;
}

export function faceTexture(skin = '#f0c8a0', size = 64) {
  const key = 'face' + skin;
  if (cache.has(key)) return cache.get(key);
  const [c, x] = makeCanvas(size, size);
  x.fillStyle = skin; x.fillRect(0, 0, size, size);
  x.fillStyle = '#2a2a2a';
  x.fillRect(18, 26, 7, 9);
  x.fillRect(39, 26, 7, 9);
  x.fillStyle = '#fff';
  x.fillRect(20, 28, 2, 3);
  x.fillRect(41, 28, 2, 3);
  x.strokeStyle = '#8a5a3a';
  x.lineWidth = 2.5;
  x.beginPath(); x.arc(32, 44, 8, 0.25 * Math.PI, 0.75 * Math.PI); x.stroke();
  x.fillStyle = 'rgba(224,122,90,0.35)';
  x.fillRect(10, 38, 8, 5);
  x.fillRect(46, 38, 8, 5);
  const t = toTexture(c, 1, 1);
  cache.set(key, t);
  return t;
}

export function flowerTexture(size = 32) {
  if (cache.has('flowerbill')) return cache.get('flowerbill');
  const [c, x] = makeCanvas(size, size);
  x.clearRect(0, 0, size, size);
  const colors = ['#e05a7a', '#f5d442', '#8a6ae0', '#f5f5f5', '#f59a42'];
  const r = rnd(55);
  for (let i = 0; i < 5; i++) {
    const px = 4 + r() * (size - 8), py = 4 + r() * (size - 8);
    x.fillStyle = colors[Math.floor(r() * colors.length)];
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * Math.PI * 2;
      x.beginPath(); x.ellipse(px + Math.cos(a) * 3, py + Math.sin(a) * 3, 2.2, 2.2, 0, 0, 7); x.fill();
    }
    x.fillStyle = '#f5d442';
    x.beginPath(); x.arc(px, py, 1.8, 0, 7); x.fill();
  }
  const t = toTexture(c, 8, 8);
  t.transparent = true;
  cache.set('flowerbill', t);
  return t;
}

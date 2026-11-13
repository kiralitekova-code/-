import ASSETS from './assetmap.js';

const images = {};
let total = 0, loaded = 0;

export function loadAll(onProgress) {
  const list = Object.values(ASSETS);
  total = list.length;
  const jobs = list.map(src => new Promise((res) => {
    const img = new Image();
    img.onload = () => { loaded++; onProgress(loaded / total); res(); };
    img.onerror = () => { console.error('asset fail:', src); loaded++; onProgress(loaded / total); res(); };
    img.src = 'assets/' + encodeURI(src);
    images[src] = img;
  }));
  return Promise.all(jobs);
}

export function img(key) { return images[ASSETS[key]]; }
export function ready() { return loaded >= total; }

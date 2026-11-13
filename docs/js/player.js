import * as THREE from 'three';

export function createHumanoid(shirtColor, skinColor = 0xf0c8a0, pantsColor = 0x3a5a8f) {
  const g = new THREE.Group();
  const mat = c => new THREE.MeshLambertMaterial({ color: c });
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.4), mat(shirtColor));
  body.position.y = 1.05; body.castShadow = true;
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), mat(skinColor));
  head.position.y = 1.8; head.castShadow = true;
  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.6, 0.28), mat(pantsColor));
  legL.position.set(-0.18, 0.3, 0); legL.castShadow = true;
  const legR = legL.clone(); legR.position.x = 0.18;
  const armL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.7, 0.22), mat(shirtColor));
  armL.position.set(-0.5, 1.1, 0); armL.castShadow = true;
  const armR = armL.clone(); armR.position.x = 0.5;
  const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.08, 10), mat(0xd9a441));
  hat.position.y = 2.1;
  const hatTop = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.22, 10), mat(0xd9a441));
  hatTop.position.y = 2.22;
  g.add(body, head, legL, legR, armL, armR, hat, hatTop);
  g.userData.limbs = { legL, legR, armL, armR };
  return g;
}

export function createPlayer() {
  const mesh = createHumanoid(0x4a8f3c);
  mesh.position.set(-6, 0, 2);
  return mesh;
}

export class PlayerController {
  constructor(player, camera) {
    this.player = player;
    this.camera = camera;
    this.keys = {};
    this.joy = { x: 0, y: 0, active: false };
    this.speed = 7;
    this.walkPhase = 0;
    this.cameraYaw = Math.PI;
    this.cameraDist = 12;
    this.camHeight = 7;

    window.addEventListener('keydown', e => {
      this.keys[e.code] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
    });
    window.addEventListener('keyup', e => { this.keys[e.code] = false; });

    // Мышь/тач — поворот камеры (правая половина экрана)
    let lastX = null;
    const canvas = document.getElementById('game-canvas');
    canvas.addEventListener('pointerdown', e => { if (e.clientX > window.innerWidth * 0.45) lastX = e.clientX; });
    canvas.addEventListener('pointermove', e => {
      if (lastX !== null && (e.buttons || e.pointerType === 'touch')) {
        this.cameraYaw -= (e.clientX - lastX) * 0.012;
        lastX = e.clientX;
      }
    });
    window.addEventListener('pointerup', () => { lastX = null; });
  }

  setJoystick(x, y) { this.joy.x = x; this.joy.y = y; this.joy.active = x !== 0 || y !== 0; }

  update(dt, blocked) {
    let mx = 0, mz = 0;
    if (!blocked) {
      if (this.keys['KeyW'] || this.keys['ArrowUp']) mz -= 1;
      if (this.keys['KeyS'] || this.keys['ArrowDown']) mz += 1;
      if (this.keys['KeyA'] || this.keys['ArrowLeft']) mx -= 1;
      if (this.keys['KeyD'] || this.keys['ArrowRight']) mx += 1;
      if (this.keys['KeyQ'] && !this._qHeld) { this._qHeld = true; this.onSeedCycle && this.onSeedCycle(); }
      if (!this.keys['KeyQ']) this._qHeld = false;
      if (this.keys['KeyE'] && !this._eHeld) { this._eHeld = true; this.onAction && this.onAction(); }
      if (!this.keys['KeyE']) this._eHeld = false;
      mx += this.joy.x; mz += this.joy.y;
    }
    const len = Math.hypot(mx, mz);
    if (len > 0.15) {
      if (len > 1) { mx /= len; mz /= len; }
      // движение относительно камеры
      const s = Math.sin(this.cameraYaw), c = Math.cos(this.cameraYaw);
      const wx = mx * c - mz * s;
      const wz = mx * s + mz * c;
      this.player.position.x += wx * this.speed * dt;
      this.player.position.z += wz * this.speed * dt;
      const targetRot = Math.atan2(wx, wz);
      let dr = targetRot - this.player.rotation.y;
      while (dr > Math.PI) dr -= Math.PI * 2;
      while (dr < -Math.PI) dr += Math.PI * 2;
      this.player.rotation.y += dr * Math.min(1, dt * 12);
      this.walkPhase += dt * 10;
    } else {
      this.walkPhase *= 0.8;
    }
    // Границы мира
    this.player.position.x = THREE.MathUtils.clamp(this.player.position.x, -100, 100);
    this.player.position.z = THREE.MathUtils.clamp(this.player.position.z, -95, 85);
    // Анимация ходьбы
    const swing = Math.sin(this.walkPhase) * 0.6;
    const limbs = this.player.userData.limbs;
    if (limbs) {
      limbs.legL.rotation.x = swing; limbs.legR.rotation.x = -swing;
      limbs.armL.rotation.x = -swing * 0.7; limbs.armR.rotation.x = swing * 0.7;
    }
    // Камера
    const p = this.player.position;
    const cx = p.x + Math.sin(this.cameraYaw) * this.cameraDist;
    const cz = p.z + Math.cos(this.cameraYaw) * this.cameraDist;
    this.camera.position.lerp(new THREE.Vector3(cx, this.camHeight, cz), Math.min(1, dt * 5));
    this.camera.lookAt(p.x, 1.5, p.z);
  }
}

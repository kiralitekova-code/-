import { loadAll, img, ready } from './assets.js';
import { renderScreen } from './screens.js';
import * as S from './state.js';
import { CROPS, WORKSHOPS, SQUADS, RES, SEASONS } from './data.js';

const W = 1280, H = 720;

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = S.newState();
    this.hitboxes = [];
    this.hot = null;
    this.tip = null;
    this.popup = null;
    this.help = false;
    this.time = 0;
    this.mouse = { x: -1, y: -1 };
    this.progress = 0;
    this.loaded = false;
    this._last = 0;

    this._bind();
    loadAll(p => { this.progress = p; }).then(() => { this.loaded = true; });
    requestAnimationFrame(t => this._frame(t));
  }

  // ---------- действия интерфейса ----------

  toast(text) { S.pushLog(this.state, text); }

  newGame() {
    this.state = S.newState();
    this.state.screen = 'farm';
    this.popup = null;
    this.help = false;
    this.toast('Добро пожаловать на ферму, дедушкино наследство!');
  }

  continueGame() {
    const s = S.load();
    if (!s) { this.toast('Сохранение не найдено'); return; }
    s.screen = 'farm';
    this.state = s;
    this.popup = null;
  }

  nextDay() {
    const s = this.state;
    if (this.popup || this.help || s.pendingEvent) return;
    S.nextDay(s);
    if (s.gameOver) s.screen = 'ending';
  }

  clickField(i) {
    const s = this.state;
    const f = s.fields[i];
    if (!f) return;
    if (f.crop) {
      const c = CROPS[f.crop];
      if (f.progress >= c.days) S.harvestField(s, i);
      else this.popup = {
        title: c.name,
        lines: ['Рост: ' + Math.floor(f.progress) + ' / ' + c.days + ' дн.', 'Урожай: ~' + c.yield + ' ' + RES[c.res].name],
        buttons: [{ label: 'Закрыть', action: () => {} }],
      };
      return;
    }
    if (S.seasonOf(s) === 3) { this.toast('Зимой ничего не растёт!'); return; }
    this.popup = {
      title: 'Что посеять?',
      lines: ['Монет: ' + s.money],
      buttons: Object.keys(CROPS).map(id => {
        const c = CROPS[id];
        return {
          label: c.name + ' (' + c.seed + '\u{1F4B0}, ' + c.days + ' дн.)',
          enabled: s.money >= c.seed,
          action: () => { if (!S.plantField(s, i, id)) this.toast('Не хватает монет на семена'); },
        };
      }),
    };
  }

  clickBaseBuilding(key) {
    const s = this.state;
    if (key === 'house') {
      this.popup = {
        title: 'Дом фермера',
        lines: ['Рабочих: ' + s.workers.total, 'Стоимость найма: ' + S.hireCost(s) + ' монет'],
        buttons: [
          { label: 'Нанять рабочего', enabled: s.money >= S.hireCost(s), action: () => { if (!S.hireWorker(s)) this.toast('Не хватает монет'); } },
          { label: 'Закрыть', action: () => {} },
        ],
      };
    } else if (key === 'barn') {
      s.screen = 'store';
      this.popup = null;
    } else {
      this.popup = {
        title: 'Мельница',
        lines: ['Сердце фермы. Здесь зерно становится мукой,', 'а фермер — хозяином своей земли.'],
        buttons: [{ label: 'Закрыть', action: () => {} }],
      };
    }
  }

  clickWorkshop(id) {
    const s = this.state;
    const w = WORKSHOPS[id];
    if (s.workshops[id]) {
      this.popup = {
        title: w.name,
        lines: [w.desc, 'Рабочих занято: ' + w.worker],
        buttons: [{ label: 'Закрыть', action: () => {} }],
      };
      return;
    }
    this.popup = {
      title: 'Построить: ' + w.name + '?',
      lines: ['Цена: ' + w.cost + ' монет + ' + w.wood + ' дерева', w.desc],
      buttons: [
        {
          label: 'Построить',
          enabled: s.money >= w.cost && s.res.wood >= w.wood,
          action: () => { if (!S.buildWorkshop(s, id)) this.toast('Не хватает монет или дерева'); },
        },
        { label: 'Отмена', action: () => {} },
      ],
    };
  }

  buyAnimal(id) {
    if (!S.buyAnimal(this.state, id)) this.toast('Не хватает монет или загон полон');
  }

  assignWorker(id, delta) {
    const s = this.state;
    const a = s.workers.assign;
    if (delta > 0) {
      if (S.workersIdle(s) <= 0 || a[id] >= 6) return;
      a[id]++;
    } else {
      if (a[id] <= 0) return;
      a[id]--;
    }
    S.save(s);
  }

  hireWorker() {
    if (!S.hireWorker(this.state)) this.toast('Не хватает монет');
  }

  hireSquad(id) {
    const q = SQUADS[id];
    if (!S.hireSquad(this.state, id)) {
      this.toast('Нужно: ' + q.cost + ' монет + ' +
        Object.entries(q.need).map(([r, n]) => RES[r].name + ' ×' + n).join(', '));
    }
  }

  sendOrder(order, guarded) {
    const s = this.state;
    if (!S.sendCaravan(s, order, guarded)) {
      this.toast(s.caravan ? 'Караван уже в пути!' : 'Не хватает ресурса: ' + RES[order.res].name);
    }
  }

  resolveEvent(choice) {
    S.resolveEvent(this.state, choice);
  }

  // ---------- ввод ----------

  _bind() {
    const c = this.canvas;
    const toCanvas = (e) => {
      const r = c.getBoundingClientRect();
      return {
        x: (e.clientX - r.left) * (c.width / r.width),
        y: (e.clientY - r.top) * (c.height / r.height),
      };
    };
    c.addEventListener('mousemove', e => {
      const p = toCanvas(e);
      this.mouse = p;
      this._updateHover();
    });
    c.addEventListener('mouseleave', () => { this.mouse = { x: -1, y: -1 }; this.hot = null; this.tip = null; });
    c.addEventListener('mousedown', e => {
      e.preventDefault();
      const p = toCanvas(e);
      this.mouse = p;
      this._click(p.x, p.y);
    });
    c.addEventListener('touchstart', e => {
      e.preventDefault();
      const t = e.changedTouches[0];
      const r = c.getBoundingClientRect();
      const p = { x: (t.clientX - r.left) * (c.width / r.width), y: (t.clientY - r.top) * (c.height / r.height) };
      this.mouse = p;
      this._click(p.x, p.y);
    }, { passive: false });
    window.addEventListener('keydown', e => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (this.loaded && !this.popup && !this.help && !this.state.pendingEvent &&
            this.state.screen !== 'menu' && this.state.screen !== 'ending') this.nextDay();
      } else if (e.code === 'Escape') {
        if (this.popup) this.popup = null;
        else if (this.help) this.help = false;
      }
    });
    window.addEventListener('resize', () => this._resize());
    this._resize();
  }

  _hitAt(x, y) {
    for (let i = this.hitboxes.length - 1; i >= 0; i--) {
      const b = this.hitboxes[i];
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b;
    }
    return null;
  }

  _updateHover() {
    const b = this._hitAt(this.mouse.x, this.mouse.y);
    this.hot = (b && b.onClick) ? b.onClick : null;
    this.tip = b ? b.tip || null : null;
  }

  _click(x, y) {
    if (!this.loaded) return;
    const b = this._hitAt(x, y);
    if (b && b.onClick) {
      this.hot = b.onClick;
      b.onClick();
      this._updateHover();
    }
  }

  _resize() {
    const c = this.canvas;
    const k = Math.min(window.innerWidth / W, window.innerHeight / H);
    c.style.width = Math.floor(W * k) + 'px';
    c.style.height = Math.floor(H * k) + 'px';
  }

  // ---------- цикл ----------

  _frame(t) {
    const dt = Math.min(0.1, (t - this._last) / 1000);
    this._last = t;
    this.time += dt;
    const ctx = this.ctx;
    if (!this.loaded) this._drawLoading(ctx);
    else {
      renderScreen(ctx, this);
      this._drawTooltip(ctx);
    }
    requestAnimationFrame(tt => this._frame(tt));
  }

  _drawLoading(ctx) {
    ctx.fillStyle = '#1a1208';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#ffe8c0';
    ctx.font = '42px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Деревенский Рай: Экосистема', W / 2, H / 2 - 60);
    ctx.font = '20px Georgia, serif';
    ctx.fillStyle = '#c8a060';
    ctx.fillText('Загрузка ассетов… ' + Math.round(this.progress * 100) + '%', W / 2, H / 2);
    const bw = 500;
    ctx.fillStyle = '#241a10';
    ctx.fillRect(W / 2 - bw / 2, H / 2 + 40, bw, 26);
    ctx.fillStyle = '#5ec24a';
    ctx.fillRect(W / 2 - bw / 2 + 3, H / 2 + 43, (bw - 6) * this.progress, 20);
    ctx.strokeStyle = '#8a6a40';
    ctx.strokeRect(W / 2 - bw / 2, H / 2 + 40, bw, 26);
  }

  _drawTooltip(ctx) {
    if (!this.tip || this.mouse.x < 0) return;
    ctx.save();
    ctx.font = '15px Georgia, serif';
    const lines = String(this.tip).split('\n');
    let w = 0;
    for (const l of lines) w = Math.max(w, ctx.measureText(l).width);
    const wBox = w + 20, hBox = lines.length * 20 + 12;
    let x = this.mouse.x + 14, y = this.mouse.y + 18;
    if (x + wBox > W) x = W - wBox - 4;
    if (y + hBox > H) y = this.mouse.y - hBox - 8;
    ctx.fillStyle = 'rgba(20,14,6,0.94)';
    ctx.strokeStyle = '#8a6a40';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.rect(x, y, wBox, hBox);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffe8c0';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    lines.forEach((l, i) => ctx.fillText(l, x + 10, y + 7 + i * 20));
    ctx.restore();
  }
}

const canvas = document.getElementById('game');
window.game = new Game(canvas);

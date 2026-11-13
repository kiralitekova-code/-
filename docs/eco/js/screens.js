import { img } from './assets.js';
import * as U from './ui.js';
import { RES, CROPS, PENS, WORKSHOPS, SQUADS, SEASONS, TUTORIAL, foodTotal, indTotal } from './data.js';
import * as S from './state.js';

const W = 1280, H = 720;
const NAV = [['farm', 'Ферма'], ['mine', 'Шахта'], ['factory', 'Завод'], ['guild', 'Гильдия'], ['market', 'Рынок'], ['store', 'Склад']];

export function renderScreen(ctx, g) {
  g.hitboxes = [];
  const s = g.state;
  if (s.screen === 'menu') { drawMenu(ctx, g); return; }
  drawBackground(ctx, g);
  switch (s.screen) {
    case 'farm': drawFarm(ctx, g); break;
    case 'mine': drawMine(ctx, g); break;
    case 'factory': drawFactory(ctx, g); break;
    case 'guild': drawGuild(ctx, g); break;
    case 'market': drawMarket(ctx, g); break;
    case 'store': drawStore(ctx, g); break;
    case 'ending': drawEnding(ctx, g); break;
  }
  if (s.screen !== 'ending') { drawTopBar(ctx, g); drawNav(ctx, g); }
  drawToasts(ctx, g);
  if (s.tutorialStep < 7 && s.screen !== 'ending') drawTutorial(ctx, g);
  if (g.popup) drawPopup(ctx, g);
  if (s.pendingEvent) drawEvent(ctx, g);
  if (g.help) drawHelp(ctx, g);
}

function hb(g, x, y, w, h, onClick, tip) {
  g.hitboxes.push({ x, y, w, h, onClick, tip });
}

function btn(ctx, g, x, y, w, h, label, onClick, opts = {}) {
  U.button(ctx, x, y, w, h, label, { ...opts, hover: g.hot === onClick });
  if (opts.enabled !== false) hb(g, x, y, w, h, onClick, opts.tip);
}

function bgCover(ctx, image) {
  if (!image) return;
  const k = Math.max(W / image.width, H / image.height);
  const dw = image.width * k, dh = image.height * k;
  ctx.drawImage(image, (W - dw) / 2, (H - dh) / 2, dw, dh);
}

function drawBackground(ctx, g) {
  const s = g.state;
  const season = S.seasonOf(s);
  if (s.screen === 'farm') bgCover(ctx, img(['bgSummer', 'bgSummer', 'bgAutumn', 'bgWinter'][season]));
  else if (s.screen === 'mine') bgCover(ctx, img('bgMine'));
  else if (s.screen === 'factory') bgCover(ctx, img('bgFactory'));
  else if (s.screen === 'guild') bgCover(ctx, img('bgMap'));
  else if (s.screen === 'market') bgCover(ctx, img('bgSummer'));
  else if (s.screen === 'store') bgCover(ctx, img('bgAutumn'));
}

// ---------- Меню ----------

function drawMenu(ctx, g) {
  bgCover(ctx, img('bgMap'));
  U.shade(ctx, 0, 0, W, H, '#000', 0.45);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffe8c0';
  ctx.shadowColor = '#000'; ctx.shadowBlur = 12;
  ctx.font = '54px Georgia, serif';
  ctx.fillText('Деревенский Рай', W / 2, 160);
  ctx.font = '30px Georgia, serif';
  ctx.fillStyle = '#c8a060';
  ctx.fillText('Экосистема: ферма — сырьё для заводов', W / 2, 210);
  ctx.restore();
  const bx = W / 2 - 160;
  btn(ctx, g, bx, 300, 320, 60, 'Новая игра', () => g.newGame(), { font: '26px' });
  if (S.hasSave()) btn(ctx, g, bx, 380, 320, 60, 'Продолжить', () => g.continueGame(), { font: '26px' });
  btn(ctx, g, bx, S.hasSave() ? 460 : 380, 320, 60, 'Как играть', () => { g.help = true; }, { font: '26px' });
}

function drawHelp(ctx, g) {
  U.shade(ctx, 0, 0, W, H, '#000', 0.7);
  U.panel(ctx, 140, 60, 1000, 600);
  const lines = [
    'Цель: за 4 сезона (120 дней) построить устойчивую экосистему.',
    '',
    'ФЕРМА — посев (клик по полю), загоны (клик), лес (рубка), найм рабочих.',
    'Каждый продукт имеет два назначения: еда или сырьё для заводов.',
    '',
    'ШАХТА — рабочие добывают руду и уголь. Плавильня: руда + уголь → железо.',
    'Глубина шахты открывается отрядами Гильдии.',
    '',
    'ЗАВОД — заказы: «доставь N ресурса к сроку». Вознаграждение монетами.',
    'Доставка — караваном (50 ед., риск ограбления; охрана снижает риск).',
    '',
    'ГИЛЬДИЯ — найм отрядов за монеты и продукцию фермы (ткань, кожа, перья).',
    'Отряды охраняют караваны и открывают глубины шахты.',
    '',
    'СКЛАД — лимиты хранения, порча (мясо/молоко/овощи −2%/день),',
    'приоритеты автопродажи, журнал событий.',
    '',
    'Зимой поля не растут — запасайтесь осенью!',
    'Пробел — следующий день, Esc — закрыть окно.',
  ];
  ctx.save();
  ctx.font = '19px Georgia, serif';
  ctx.fillStyle = '#ffe8c0';
  ctx.textAlign = 'left';
  lines.forEach((l, i) => ctx.fillText(l, 180, 110 + i * 34));
  ctx.restore();
  btn(ctx, g, W / 2 - 100, 590, 200, 50, 'Понятно', () => { g.help = false; });
}

// ---------- Верхняя панель и навигация ----------

function drawTopBar(ctx, g) {
  const s = g.state;
  U.panel(ctx, 0, 0, W, 56, 0.95);
  U.iconLabel(ctx, img('iMoney'), 20, 12, 32, s.money, '#ffd700', '22px');
  const season = S.seasonOf(s);
  U.text(ctx, 'День ' + S.dayOfSeason(s) + ' · ' + SEASONS[season] + ' · Год 1', 150, 28, { font: '20px', baseline: 'middle' });
  U.iconLabel(ctx, img('iBread'), 430, 12, 32, Math.floor(foodTotal(s)) + ' / ' + S.caps(s).food, '18px');
  U.iconLabel(ctx, img('iTools'), 660, 12, 32, 'Рабочие: ' + S.workersIdle(s) + ' свободно / ' + s.workers.total, '18px');
  U.text(ctx, 'Мораль: ' + s.morale + '%', 1010, 28, { font: '18px', baseline: 'middle', color: s.morale < 40 ? '#ff8080' : '#ffe8c0' });
  if (s.caravan) U.iconLabel(ctx, img('oxCart'), 1150, 12, 36, s.caravan.daysLeft + ' дн.', '16px');
}

function drawNav(ctx, g) {
  const s = g.state;
  U.panel(ctx, 0, H - 64, W, 64, 0.95);
  const bw = 150, gap = 14;
  NAV.forEach(([id, label], i) => {
    const x = 20 + i * (bw + gap);
    btn(ctx, g, x, H - 54, bw, 44, label, () => { g.state.screen = id; g.popup = null; }, { enabled: s.screen !== id, font: '19px' });
  });
  btn(ctx, g, W - 240, H - 54, 220, 44, '▶ Новый день', () => g.nextDay(), { font: '21px', tip: 'Пробел' });
}

// ---------- Ферма ----------

function drawFarm(ctx, g) {
  const s = g.state;
  const season = S.seasonOf(s);
  const groundTile = img(season === 3 ? 'tSnow1' : 'tGrass1');
  for (let i = 0; i < 6; i++) {
    const x = 40 + (i % 3) * 170, y = 100 + Math.floor(i / 3) * 146;
    if (groundTile) {
      ctx.save();
      ctx.globalAlpha = 0.85;
      for (let ty = 0; ty < 2; ty++) for (let tx = 0; tx < 2; tx++)
        ctx.drawImage(groundTile, x + tx * 70, y + ty * 55, 70, 55);
      ctx.restore();
    }
    const f = s.fields[i];
    ctx.strokeStyle = '#5a4020'; ctx.lineWidth = 3;
    ctx.strokeRect(x, y, 140, 110);
    if (f.crop) {
      const c = CROPS[f.crop];
      const done = f.progress >= c.days;
      const spr = img(done ? c.icon : 'tSoil');
      if (spr) {
        const k = done ? 1 : 0.5 + 0.5 * (f.progress / c.days);
        const w2 = spr.width * k, h2 = spr.height * k;
        ctx.drawImage(spr, x + 70 - w2 / 2, y + 62 - h2 / 2, w2, h2);
      }
      U.text(ctx, c.name, x + 70, y + 14, { align: 'center', font: '16px' });
      U.bar(ctx, x + 20, y + 88, 100, 12, f.progress / c.days, done ? '#ffd700' : '#5ec24a');
      if (done) U.text(ctx, '! ГОТОВО', x + 70, y + 44, { align: 'center', font: '15px', color: '#ffd700' });
    } else {
      U.text(ctx, 'Пусто', x + 70, y + 50, { align: 'center', font: '16px', color: '#c0b090' });
      U.text(ctx, 'клик — посев', x + 70, y + 70, { align: 'center', font: '13px', color: '#a09070' });
    }
    hb(g, x, y, 140, 110, () => g.clickField(i), f.crop ? CROPS[f.crop].name : 'Посев');
  }

  U.panel(ctx, 40, 400, 230, 120, 0.85);
  const tree = img('tGrassPlants');
  for (let t = 0; t < 4; t++) U.drawSpriteFit(ctx, img(t % 2 ? 'tGrass2' : 'tGrassPlants'), 50 + t * 40, 410, 36, 36);
  U.text(ctx, 'Лес', 155, 420, { font: '18px' });
  btn(ctx, g, 55, 455, 200, 40, 'Рубить лес (+' + Math.round(6 * S.seasonWoodMult(season) * S.toolBonus(s)) + ' древ.)',
    () => { if (!S.chopWood(g.state)) g.toast('Нет свободных рабочих или лимит рубки (2/день)'); }, { enabled: S.workersIdle(s) > 0 && s.chopToday < 2 });

  drawWorkersPanel(ctx, g, 290, 400, 250, 120);

  U.panel(ctx, 560, 90, 360, 430, 0.85);
  U.text(ctx, 'Загоны', 740, 100, { align: 'center', font: '20px' });
  Object.keys(PENS).forEach((id, i) => {
    const P = PENS[id];
    const x = 575 + (i % 2) * 170, y = 130 + Math.floor(i / 2) * 190;
    ctx.strokeStyle = '#8a6a40'; ctx.lineWidth = 4;
    ctx.strokeRect(x, y, 155, 175);
    U.drawSpriteFit(ctx, img(P.animal), x + 28, y + 10, 100, 90);
    U.text(ctx, P.name, x + 77, y + 105, { align: 'center', font: '16px' });
    U.text(ctx, s.pens[id] + ' / ' + P.max + ' гол.', x + 77, y + 124, { align: 'center', font: '15px' });
    btn(ctx, g, x + 18, y + 142, 120, 26, 'Купить ' + P.headCost + '💰', () => g.buyAnimal(id), { enabled: s.pens[id] < P.max && s.money >= P.headCost, font: '14px', tip: 'Корм: ' + P.feed + ' зерна/день' });
  });

  U.panel(ctx, 940, 90, 300, 430, 0.85);
  U.text(ctx, 'Постройки', 1090, 100, { align: 'center', font: '20px' });
  const base = [
    { key: 'house', b: 'bHouseA', label: 'Дом фермера', tip: 'Найм рабочих' },
    { key: 'barn', b: 'bBarn', label: 'Амбар (склад)', tip: 'Расширение склада' },
    { key: 'mill', b: 'bMill', label: 'Мельница', tip: 'Символ фермы' },
  ];
  base.forEach((it, i) => {
    const x = 955 + (i % 3) * 95, y = 125;
    U.drawSpriteFit(ctx, img(it.b), x, y, 85, 85);
    hb(g, x, y, 85, 85, () => g.clickBaseBuilding(it.key), it.label);
  });
  U.text(ctx, 'Мини-цеха:', 1090, 225, { align: 'center', font: '17px' });
  Object.keys(WORKSHOPS).forEach((id, i) => {
    const wsp = WORKSHOPS[id];
    const x = 955 + (i % 3) * 95, y = 250 + Math.floor(i / 3) * 88;
    const built = s.workshops[id];
    ctx.save();
    if (!built) ctx.globalAlpha = 0.35;
    U.drawSpriteFit(ctx, img(wsp.building), x, y, 85, 70);
    ctx.restore();
    if (!built) {
      U.text(ctx, wsp.cost + '💰+' + wsp.wood + '🪵', x + 42, y + 50, { align: 'center', font: '12px' });
    }
    hb(g, x, y, 85, 85, () => g.clickWorkshop(id), wsp.name + ': ' + wsp.desc);
  });
}

function drawWorkersPanel(ctx, g, x, y, w, h) {
  const s = g.state;
  U.panel(ctx, x, y, w, h, 0.85);
  U.text(ctx, 'Рабочие: ' + s.workers.total, x + 12, y + 8, { font: '17px' });
  U.text(ctx, 'Свободно: ' + S.workersIdle(s), x + w - 12, y + 8, { font: '15px', align: 'right' });
  const rows = [['fields', 'Поля'], ['forest', 'Лес'], ['mine', 'Шахта']];
  rows.forEach(([id, label], i) => {
    const ry = y + 34 + i * 27;
    U.text(ctx, label, x + 12, ry + 8, { font: '16px', baseline: 'middle' });
    btn(ctx, g, x + 90, ry, 30, 24, '−', () => g.assignWorker(id, -1), { font: '15px' });
    U.text(ctx, String(s.workers.assign[id]), x + 133, ry + 12, { font: '17px', align: 'center', baseline: 'middle' });
    btn(ctx, g, x + 155, ry, 30, 24, '+', () => g.assignWorker(id, 1), { font: '15px' });
  });
  btn(ctx, g, x + 12, y + h - 30, w - 24, 24, 'Нанять рабочего (' + S.hireCost(s) + '💰)', () => g.hireWorker(), { enabled: s.money >= S.hireCost(s), font: '14px' });
}

// ---------- Шахта ----------

function drawMine(ctx, g) {
  const s = g.state;
  U.panel(ctx, 40, 90, 380, 520, 0.88);
  U.text(ctx, 'Шахта — уровень ' + s.mineDepth, 230, 105, { align: 'center', font: '24px' });
  drawWorkersPanel(ctx, g, 60, 145, 340, 130);
  U.text(ctx, 'Добыча в день: руда ' + Math.round(1.2 * s.workers.assign.mine * S.toolBonus(s)) +
    (s.mineDepth >= 2 ? ', уголь ' + Math.round(0.8 * s.workers.assign.mine * S.toolBonus(s)) : ''), 60, 290, { font: '16px' });
  const veins = [
    ['iOre', 'Руда', 1], ['iCoal', 'Уголь', 2], ['iGems', 'Самоцветы', 3], ['iSalt', 'Соль', 4],
  ];
  veins.forEach(([icon, label, depth], i) => {
    const x = 70 + i * 90, y = 330;
    ctx.save();
    if (s.mineDepth < depth) ctx.globalAlpha = 0.25;
    U.drawSpriteFit(ctx, img(icon), x, y, 64, 64);
    ctx.restore();
    U.text(ctx, label, x + 32, y + 70, { align: 'center', font: '14px' });
    if (s.mineDepth < depth) U.text(ctx, '🔒 ур. ' + depth, x + 32, y + 88, { align: 'center', font: '13px', color: '#ff9090' });
  });
  const next = s.mineDepth + 1;
  const need = S.digNeed(next);
  btn(ctx, g, 60, 450, 340, 44, next <= 5 ? 'Копать глубже — ' + S.digCost(next) + '💰, отрядов: ' + need : 'Максимальная глубина',
    () => { if (!S.digDeeper(s)) g.toast('Нужно ' + S.digCost(next) + ' монет и ' + need + ' отряд(а) в Гильдии'); },
    { enabled: next <= 5 });
  btn(ctx, g, 60, 510, 340, 44, 'Плавильня: ' + (s.smelt ? 'ВКЛ (2 руды+1 уголь→железо)' : 'ВЫКЛ'), () => { s.smelt = !s.smelt; }, { font: '16px' });
  U.panel(ctx, 460, 90, 780, 520, 0.7);
  U.iconLabel(ctx, img('bTower'), 520, 130, 120, '', '18px');
  U.text(ctx, 'Заброшенная шахта деда', 680, 150, { font: '26px' });
  U.text(ctx, 'Чем глубже — тем богаче жилы, но без отрядов Гильдии дальше не пройти.', 520, 300, { font: '18px' });
  U.text(ctx, 'Железо нужно для рыцарей и заказов завода.', 520, 335, { font: '18px' });
  U.text(ctx, 'Самоцветы + мёд и воск = товары роскоши (дорогой товар).', 520, 370, { font: '18px' });
}

// ---------- Завод ----------

function drawFactory(ctx, g) {
  const s = g.state;
  U.drawSpriteFit(ctx, img('bCastle'), 560, 70, 160, 130);
  U.text(ctx, 'Заводской город', 640, 205, { align: 'center', font: '26px' });
  s.orders.forEach((o, i) => {
    const x = 60 + i * 600, y = 250, w = 560, h = 210;
    U.panel(ctx, x, y, w, h, 0.9);
    U.iconLabel(ctx, img(RES[o.res].icon), x + 20, y + 20, 56, RES[o.res].name + ' ×' + o.qty, '22px');
    U.text(ctx, 'Награда: ' + o.reward + ' монет', x + 20, y + 95, { font: '18px' });
    const left = o.deadline - s.day;
    U.text(ctx, 'Срок: ' + left + ' дн.', x + 20, y + 125, { font: '18px', color: left <= 2 ? '#ff8080' : '#ffe8c0' });
    U.text(ctx, 'На складе: ' + Math.floor(s.res[o.res] || 0), x + 20, y + 155, { font: '16px' });
    btn(ctx, g, x + 300, y + 30, 230, 44, 'Отправить караван', () => g.sendOrder(o, false),
      { enabled: !s.caravan && (s.res[o.res] || 0) >= o.qty });
    btn(ctx, g, x + 300, y + 90, 230, 44, 'С охраной (риск 5%)', () => g.sendOrder(o, true),
      { enabled: !s.caravan && (s.res[o.res] || 0) >= o.qty && !!s.guardSquad && s.squads[s.guardSquad] > 0 });
    U.bar(ctx, x + 300, y + 155, 230, 16, 1 - o.qty / o.total, '#5ec24a');
  });
  if (s.caravan) {
    const c = s.caravan;
    U.panel(ctx, 60, 480, 1160, 100, 0.9);
    U.iconLabel(ctx, img('oxCart'), 80, 495, 70, 'Караван в пути: ' + RES[c.res].name + ' ×' + c.qty + (c.guarded ? ' (охрана)' : ' (без охраны!)'), '20px');
    U.bar(ctx, 700, 515, 400, 24, 1 - c.daysLeft / 3, '#c8a060');
    U.text(ctx, 'прибытие через ' + c.daysLeft + ' дн.', 1120, 527, { font: '16px', baseline: 'middle' });
  }
  U.text(ctx, 'Караван везёт до 50 единиц. Без охраны риск ограбления 15%.', 640, 610, { align: 'center', font: '17px' });
}

// ---------- Гильдия ----------

function drawGuild(ctx, g) {
  const s = g.state;
  U.shade(ctx, 0, 0, W, H, '#001030', 0.5);
  U.drawSpriteFit(ctx, img('flag'), 90, 90, 110, 130);
  U.text(ctx, 'Гильдия', 640, 80, { align: 'center', font: '30px' });
  Object.keys(SQUADS).forEach((id, i) => {
    const q = SQUADS[id];
    const x = 60 + i * 400, y = 140, w = 370, h = 300;
    U.panel(ctx, x, y, w, h, 0.92);
    U.drawSpriteFit(ctx, img(q.icon), x + 20, y + 20, 90, 110);
    U.text(ctx, q.name, x + 130, y + 30, { font: '24px' });
    U.text(ctx, 'В отряде: ' + s.squads[id], x + 130, y + 66, { font: '18px' });
    U.text(ctx, 'Цена: ' + q.cost + ' монет +:', x + 20, y + 150, { font: '17px' });
    let ix = x + 20;
    for (const rid in q.need) {
      U.iconLabel(ctx, img(RES[rid].icon), ix, y + 180, 34, '×' + q.need[rid], '15px');
      ix += 85;
    }
    btn(ctx, g, x + 20, y + 240, w - 40, 44, 'Нанять отряд', () => g.hireSquad(id),
      { enabled: s.money >= q.cost && Object.entries(q.need).every(([r, n]) => (s.res[r] || 0) >= n) });
  });
  U.panel(ctx, 60, 470, 1160, 130, 0.9);
  U.text(ctx, 'Охрана караванов (отряд возвращается после рейса):', 80, 485, { font: '19px' });
  const guards = [['', 'Без охраны'], ...Object.keys(SQUADS).map(id => [id, SQUADS[id].name + ' (' + s.squads[id] + ')'])];
  guards.forEach(([id, label], i) => {
    const x = 80 + i * 290;
    const sel = (s.guardSquad || '') === id;
    btn(ctx, g, x, 520, 270, 40, (sel ? '● ' : '○ ') + label, () => { s.guardSquad = id || null; S.save(s); }, { enabled: !id || s.squads[id] > 0, font: '17px' });
  });
  U.text(ctx, 'Отряды нужны и для глубины шахты: ур.2 — 1 отряд, ур.4 — 2, ур.5 — 3.', 640, 625, { align: 'center', font: '17px' });
}

// ---------- Рынок ----------

function drawMarket(ctx, g) {
  const s = g.state;
  U.drawSpriteFit(ctx, img('uTent'), 60, 90, 90, 200);
  U.drawSpriteFit(ctx, img('uTent'), 1130, 90, 90, 200);
  U.text(ctx, 'Рынок', 640, 80, { align: 'center', font: '30px' });
  const mult = S.seasonPriceMult(s);
  U.text(ctx, 'Цены ' + (s.fairDays > 0 ? 'ЯРМАРКА ×2! ' : '') + '(сезон ×' + mult.toFixed(1) + ')', 640, 120, { align: 'center', font: '18px' });
  const sellable = Object.keys(RES).filter(id => (s.res[id] || 0) >= 1);
  U.panel(ctx, 180, 150, 560, 460, 0.9);
  U.text(ctx, 'Продажа', 460, 160, { align: 'center', font: '21px' });
  sellable.slice(0, 9).forEach((id, i) => {
    const y = 200 + i * 44;
    U.iconLabel(ctx, img(RES[id].icon), 200, y, 32, RES[id].name + ' ×' + Math.floor(s.res[id]), '16px');
    U.text(ctx, S.sellPrice(s, id, 1) + '💰/шт', 400, y + 16, { font: '14px', baseline: 'middle' });
    btn(ctx, g, 480, y, 60, 30, '×1', () => S.sellResource(s, id, 1), { font: '14px' });
    btn(ctx, g, 550, y, 60, 30, '×10', () => S.sellResource(s, id, 10), { font: '14px' });
    btn(ctx, g, 620, y, 90, 30, 'всё', () => S.sellResource(s, id, 999), { font: '14px' });
  });
  if (sellable.length > 9) U.text(ctx, '...и ещё ' + (sellable.length - 9), 460, 590, { align: 'center', font: '15px' });
  U.panel(ctx, 780, 150, 320, 460, 0.9);
  U.text(ctx, 'Покупка', 940, 160, { align: 'center', font: '21px' });
  const buys = [['grain', 10, 'Корм и еда'], ['herbs', 5, 'Лечение скота'], ['tools', 1, '+15% к добыче и урожаю (за 5 шт)']];
  buys.forEach(([id, n], i) => {
    const y = 210 + i * 100;
    U.iconLabel(ctx, img(RES[id].icon), 800, y, 40, RES[id].name + ' ×' + n, '16px');
    btn(ctx, g, 800, y + 50, 280, 36, S.buyPrice(s, id, n) + ' монет', () => {
      if (!S.buyResource(s, id, n)) g.toast('Не хватает монет');
      else g.toast('Куплено: ' + RES[id].name + ' ×' + n);
    }, { font: '16px' });
  });
}

// ---------- Склад ----------

function drawStore(ctx, g) {
  const s = g.state;
  U.panel(ctx, 40, 90, 640, 520, 0.9);
  U.text(ctx, 'Склад', 360, 100, { align: 'center', font: '24px' });
  U.text(ctx, 'Еда: ' + Math.floor(foodTotal(s)) + ' / ' + S.caps(s).food + '   Сырьё: ' + Math.floor(indTotal(s)) + ' / ' + S.caps(s).ind, 60, 135, { font: '17px' });
  btn(ctx, g, 460, 125, 200, 34, 'Расширить (' + S.storeCost(s) + '💰)', () => { if (!S.upgradeStore(s)) g.toast('Не хватает монет'); }, { font: '15px' });
  const ids = Object.keys(RES).filter(id => (s.res[id] || 0) >= 0.5);
  ids.forEach((id, i) => {
    const x = 60 + (i % 6) * 100, y = 180 + Math.floor(i / 6) * 62;
    U.drawSpriteFit(ctx, img(RES[id].icon), x, y, 36, 36);
    U.text(ctx, Math.floor(s.res[id]), x + 18, y + 40, { align: 'center', font: '14px' });
    if (RES[id].perish) U.text(ctx, '⏳', x + 34, y, { font: '12px' });
    hb(g, x - 4, y - 4, 44, 56, null, RES[id].name + (RES[id].perish ? ' (портится)' : ''));
  });
  U.panel(ctx, 720, 90, 520, 250, 0.9);
  U.text(ctx, 'Приоритеты автопродажи', 980, 100, { align: 'center', font: '20px' });
  const sliders = [['grainSell', 'Зерно'], ['woolSell', 'Шерсть'], ['leatherSell', 'Кожа']];
  sliders.forEach(([id, label], i) => {
    const y = 145 + i * 55;
    U.text(ctx, label, 740, y + 12, { font: '17px', baseline: 'middle' });
    btn(ctx, g, 830, y, 34, 30, '−', () => { s.sliders[id] = Math.max(0, s.sliders[id] - 10); S.save(s); }, { font: '16px' });
    U.text(ctx, s.sliders[id] + '%', 940, y + 15, { font: '17px', align: 'center', baseline: 'middle' });
    btn(ctx, g, 990, y, 34, 30, '+', () => { s.sliders[id] = Math.min(100, s.sliders[id] + 10); S.save(s); }, { font: '16px' });
    U.bar(ctx, 1050, y + 5, 160, 20, s.sliders[id] / 100, '#c8a060');
  });
  U.text(ctx, 'Продавать излишки автоматически каждый день', 980, 315, { align: 'center', font: '15px' });
  U.panel(ctx, 720, 360, 520, 250, 0.9);
  U.text(ctx, 'Журнал', 980, 370, { align: 'center', font: '20px' });
  s.log.slice(-7).forEach((l, i) => {
    U.text(ctx, 'Д' + l.day + ': ' + l.text, 740, 402 + i * 28, { font: '15px' });
  });
}

// ---------- Финал ----------

const ENDINGS = {
  symbiosis: ['🌿 СИМБИОЗ', 'Ферма, заводы и люди в равновесии. Деревня процветает, экосистема устойчива.'],
  exploiter: ['⚙️ ЭКСПЛУАТАТОР', 'Заводы работали на пределе, люди голодали. Ферма истощена — бунт и упадок.'],
  parasite: ['🪙 ПАРАЗИТ', 'Всё продано, заводы простаивали без сырья. Деревню захватил АгроХолдинг.'],
  rebirth: ['✨ ВОЗРОЖДЕНИЕ', 'Идеальный баланс! Ты восстановил экосистему Первого Народа. Новая цивилизация рождается!'],
};

function drawEnding(ctx, g) {
  const s = g.state;
  bgCover(ctx, img('bgMap'));
  U.shade(ctx, 0, 0, W, H, '#000', 0.6);
  const [title, desc] = ENDINGS[s.ending] || ENDINGS.symbiosis;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '52px Georgia, serif';
  ctx.fillStyle = '#ffe8c0';
  ctx.shadowColor = '#000'; ctx.shadowBlur = 10;
  ctx.fillText(title, W / 2, 180);
  ctx.font = '22px Georgia, serif';
  ctx.fillStyle = '#e0d0b0';
  U.wrapText(ctx, desc, W / 2, 240, 900, 32);
  ctx.restore();
  U.panel(ctx, 340, 330, 600, 240, 0.92);
  const st = s.stats;
  const rows = [
    'Монет: ' + s.money,
    'Выполнено заказов: ' + st.delivered + ' · Сорвано: ' + st.failed,
    'Дней голода: ' + st.hungerDays + ' · Караванов ограблено: ' + st.robbed,
    'Произведено продукции: ' + Math.floor(st.produced),
    'Отрядов в Гильдии: ' + S.totalSquads(s) + ' · Мораль: ' + s.morale + '%',
  ];
  rows.forEach((r, i) => U.text(ctx, r, 640, 360 + i * 38, { align: 'center', font: '20px' }));
  btn(ctx, g, W / 2 - 130, 610, 260, 54, 'Новая игра', () => g.newGame(), { font: '22px' });
}

// ---------- Всплывашки ----------

function drawPopup(ctx, g) {
  const p = g.popup;
  U.shade(ctx, 0, 0, W, H, '#000', 0.5);
  const linesH = (p.lines ? p.lines.length : 0) * 26;
  const w = 520, h = 120 + linesH + p.buttons.length * 60;
  const x = W / 2 - w / 2, y = Math.min(200, H - 40 - h);
  U.panel(ctx, x, y, w, h);
  U.text(ctx, p.title, W / 2, y + 22, { align: 'center', font: '24px' });
  (p.lines || []).forEach((l, i) => U.text(ctx, l, W / 2, y + 60 + i * 26, { align: 'center', font: '17px' }));
  p.buttons.forEach((b, i) => {
    btn(ctx, g, x + 40, y + 90 + linesH + i * 60, w - 80, 48, b.label, () => { b.action(g); if (b.keep !== true) g.popup = null; }, { enabled: b.enabled !== false, font: '19px' });
  });
}

function drawEvent(ctx, g) {
  const s = g.state;
  const ev = s.pendingEvent;
  U.shade(ctx, 0, 0, W, H, '#000', 0.65);
  const w = 620, h = 340, x = W / 2 - w / 2, y = 180;
  U.panel(ctx, x, y, w, h);
  U.drawSpriteFit(ctx, img('portrait' + (s.eventPortrait || 1)), x + 30, y + 30, 90, 100);
  U.text(ctx, ev.name, x + 150, y + 40, { font: '26px' });
  ctx.save();
  ctx.font = '19px Georgia, serif';
  ctx.fillStyle = '#ffe8c0';
  U.wrapText(ctx, ev.text, x + 150, y + 85, w - 200, 26);
  ctx.restore();
  ev.choices.forEach((c, i) => {
    btn(ctx, g, x + 40, y + 170 + i * 55, w - 80, 46, c.label, () => g.resolveEvent(c), { enabled: !c.can || c.can(g.state), font: '19px' });
  });
}

function drawToasts(ctx, g) {
  const logs = g.state.log.slice(-3);
  logs.forEach((l, i) => {
    ctx.save();
    ctx.globalAlpha = 0.85 - i * 0.2;
    ctx.fillStyle = '#241a10';
    U.roundRect(ctx, 20, 590 + i * 40, Math.min(560, 230 + l.text.length * 9), 34, 8);
    ctx.fill();
    ctx.strokeStyle = '#8a6a40';
    ctx.stroke();
    ctx.fillStyle = '#ffe8c0';
    ctx.font = '15px Georgia, serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(l.text, 32, 607 + i * 40);
    ctx.restore();
  });
}

function drawTutorial(ctx, g) {
  const s = g.state;
  const step = TUTORIAL[s.tutorialStep];
  if (!step) return;
  const txt = 'Подсказка: ' + step.text;
  ctx.save();
  ctx.font = '18px Georgia, serif';
  const w = Math.min(1100, ctx.measureText(txt).width + 60);
  const x = (W - w) / 2, y = 64;
  ctx.fillStyle = 'rgba(40,30,12,0.92)';
  U.roundRect(ctx, x, y, w, 40, 8);
  ctx.fill();
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 2;
  U.roundRect(ctx, x, y, w, 40, 8);
  ctx.stroke();
  ctx.fillStyle = '#ffe8a0';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 3;
  ctx.fillText(txt, W / 2, y + 21);
  ctx.restore();
}

import { img } from './assets.js';
import * as U from './ui.js';
import { RES, CROPS, PENS, WORKSHOPS, SQUADS, RUINS, SEASONS, TUTORIAL, foodTotal, indTotal } from './data.js';
import * as S from './state.js';

const W = 720, H = 1080;
const NAV = [['farm', 'Ферма'], ['mine', 'Шахта'], ['factory', 'Завод'], ['guild', 'Гильдия'], ['map', 'Карта']];

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
    case 'map': drawMap(ctx, g); break;
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
  ctx.fillStyle = '#14100a';
  ctx.fillRect(0, 0, W, H);
  if (!image) return;
  const k = Math.min(W / image.width, H / image.height);
  const dw = image.width * k, dh = image.height * k;
  ctx.drawImage(image, (W - dw) / 2, (H - dh) / 2, dw, dh);
  U.shade(ctx, 0, 0, W, H, '#000', 0.25);
}

function drawBackground(ctx, g) {
  const s = g.state;
  const season = S.seasonOf(s);
  if (s.screen === 'farm') bgCover(ctx, img(['bgSummer', 'bgSummer', 'bgAutumn', 'bgWinter'][season]));
  else if (s.screen === 'mine') bgCover(ctx, img('bgMine'));
  else if (s.screen === 'factory') bgCover(ctx, img('bgFactory'));
  else if (s.screen === 'guild') bgCover(ctx, img('bgMap'));
  else if (s.screen === 'market') bgCover(ctx, img('bgSummer'));
  else if (s.screen === 'map') bgCover(ctx, img('bgMap'));
}

// ---------- Меню ----------

function drawMenu(ctx, g) {
  bgCover(ctx, img('bgMap'));
  U.shade(ctx, 0, 0, W, H, '#000', 0.45);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffe8c0';
  ctx.shadowColor = '#000'; ctx.shadowBlur = 12;
  ctx.font = '56px Georgia, serif';
  ctx.fillText('Деревенский Рай', W / 2, 250);
  ctx.font = '26px Georgia, serif';
  ctx.fillStyle = '#c8a060';
  ctx.fillText('Экосистема: ферма — сырьё для заводов', W / 2, 310);
  ctx.restore();
  const bx = W / 2 - 170;
  btn(ctx, g, bx, 440, 340, 64, 'Новая игра', () => g.newGame(), { font: '26px' });
  if (S.hasSave()) btn(ctx, g, bx, 524, 340, 64, 'Продолжить', () => g.continueGame(), { font: '26px' });
  btn(ctx, g, bx, S.hasSave() ? 608 : 524, 340, 64, 'Как играть', () => { g.help = true; }, { font: '26px' });
}

function drawHelp(ctx, g) {
  U.shade(ctx, 0, 0, W, H, '#000', 0.7);
  U.panel(ctx, 30, 70, 660, 870);
  const lines = [
    'Цель: за 4 сезона (120 дней) построить устойчивую экосистему.',
    '',
    'ФЕРМА — посев (клик по полю), загоны, лес (рубка), найм рабочих.',
    'Каждый продукт имеет два назначения: еда или сырьё для заводов.',
    '',
    'ШАХТА — рабочие добывают руду и уголь. Плавильня: руда + уголь → железо.',
    'Глубина шахты открывается отрядами Гильдии.',
    '',
    'ЗАВОД — заказы: «доставь N ресурса к сроку». Вознаграждение монетами.',
    'Доставка — караваном (50 ед., риск ограбления; охрана снижает риск).',
    '',
    'ГИЛЬДИЯ — наём отрядов за монеты и продукцию (ткань, кожа, перья).',
    'Отряды охраняют караваны, открывают глубины шахты и руины.',
    'Из Гильдии открывается РЫНОК.',
    '',
    'РЫНОК — продажа, покупка и склад: лимиты, порча (−2%/день),',
    'приоритеты автопродажи, журнал событий.',
    '',
    'КАРТА — походы и руины: найми археологов и отправляй экспедиции.',
    'Печати Древних дают +5% к производству за каждую — навсегда.',
    '',
    'Зимой поля не растут — запасайтесь осенью!',
    'Денег нет? Подработка в деревне (+25) и продажа древесины спасут.',
    'Пробел — следующий день, Esc — закрыть окно.',
  ];
  ctx.save();
  ctx.font = '18px Georgia, serif';
  ctx.fillStyle = '#ffe8c0';
  ctx.textAlign = 'left';
  lines.forEach((l, i) => ctx.fillText(l, 60, 120 + i * 32));
  ctx.restore();
  btn(ctx, g, W / 2 - 100, 862, 200, 50, 'Понятно', () => { g.help = false; });
}

// ---------- Верхняя панель и навигация ----------

function drawTopBar(ctx, g) {
  const s = g.state;
  U.panel(ctx, 0, 0, W, 96, 0.95);
  const season = S.seasonOf(s);
  U.iconLabel(ctx, img('iMoney'), 16, 8, 30, String(s.money), '#ffd700', '22px');
  U.text(ctx, 'День ' + S.dayOfSeason(s) + ' · ' + SEASONS[season] + ' · Год 1', 380, 24, { align: 'center', font: '19px', baseline: 'middle' });
  U.text(ctx, 'Мораль: ' + s.morale + '%', 704, 24, { align: 'right', font: '17px', baseline: 'middle', color: s.morale < 40 ? '#ff8080' : '#ffe8c0' });
  U.iconLabel(ctx, img('iBread'), 16, 54, 26, Math.floor(foodTotal(s)) + ' / ' + S.caps(s).food, '15px');
  U.iconLabel(ctx, img('iTools'), 230, 54, 26, 'Рабочие: ' + S.workersIdle(s) + ' / ' + s.workers.total, '15px');
  if (s.seals > 0) U.iconLabel(ctx, img('iGems'), 480, 54, 26, 'Печати: ' + s.seals, '#c8a0ff', '15px');
  if (s.caravan) U.iconLabel(ctx, img('oxCart'), 634, 52, 30, s.caravan.daysLeft + ' дн.', '14px');
}

function drawNav(ctx, g) {
  const s = g.state;
  U.panel(ctx, 0, H - 130, W, 130, 0.95);
  const bw = 132, gap = 5;
  NAV.forEach(([id, label], i) => {
    const x = 10 + i * (bw + gap);
    btn(ctx, g, x, H - 118, bw, 46, label, () => { g.state.screen = id; g.popup = null; }, { enabled: s.screen !== id, font: '18px' });
  });
  btn(ctx, g, 30, H - 62, 660, 50, '▶ Новый день', () => g.nextDay(), { font: '22px', tip: 'Пробел' });
}

// ---------- Ферма ----------

function drawFarm(ctx, g) {
  const s = g.state;
  const season = S.seasonOf(s);
  const groundTile = img(season === 3 ? 'tSnow1' : 'tGrass1');
  for (let i = 0; i < 6; i++) {
    const x = 30 + (i % 2) * 330, y = 110 + Math.floor(i / 2) * 112;
    const f = s.fields[i];
    const ground = f.crop ? img('tSoil') : groundTile;
    if (ground) {
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.drawImage(ground, x, y, 315, 100);
      ctx.restore();
    }
    ctx.strokeStyle = '#5a4020'; ctx.lineWidth = 3;
    ctx.strokeRect(x, y, 315, 100);
    if (f.crop) {
      const c = CROPS[f.crop];
      const done = f.progress >= c.days;
      const spr = img(c.icon);
      if (spr) {
        const k = done ? 1 : 0.45 + 0.5 * (f.progress / c.days);
        const bw = 90 * k, bh = 70 * k;
        U.drawSpriteFit(ctx, spr, x + 157 - bw / 2, y + 54 - bh / 2, bw, bh);
      }
      U.text(ctx, c.name, x + 157, y + 12, { align: 'center', font: '16px' });
      U.bar(ctx, x + 107, y + 80, 100, 12, f.progress / c.days, done ? '#ffd700' : '#5ec24a');
      if (done) U.text(ctx, '! ГОТОВО', x + 260, y + 44, { align: 'center', font: '15px', color: '#ffd700' });
    } else {
      U.text(ctx, 'Пусто', x + 157, y + 38, { align: 'center', font: '16px', color: '#c0b090' });
      U.text(ctx, 'клик — посев', x + 157, y + 62, { align: 'center', font: '13px', color: '#a09070' });
    }
    hb(g, x, y, 315, 100, () => g.clickField(i), f.crop ? CROPS[f.crop].name : 'Посев');
  }

  U.panel(ctx, 30, 454, 320, 150, 0.85);
  const logs = img('iWood');
  if (logs) {
    U.drawSpriteFit(ctx, logs, 44, 462, 54, 44);
    U.text(ctx, 'Лес', 110, 470, { font: '18px' });
  } else {
    U.text(ctx, 'Лес', 60, 462, { font: '18px' });
  }
  btn(ctx, g, 45, 496, 290, 44, 'Рубить лес (+' + Math.round(6 * S.seasonWoodMult(season) * S.toolBonus(s) * S.sealBonus(s)) + ' др.)',
    () => { if (!S.chopWood(g.state)) g.toast('Нет свободных рабочих или лимит рубки (2/день)'); }, { enabled: S.workersIdle(s) > 0 && s.chopToday < 2, font: '15px' });
  btn(ctx, g, 45, 548, 290, 44, 'Подработка (+25💰, 1/день)',
    () => { if (!S.oddJobs(g.state)) g.toast('Нет свободных рабочих (1/день)'); }, { enabled: S.workersIdle(s) > 0 && !(s.oddToday > 0), font: '15px' });

  drawWorkersPanel(ctx, g, 370, 454, 320, 150);

  U.text(ctx, 'Загоны', 360, 608, { align: 'center', font: '18px' });
  Object.keys(PENS).forEach((id, i) => {
    const P = PENS[id];
    const x = 30 + i * 168, y = 632;
    U.panel(ctx, x, y, 156, 154, 0.85);
    U.drawSpriteFit(ctx, img(P.animal), x + 28, y + 6, 100, 78);
    U.text(ctx, P.name, x + 78, y + 92, { align: 'center', font: '15px' });
    U.text(ctx, s.pens[id] + ' / ' + P.max + ' гол.', x + 78, y + 110, { align: 'center', font: '13px' });
    btn(ctx, g, x + 13, y + 122, 130, 26, 'Купить ' + P.headCost + '💰', () => g.buyAnimal(id), { enabled: s.pens[id] < P.max && s.money >= P.headCost, font: '12px', tip: 'Корм: ' + P.feed + ' зерна/день' });
  });

  U.panel(ctx, 30, 798, 660, 142, 0.85);
  U.text(ctx, 'Постройки', 360, 806, { align: 'center', font: '16px' });
  const base = [
    { key: 'house', b: 'bHouseA', label: 'Дом', tip: 'Дом фермера: найм рабочих' },
    { key: 'barn', b: 'bBarn', label: 'Амбар', tip: 'Амбар: склад — лимиты и порча (открывает Рынок)' },
    { key: 'mill', b: 'bMill', label: 'Мельница', tip: 'Символ фермы' },
  ];
  base.forEach((it, i) => {
    const x = 50 + i * 76, y = 832;
    U.drawSpriteFit(ctx, img(it.b), x, y, 64, 64);
    U.text(ctx, it.label, x + 32, y + 66, { align: 'center', font: '12px' });
    hb(g, x, y, 64, 78, () => g.clickBaseBuilding(it.key), it.tip);
  });
  U.text(ctx, 'Мини-цеха:', 292, 826, { font: '13px' });
  Object.keys(WORKSHOPS).forEach((id, i) => {
    const wsp = WORKSHOPS[id];
    const x = 292 + (i % 7) * 56, y = 844;
    const built = s.workshops[id];
    ctx.save();
    if (!built) ctx.globalAlpha = 0.35;
    U.drawSpriteFit(ctx, img(wsp.building), x, y, 50, 44);
    ctx.restore();
    if (!built) U.text(ctx, wsp.cost + '💰', x + 25, y + 46, { align: 'center', font: '10px' });
    hb(g, x - 2, y - 2, 54, 60, () => g.clickWorkshop(id), wsp.name + ': ' + wsp.desc);
  });
}

function drawWorkersPanel(ctx, g, x, y, w, h) {
  const s = g.state;
  U.panel(ctx, x, y, w, h, 0.85);
  U.text(ctx, 'Рабочие: ' + s.workers.total, x + 12, y + 6, { font: '16px' });
  U.text(ctx, 'Свободно: ' + S.workersIdle(s), x + w - 12, y + 6, { font: '14px', align: 'right' });
  const rows = [['fields', 'Поля'], ['forest', 'Лес'], ['mine', 'Шахта']];
  rows.forEach(([id, label], i) => {
    const ry = y + 30 + i * 26;
    U.text(ctx, label, x + 12, ry + 5, { font: '15px', baseline: 'middle' });
    btn(ctx, g, x + 90, ry, 30, 22, '−', () => g.assignWorker(id, -1), { font: '14px' });
    U.text(ctx, String(s.workers.assign[id]), x + 133, ry + 11, { font: '16px', align: 'center', baseline: 'middle' });
    btn(ctx, g, x + 155, ry, 30, 22, '+', () => g.assignWorker(id, 1), { font: '14px' });
  });
  btn(ctx, g, x + 12, y + h - 34, w - 24, 26, 'Нанять рабочего (' + S.hireCost(s) + '💰)', () => g.hireWorker(), { enabled: s.money >= S.hireCost(s), font: '13px' });
}

// ---------- Шахта ----------

function drawMine(ctx, g) {
  const s = g.state;
  U.panel(ctx, 30, 110, 660, 280, 0.88);
  U.text(ctx, 'Шахта — уровень ' + s.mineDepth, 360, 118, { align: 'center', font: '22px' });
  drawWorkersPanel(ctx, g, 50, 150, 620, 130);
  U.text(ctx, 'Добыча в день: руда ' + Math.round(1.2 * s.workers.assign.mine * S.toolBonus(s) * S.sealBonus(s)) +
    (s.mineDepth >= 2 ? ', уголь ' + Math.round(0.8 * s.workers.assign.mine * S.toolBonus(s) * S.sealBonus(s)) : ''), 50, 292, { font: '15px' });
  const veins = [
    ['iOre', 'Руда', 1], ['iCoal', 'Уголь', 2], ['iGems', 'Самоцветы', 3], ['iSalt', 'Соль', 4],
  ];
  veins.forEach(([icon, label, depth], i) => {
    const x = 100 + i * 130, y = 318;
    ctx.save();
    if (s.mineDepth < depth) ctx.globalAlpha = 0.25;
    U.drawSpriteFit(ctx, img(icon), x, y, 46, 46);
    ctx.restore();
    U.text(ctx, label, x + 23, y + 48, { align: 'center', font: '13px' });
    if (s.mineDepth < depth) U.text(ctx, '🔒 ур. ' + depth, x + 23, y + 62, { align: 'center', font: '12px', color: '#ff9090' });
  });
  const next = s.mineDepth + 1;
  const need = S.digNeed(next);
  btn(ctx, g, 30, 404, 660, 48, next <= 5 ? 'Копать глубже — ' + S.digCost(next) + '💰, отрядов: ' + need : 'Максимальная глубина',
    () => { if (!S.digDeeper(s)) g.toast('Нужно ' + S.digCost(next) + ' монет и ' + need + ' отряд(а) в Гильдии'); },
    { enabled: next <= 5 });
  btn(ctx, g, 30, 462, 660, 48, 'Плавильня: ' + (s.smelt ? 'ВКЛ (2 руды+1 уголь→железо)' : 'ВЫКЛ'), () => { s.smelt = !s.smelt; }, { font: '16px' });
  U.panel(ctx, 30, 524, 660, 416, 0.7);
  U.drawSpriteFit(ctx, img('bTower'), 60, 560, 140, 130);
  U.text(ctx, 'Заброшенная шахта деда', 420, 570, { align: 'center', font: '24px' });
  U.text(ctx, 'Чем глубже — тем богаче жилы,', 60, 720, { font: '18px' });
  U.text(ctx, 'но без отрядов Гильдии дальше не пройти.', 60, 752, { font: '18px' });
  U.text(ctx, 'Железо нужно для рыцарей и заказов завода.', 60, 800, { font: '18px' });
  U.text(ctx, 'Самоцветы + мёд и воск = товары роскоши.', 60, 832, { font: '18px' });
}

// ---------- Завод ----------

function drawFactory(ctx, g) {
  const s = g.state;
  U.drawSpriteFit(ctx, img('bCastle'), 300, 104, 120, 100);
  U.text(ctx, 'Заводской город', 360, 212, { align: 'center', font: '24px' });
  s.orders.forEach((o, i) => {
    const x = 30, y = 244 + i * 240, w = 660, h = 228;
    U.panel(ctx, x, y, w, h, 0.9);
    U.iconLabel(ctx, img(RES[o.res].icon), x + 20, y + 18, 52, RES[o.res].name + ' ×' + o.qty, '21px');
    U.text(ctx, 'Награда: ' + o.reward + ' монет', x + 20, y + 92, { font: '17px' });
    const left = o.deadline - s.day;
    U.text(ctx, 'Срок: ' + left + ' дн.', x + 20, y + 122, { font: '17px', color: left <= 2 ? '#ff8080' : '#ffe8c0' });
    U.text(ctx, 'На складе: ' + Math.floor(s.res[o.res] || 0), x + 20, y + 152, { font: '15px' });
    btn(ctx, g, x + 350, y + 26, 290, 44, 'Отправить караван', () => g.sendOrder(o, false),
      { enabled: !s.caravan && (s.res[o.res] || 0) >= o.qty });
    btn(ctx, g, x + 350, y + 84, 290, 44, 'С охраной (риск 5%)', () => g.sendOrder(o, true),
      { enabled: !s.caravan && (s.res[o.res] || 0) >= o.qty && !!s.guardSquad && s.squads[s.guardSquad] > 0 });
    U.bar(ctx, x + 350, y + 148, 290, 16, 1 - o.qty / o.total, '#5ec24a');
  });
  if (s.caravan) {
    const c = s.caravan;
    U.panel(ctx, 30, 730, 660, 110, 0.9);
    U.iconLabel(ctx, img('oxCart'), 50, 748, 60, 'Караван: ' + RES[c.res].name + ' ×' + c.qty + (c.guarded ? ' (охрана)' : ' (без охраны!)'), '17px');
    U.bar(ctx, 50, 800, 440, 22, 1 - c.daysLeft / 3, '#c8a060');
    U.text(ctx, 'через ' + c.daysLeft + ' дн.', 660, 812, { font: '15px', baseline: 'middle' });
  }
  U.text(ctx, 'Караван везёт до 50 единиц. Без охраны риск ограбления 15%.', 360, 862, { align: 'center', font: '16px' });
}

// ---------- Гильдия ----------

function drawGuild(ctx, g) {
  const s = g.state;
  U.shade(ctx, 0, 0, W, H, '#001030', 0.5);
  U.drawSpriteFit(ctx, img('flag'), 40, 96, 80, 96);
  U.text(ctx, 'Гильдия', 400, 104, { align: 'center', font: '28px' });
  Object.keys(SQUADS).forEach((id, i) => {
    const q = SQUADS[id];
    const x = 30, y = 150 + i * 186, w = 660, h = 174;
    U.panel(ctx, x, y, w, h, 0.92);
    U.drawSpriteFit(ctx, img(q.icon), x + 16, y + 16, 70, 90);
    U.text(ctx, q.name, x + 104, y + 20, { font: '22px' });
    U.text(ctx, 'В отряде: ' + s.squads[id], x + 104, y + 58, { font: '17px' });
    U.text(ctx, 'Цена: ' + q.cost + ' монет +:', x + 20, y + 116, { font: '16px' });
    let ix = x + 20;
    for (const rid in q.need) {
      U.iconLabel(ctx, img(RES[rid].icon), ix, y + 134, 30, '×' + q.need[rid], '14px');
      ix += 80;
    }
    btn(ctx, g, x + 390, y + 110, 250, 50, 'Нанять отряд', () => g.hireSquad(id),
      { enabled: s.money >= q.cost && Object.entries(q.need).every(([r, n]) => (s.res[r] || 0) >= n) });
  });
  U.panel(ctx, 30, 714, 660, 146, 0.9);
  U.text(ctx, 'Охрана караванов (отряд возвращается после рейса):', 50, 722, { font: '16px' });
  const guards = [['', 'Без охраны'], ...Object.keys(SQUADS).map(id => [id, SQUADS[id].name + ' (' + s.squads[id] + ')'])];
  guards.forEach(([id, label], i) => {
    const x = 50 + (i % 2) * 320, y = 754 + Math.floor(i / 2) * 48;
    const sel = (s.guardSquad || '') === id;
    btn(ctx, g, x, y, 300, 40, (sel ? '● ' : '○ ') + label, () => { s.guardSquad = id || null; S.save(s); }, { enabled: !id || s.squads[id] > 0, font: '15px' });
  });
  btn(ctx, g, 30, 872, 660, 58, '🛒 Рынок — продажа, покупка, склад', () => { s.screen = 'market'; }, { font: '19px' });
}

// ---------- Карта: походы и руины ----------

function drawMap(ctx, g) {
  const s = g.state;
  U.shade(ctx, 0, 0, W, H, '#0a1a0a', 0.35);
  U.text(ctx, 'Карта походов', 360, 104, { align: 'center', font: '28px' });
  U.panel(ctx, 30, 140, 660, 112, 0.9);
  U.drawSpriteFit(ctx, img('chSage'), 44, 152, 66, 88);
  U.text(ctx, 'Археологи: ' + s.arch + ' / 4', 130, 156, { font: '20px' });
  U.text(ctx, 'На время похода археологи заняты', 130, 192, { font: '14px', color: '#c0b090' });
  btn(ctx, g, 480, 168, 190, 52, 'Нанять (250💰)', () => g.hireArch(), { enabled: s.money >= 250 && s.arch < 4, font: '17px' });
  if (s.expedition) {
    const e = s.expedition;
    const r = RUINS[e.ruin];
    U.panel(ctx, 30, 264, 660, 96, 0.9);
    U.iconLabel(ctx, img('oxCart'), 50, 280, 56, 'Экспедиция: ' + r.name, '18px');
    U.bar(ctx, 50, 322, 440, 20, 1 - e.daysLeft / r.days, '#c8a060');
    U.text(ctx, 'возврат через ' + e.daysLeft + ' дн.', 660, 332, { font: '15px', baseline: 'middle' });
  }
  Object.keys(RUINS).forEach((id, i) => {
    const r = RUINS[id];
    const x = 30, y = 374 + i * 190, w = 660, h = 178;
    U.panel(ctx, x, y, w, h, 0.92);
    U.drawSpriteFit(ctx, img(r.icon), x + 18, y + 20, 64, 64);
    U.text(ctx, r.name, x + 100, y + 16, { font: '21px' });
    U.text(ctx, r.desc, x + 100, y + 52, { font: '14px', color: '#c0b090' });
    const done = s.ruinsDone[id] || 0;
    U.text(ctx, 'Дней: ' + r.days + ' · Археологов: ' + r.arch + ' · Отрядов: ' + r.squads +
      (done ? ' · Исследовано: ' + done + '×' : ''), x + 100, y + 78, { font: '15px' });
    let ix = x + 100;
    U.iconLabel(ctx, img('iMoney'), ix, y + 108, 30, '+' + r.reward.money, '#ffd700', '14px');
    ix += 110;
    for (const rid in r.reward) {
      if (rid === 'money') continue;
      U.iconLabel(ctx, img(RES[rid].icon), ix, y + 108, 30, '+' + r.reward[rid], '14px');
      ix += 110;
    }
    if (r.seal) U.iconLabel(ctx, img('iGems'), ix, y + 108, 30, '+Печать', '#c8a0ff', '14px');
    btn(ctx, g, x + 460, y + 60, 180, 60, 'В поход!', () => g.sendExpedition(id),
      { enabled: !s.expedition && s.arch >= r.arch && S.totalSquads(s) >= r.squads, font: '18px' });
  });
  U.text(ctx, 'Печати Древних: ' + s.seals + ' · каждая даёт +5% к производству', 360, 944, { align: 'center', font: '15px', color: '#c8a0ff' });
}

// ---------- Рынок + Склад ----------

function drawMarket(ctx, g) {
  const s = g.state;
  U.drawSpriteFit(ctx, img('uTent'), 40, 96, 60, 130);
  U.drawSpriteFit(ctx, img('uTent'), 620, 96, 60, 130);
  U.text(ctx, 'Рынок', 360, 100, { align: 'center', font: '28px' });
  const mult = S.seasonPriceMult(s);
  U.text(ctx, 'Цены ' + (s.fairDays > 0 ? 'ЯРМАРКА ×2! ' : '') + '(сезон ×' + mult.toFixed(1) + ')', 360, 136, { align: 'center', font: '16px' });
  const sellable = Object.keys(RES).filter(id => (s.res[id] || 0) >= 1);
  U.panel(ctx, 30, 156, 330, 500, 0.9);
  U.text(ctx, 'Продажа', 195, 164, { align: 'center', font: '19px' });
  sellable.slice(0, 9).forEach((id, i) => {
    const y = 198 + i * 44;
    U.iconLabel(ctx, img(RES[id].icon), 44, y, 26, RES[id].name + ' ×' + Math.floor(s.res[id]), '14px');
    U.text(ctx, S.sellPrice(s, id, 1) + '💰/шт', 44, y + 24, { font: '11px', color: '#c0b090' });
    btn(ctx, g, 210, y + 2, 44, 26, '×1', () => S.sellResource(s, id, 1), { font: '13px' });
    btn(ctx, g, 258, y + 2, 44, 26, '×10', () => S.sellResource(s, id, 10), { font: '13px' });
    btn(ctx, g, 306, y + 2, 40, 26, 'всё', () => S.sellResource(s, id, 999), { font: '13px' });
  });
  if (sellable.length > 9) U.text(ctx, '...и ещё ' + (sellable.length - 9), 195, 612, { align: 'center', font: '13px' });
  U.panel(ctx, 380, 156, 310, 240, 0.9);
  U.text(ctx, 'Покупка', 535, 164, { align: 'center', font: '19px' });
  const buys = [['grain', 10, ''], ['herbs', 5, ''], ['tools', 1, '+15% к добыче и урожаю (за 5 шт)']];
  buys.forEach(([id, n, note], i) => {
    const y = 198 + i * 62;
    U.iconLabel(ctx, img(RES[id].icon), 396, y, 30, RES[id].name + ' ×' + n, '15px');
    if (note) U.text(ctx, note, 396, y + 26, { font: '11px', color: '#c0b090' });
    btn(ctx, g, 396, y + (note ? 40 : 32), 280, 28, S.buyPrice(s, id, n) + ' монет', () => {
      if (!S.buyResource(s, id, n)) g.toast('Не хватает монет');
      else g.toast('Куплено: ' + RES[id].name + ' ×' + n);
    }, { font: '14px' });
  });
  U.panel(ctx, 380, 406, 310, 250, 0.9);
  U.text(ctx, 'Склад', 535, 414, { align: 'center', font: '19px' });
  U.text(ctx, 'Еда: ' + Math.floor(foodTotal(s)) + ' / ' + S.caps(s).food, 396, 446, { font: '14px' });
  U.text(ctx, 'Сырьё: ' + Math.floor(indTotal(s)) + ' / ' + S.caps(s).ind, 396, 468, { font: '14px' });
  btn(ctx, g, 396, 492, 280, 30, 'Расширить (' + S.storeCost(s) + '💰)', () => { if (!S.upgradeStore(s)) g.toast('Не хватает монет'); }, { font: '14px' });
  U.text(ctx, 'Автопродажа излишков:', 396, 532, { font: '14px' });
  const sliders = [['grainSell', 'Зерно'], ['woolSell', 'Шерсть'], ['leatherSell', 'Кожа']];
  sliders.forEach(([id, label], i) => {
    const y = 556 + i * 32;
    U.text(ctx, label, 396, y + 8, { font: '13px', baseline: 'middle' });
    btn(ctx, g, 470, y, 28, 26, '−', () => { s.sliders[id] = Math.max(0, s.sliders[id] - 10); S.save(s); }, { font: '13px' });
    U.text(ctx, s.sliders[id] + '%', 540, y + 13, { font: '13px', align: 'center', baseline: 'middle' });
    btn(ctx, g, 572, y, 28, 26, '+', () => { s.sliders[id] = Math.min(100, s.sliders[id] + 10); S.save(s); }, { font: '13px' });
    U.bar(ctx, 608, y + 3, 70, 20, s.sliders[id] / 100, '#c8a060');
  });
  U.panel(ctx, 30, 668, 660, 272, 0.9);
  U.text(ctx, 'Журнал', 360, 676, { align: 'center', font: '19px' });
  s.log.slice(-8).forEach((l, i) => {
    U.text(ctx, 'Д' + l.day + ': ' + l.text, 50, 708 + i * 28, { font: '14px' });
  });
}

// ---------- Финал ----------

const ENDINGS = {
  symbiosis: ['🌿 СИМБИОЗ', 'Ферма, заводы и люди в равновесии. Деревня процветает, экосистема устойчива.'],
  exploiter: ['⚙️ ЭКСПЛУАТАТОР', 'Заводы работали на пределе, люди голодали. Ферма истощена — бунт и упадок.'],
  parasite: ['🦠 ПАРАЗИТ', 'Всё продано, заводы простаивали без сырья. Деревню захватил АгроХолдинг.'],
  rebirth: ['✨ ВОЗРОЖДЕНИЕ', 'Идеальный баланс! Ты восстановил экосистему Первого Народа. Новая цивилизация рождается!'],
};

function drawEnding(ctx, g) {
  const s = g.state;
  bgCover(ctx, img('bgMap'));
  U.shade(ctx, 0, 0, W, H, '#000', 0.6);
  const [title, desc] = ENDINGS[s.ending] || ENDINGS.symbiosis;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '48px Georgia, serif';
  ctx.fillStyle = '#ffe8c0';
  ctx.shadowColor = '#000'; ctx.shadowBlur = 10;
  ctx.fillText(title, W / 2, 200);
  ctx.font = '22px Georgia, serif';
  ctx.fillStyle = '#e0d0b0';
  U.wrapText(ctx, desc, W / 2, 260, 600, 32);
  ctx.restore();
  U.panel(ctx, 60, 360, 600, 400, 0.92);
  const st = s.stats;
  const rows = [
    'Монет: ' + s.money,
    'Выполнено заказов: ' + st.delivered + ' · Сорвано: ' + st.failed,
    'Дней голода: ' + st.hungerDays + ' · Караванов ограблено: ' + st.robbed,
    'Произведено продукции: ' + Math.floor(st.produced),
    'Отрядов в Гильдии: ' + S.totalSquads(s) + ' · Мораль: ' + s.morale + '%',
    'Печатей Древних: ' + (s.seals || 0),
  ];
  rows.forEach((r, i) => U.text(ctx, r, 360, 396 + i * 44, { align: 'center', font: '19px' }));
  btn(ctx, g, W / 2 - 130, 830, 260, 54, 'Новая игра', () => g.newGame(), { font: '22px' });
}

// ---------- Всплывашки ----------

function drawPopup(ctx, g) {
  const p = g.popup;
  U.shade(ctx, 0, 0, W, H, '#000', 0.5);
  const linesH = (p.lines ? p.lines.length : 0) * 26;
  const w = 640, h = 120 + linesH + p.buttons.length * 60;
  const x = W / 2 - w / 2, y = Math.max(20, Math.min(300, H - 40 - h));
  U.panel(ctx, x, y, w, h);
  U.text(ctx, p.title, W / 2, y + 20, { align: 'center', font: '23px' });
  (p.lines || []).forEach((l, i) => U.text(ctx, l, W / 2, y + 58 + i * 26, { align: 'center', font: '16px' }));
  p.buttons.forEach((b, i) => {
    btn(ctx, g, x + 40, y + 88 + linesH + i * 60, w - 80, 48, b.label, () => { b.action(g); if (b.keep !== true) g.popup = null; }, { enabled: b.enabled !== false, font: '18px' });
  });
}

function drawEvent(ctx, g) {
  const s = g.state;
  const ev = s.pendingEvent;
  U.shade(ctx, 0, 0, W, H, '#000', 0.65);
  const w = 660, h = 380, x = W / 2 - w / 2, y = 320;
  U.panel(ctx, x, y, w, h);
  U.drawSpriteFit(ctx, img('portrait' + (s.eventPortrait || 1)), x + 30, y + 30, 90, 100);
  U.text(ctx, ev.name, x + 150, y + 40, { font: '25px' });
  ctx.save();
  ctx.font = '19px Georgia, serif';
  ctx.fillStyle = '#ffe8c0';
  U.wrapText(ctx, ev.text, x + 150, y + 90, w - 200, 26);
  ctx.restore();
  ev.choices.forEach((c, i) => {
    btn(ctx, g, x + 40, y + 180 + i * 58, w - 80, 48, c.label, () => g.resolveEvent(c), { enabled: !c.can || c.can(g.state), font: '18px' });
  });
}

function drawToasts(ctx, g) {
  const logs = g.state.log.slice(-3);
  logs.forEach((l, i) => {
    ctx.save();
    ctx.globalAlpha = 0.85 - i * 0.2;
    ctx.fillStyle = '#241a10';
    U.roundRect(ctx, 20, H - 300 + i * 44, Math.min(680, 230 + l.text.length * 9), 38, 8);
    ctx.fill();
    ctx.strokeStyle = '#8a6a40';
    ctx.stroke();
    ctx.fillStyle = '#ffe8c0';
    ctx.font = '15px Georgia, serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(l.text, 32, H - 281 + i * 44);
    ctx.restore();
  });
}

function drawTutorial(ctx, g) {
  const s = g.state;
  const step = TUTORIAL[s.tutorialStep];
  if (!step) return;
  const txt = 'Подсказка: ' + step.text;
  ctx.save();
  ctx.font = '17px Georgia, serif';
  const tooWide = ctx.measureText(txt).width + 50 > 660;
  const w = Math.min(660, ctx.measureText(txt).width + 50);
  const h = tooWide ? 64 : 40;
  const x = (W - w) / 2, y = 100;
  ctx.fillStyle = 'rgba(40,30,12,0.92)';
  U.roundRect(ctx, x, y, w, h, 8);
  ctx.fill();
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 2;
  U.roundRect(ctx, x, y, w, h, 8);
  ctx.stroke();
  ctx.fillStyle = '#ffe8a0';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (tooWide) U.wrapText(ctx, txt, W / 2, y + h / 2, w - 40, 24);
  else ctx.fillText(txt, W / 2, y + 21);
  ctx.restore();
}

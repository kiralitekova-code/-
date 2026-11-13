// ===== Данные игры «Деревенский Рай: Наследие» =====

export const SEASONS = [
  { name: 'Весна', icon: '🌸', chapter: 'Глава 1. «Возвращение»' },
  { name: 'Лето', icon: '☀️', chapter: 'Глава 2. «Расцвет»' },
  { name: 'Осень', icon: '🍂', chapter: 'Глава 3. «Испытание»' },
  { name: 'Зима', icon: '❄️', chapter: 'Глава 4. «Финал»' },
];
export const DAYS_PER_SEASON = 12;

export const CROPS = {
  turnip:     { name: 'Репа',       icon: '🥬', seedCost: 10, sell: 25,  days: 2, season: 0 },
  potato:     { name: 'Картофель',  icon: '🥔', seedCost: 15, sell: 40,  days: 3, season: 0 },
  strawberry: { name: 'Земляника',  icon: '🍓', seedCost: 25, sell: 60,  days: 3, season: 0 },
  wheat:      { name: 'Пшеница',    icon: '🌾', seedCost: 12, sell: 35,  days: 3, season: 1 },
  corn:       { name: 'Кукуруза',   icon: '🌽', seedCost: 20, sell: 55,  days: 4, season: 1 },
  pumpkin:    { name: 'Тыква',      icon: '🎃', seedCost: 30, sell: 90,  days: 4, season: 2 },
  cabbage:    { name: 'Капуста',    icon: '🥬', seedCost: 18, sell: 45,  days: 3, season: 2 },
  carrot:     { name: 'Морковь',    icon: '🥕', seedCost: 14, sell: 38,  days: 2, season: 0 },
  winter:     { name: 'Озимая пшеница', icon: '🌾', seedCost: 15, sell: 50, days: 3, season: 3 },
};

export const ANIMALS = {
  chicken: { name: 'Курица',   icon: '🐔', cost: 250,  product: 'Яйцо',     productIcon: '🥚', productValue: 20 },
  cow:     { name: 'Корова',   icon: '🐄', cost: 800,  product: 'Молоко',   productIcon: '🥛', productValue: 55 },
  sheep:   { name: 'Овца',     icon: '🐑', cost: 600,  product: 'Шерсть',   productIcon: '🧶', productValue: 45 },
  bee:     { name: 'Пчёлы',    icon: '🐝', cost: 500,  product: 'Мёд',      productIcon: '🍯', productValue: 65 },
};

export const ORE = { stone: { name: 'Камень', sell: 8 }, ore: { name: 'Руда', sell: 35 }, gem: { name: 'Самоцвет', sell: 120 } };

export const NPCS = [
  {
    id: 'nyura', name: 'Баба Нюра', color: 0xb05a8f, pos: [-8, 0, 14],
    dialogs: [
      'Ох, Максим, внук Ивана! Как же ты вырос... Дед часто о тебе рассказывал.',
      'Ферма запустилась, конечно, но земля здесь добрая. Вспаши грядки — и всё пойдёт.',
      'Если будешь хорошо относиться к земле — земля ответит тем же.',
    ],
  },
  {
    id: 'senya', name: 'Сеня-тракторист', color: 0xd97b29, pos: [18, 0, 10],
    dialogs: [
      'О, новый хозяин фермы! Слышал, ты из Москвы? Программист, говоришь?',
      'Трактор деда Ивана всё ещё в амбаре. Заправь меня чем-нибудь вкусненьким — и починю!',
      'Работа на земле — она как код: сначала баги, потом гармония!',
    ],
  },
  {
    id: 'vika', name: 'Вика', color: 0xe05a7a, pos: [6, 0, 42],
    dialogs: [
      'Привет! Ты новенький фермер? Я Вика, дочь мэра. Работаю ветеринаром.',
      'У тебя курятник? Если куры захандруют — приходи ко мне, помогу.',
      'Деревня у нас красивая, правда? Надеюсь, Громов её не тронет...',
    ],
  },
  {
    id: 'ashot', name: 'Торговец Ашот', color: 0x3a7ab0, pos: [-4, 0, 40],
    dialogs: [
      'Добро пожаловать в мой магазин! Лучшие семена в Берёзовке!',
      'За особые задания — особые семена. Старая школа!',
      'Громов мне предлагал продать магазин. Послал его далеко и надолго!',
    ],
  },
  {
    id: 'gromov', name: 'Виктор Громов', color: 0x444444, pos: [30, 0, 46],
    dialogs: [
      'А-а, наследничек. Мой инспектор уже оценил вашу... «ферму».',
      'Продай землю, пока даю хорошую цену. Иначе пожалеешь.',
      'Эта деревня будет моей. Вопрос времени.',
    ],
  },
];

// Сюжетные квесты: последовательная цепочка
export const STORY_QUESTS = [
  {
    id: 'q_till', chapter: 0, title: 'Уборка фермы',
    desc: 'Вспаши 6 грядок мотыгой.',
    goal: s => Math.min(s.stats.tilled, 6), target: 6,
    reward: { money: 120, seeds: { potato: 3 } }, rewardText: '120💰 + 3 семени картофеля',
  },
  {
    id: 'q_first_harvest', chapter: 0, title: 'Первый урожай',
    desc: 'Собери 3 любых урожая.',
    goal: s => Math.min(s.stats.harvested, 3), target: 3,
    reward: { money: 200 }, rewardText: '200💰',
  },
  {
    id: 'q_meet', chapter: 0, title: 'Знакомство с соседями',
    desc: 'Поговори с 4 жителями деревни (Баба Нюра, Сеня, Вика, Ашот).',
    goal: s => s.stats.metNpcs.filter(n => n !== 'gromov').length, target: 4,
    reward: { money: 150, seeds: { turnip: 2 } }, rewardText: '150💰 + семена',
  },
  {
    id: 'q_chickens', chapter: 0, title: 'Оборона курятника',
    desc: 'Бродячие собаки напали на курятник! Заведи 2 курицы и защити хозяйство.',
    goal: s => Math.min(s.animals.chicken || 0, 2), target: 2,
    reward: { money: 250 }, rewardText: '250💰',
  },
  {
    id: 'q_cow', chapter: 1, title: 'Ферма набирает силу',
    desc: 'Купи корову в магазине Ашота.',
    goal: s => Math.min(s.animals.cow || 0, 1), target: 1,
    reward: { money: 300 }, rewardText: '300💰',
  },
  {
    id: 'q_festival', chapter: 1, title: 'Фестиваль деревни',
    desc: 'Заработай 1500💰 с продаж продукции к фестивалю.',
    goal: s => Math.min(Math.floor(s.stats.earned / 100) / 15, 10) >= 10 ? 10 : Math.floor(s.stats.earned / 150), target: 10,
    reward: { money: 500 }, rewardText: '500💰',
  },
  {
    id: 'q_fire', chapter: 1, title: 'Тушение пожара',
    desc: 'Громов поджёг поле! Полей ВСЕ посаженные грядки (пожар потушен водой).',
    goal: s => s.stats.fireExtinguished ? 1 : 0, target: 1,
    reward: { money: 400, seeds: { corn: 3 } }, rewardText: '400💰 + 3 семени кукурузы',
  },
  {
    id: 'q_mine', chapter: 2, title: 'Секрет старой шахты',
    desc: 'Лесник Фил рассказал о шахте деда. Добудь 5 руды из камней в лесу.',
    goal: s => Math.min(s.stats.oreMined, 5), target: 5,
    reward: { money: 600 }, rewardText: '600💰',
  },
  {
    id: 'q_neighbors', chapter: 2, title: 'Деревня не продаётся',
    desc: 'Громов скупает землю! Поговори с 3 жителями, чтобы убедить их не продавать участки.',
    goal: s => Math.min(s.stats.convinced, 3), target: 3,
    reward: { money: 700 }, rewardText: '700💰',
  },
  {
    id: 'q_big_harvest', chapter: 2, title: 'Большой урожай',
    desc: 'Собери 15 урожаев всего (подготовка к зиме).',
    goal: s => Math.min(s.stats.harvested, 15), target: 15,
    reward: { money: 800 }, rewardText: '800💰',
  },
  {
    id: 'q_court', chapter: 3, title: 'Документы для суда',
    desc: 'Собери доказательства восстановления фермы: заработай 6000💰 всего.',
    goal: s => Math.min(Math.floor(s.stats.earned / 600), 10), target: 10,
    reward: { money: 1000 }, rewardText: '1000💰',
  },
  {
    id: 'q_auction', chapter: 3, title: 'Финальный аукцион',
    desc: 'Громов выставил долг фермы на аукцион! Заплати 8000💰 и спаси деревню.',
    goal: s => s.stats.farmSaved ? 1 : 0, target: 1,
    reward: {}, rewardText: 'Судьба деревни!',
  },
];

export const DAILY_QUESTS = [
  { id: 'd_water', text: 'Полей 5 грядок', check: s => s.stats.wateredToday >= 5, reward: 40 },
  { id: 'd_harvest', text: 'Собери 3 урожая', check: s => s.stats.harvestedToday >= 3, reward: 50 },
  { id: 'd_collect', text: 'Собери продукцию животных', check: s => s.stats.collectedToday >= 1, reward: 30 },
  { id: 'd_mine', text: 'Разбей 2 камня в лесу', check: s => s.stats.minedToday >= 2, reward: 45 },
  { id: 'd_sell', text: 'Продай товары в магазине', check: s => s.stats.soldToday >= 1, reward: 35 },
];

// Customer artwork is hosted by univer.ai; keep image files out of this repository.
// Names, sizes, and order follow dream-num/univer.ai: src/data/customers.ts.
// Preserve the website's order, visual scale, background treatment, and icon/name lockups.
export const customerLogoBaseUrl = 'https://univer.ai/assets/customers/'

interface ICustomer {
  file: string
  width: number
  height: number
  en: string
  zh?: string
  surface?: 'transparent' | 'light' | 'dark'
  lockup?: boolean
  hasChinese?: boolean
  s?: number
}

const rowA: ICustomer[] = [
  // Lead with widely recognized international brands.
  { file: 'samsung.svg', width: 1552, height: 239, en: 'Samsung', zh: '三星', s: 0.85 },
  { file: 'novartis.svg', width: 1893, height: 310, en: 'Novartis', zh: '诺华' },
  { file: 'shopee.svg', width: 889, height: 281, en: 'Shopee' },
  { file: 'clickup.svg', width: 100, height: 30, en: 'ClickUp' },
  { file: 'mistral-ai.png', width: 754, height: 133, en: 'Mistral AI', s: 0.85 },
  { file: 'genspark.svg', width: 30, height: 30, en: 'Genspark', surface: 'dark', lockup: true },
  { file: 'zhipu-ai.svg', width: 96, height: 27, en: 'Z.AI', zh: '智谱 AI', s: 0.8 },
  { file: '01ai.svg', width: 74, height: 24, en: '01.AI', zh: '零一万物' },
  { file: 'bilibili.svg', width: 1564, height: 697, en: 'bilibili', zh: '哔哩哔哩', s: 0.8 },
  { file: 'china-telecom.svg', width: 1732, height: 476, en: 'China Telecom', zh: '中国电信', hasChinese: true },
  { file: 'ping-an-bank.svg', width: 844, height: 81, en: 'Ping An Bank', zh: '平安银行' },
  { file: 'iflytek.svg', width: 168, height: 33, en: 'iFLYTEK', zh: '科大讯飞' },
  { file: 'kunlun-tech.svg', width: 1523, height: 610, en: 'Kunlun Tech', zh: '昆仑万维' },
  { file: 'modelbest.svg', width: 837, height: 145, en: 'ModelBest', zh: '面壁智能' },
  { file: 'intsig.svg', width: 205, height: 43, en: 'INTSIG', zh: '合合信息' },
  { file: 'youdao.svg', width: 93, height: 24, en: 'NetEase Youdao', zh: '网易有道' },
  { file: 'beem.svg', width: 94, height: 28, en: 'Beem' },
  { file: 'docyrus.svg', width: 1310, height: 247, en: 'Docyrus', s: 1.1 },
  { file: 'notegpt.webp', width: 716, height: 179, en: 'NoteGPT', s: 1.3 },
  { file: 'kodix.png', width: 375, height: 85, en: 'KodiX', surface: 'dark', s: 0.8 },
  { file: 'olimp.png', width: 1152, height: 383, en: 'Olimp', s: 1.1 },
  { file: 'redrob.png', width: 732, height: 147, en: 'Redrob', s: 0.75 },
  { file: 'vifm.png', width: 300, height: 89, en: 'VIFM', s: 0.85 },
  { file: '4399.png', width: 97, height: 26, en: '4399', s: 0.3 },
  { file: 'mcc.jpg', width: 347, height: 227, en: 'MCC', zh: '中冶 MCC', surface: 'light', s: 1.4 },
  { file: 'weaver.png', width: 442, height: 144, en: 'Weaver', zh: '泛微', s: 1.15 },
  { file: 'tuhu.png', width: 281, height: 56, en: 'Tuhu', zh: '途虎养车', surface: 'light', s: 0.8, hasChinese: true },
  { file: 'nutstore.svg', width: 688, height: 152, en: 'Nutstore', zh: '坚果云', s: 1.25 },
  { file: 'mininglamp.svg', width: 774, height: 190, en: 'Mininglamp', zh: '明略科技', s: 1.3 },
  { file: 'chempartner.svg', width: 171, height: 46, en: 'ChemPartner', s: 1.2 },
  { file: 'farben.svg', width: 156, height: 36, en: 'Farben', zh: '法本信息', s: 0.7 },
  { file: 'vanchip.png', width: 153, height: 31, en: 'Vanchip', zh: '唯捷创芯' },
]

const rowB: ICustomer[] = [
  { file: 'qiaoyin.png', width: 216, height: 43, en: 'Qiaoyin', zh: '侨银股份', s: 0.9, hasChinese: true },
  {
    file: 'hebei-gode.png',
    width: 197,
    height: 70,
    en: 'Hebei Gode',
    zh: '河北戈德防伪科技',
    s: 1.25,
    hasChinese: true,
  },
  { file: 'mongoso.svg', width: 73, height: 38, en: 'Mongoso', zh: '深圳芒果松科技', s: 0.55 },
  {
    file: 'topsnap-hexie.jpg',
    width: 391,
    height: 130,
    en: 'Topsnap Hexie',
    zh: '合携',
    surface: 'light',
    s: 1.2,
    hasChinese: true,
  },
  { file: 'all-green-recycling.png', width: 1146, height: 271, en: 'All Green Recycling', surface: 'light', s: 1.1 },
  { file: 'sudoprivacy.png', width: 146, height: 80, en: 'Sudoprivacy', zh: '数牍科技', s: 1.3, hasChinese: true },
  { file: 'kanyun.svg', width: 133, height: 24, en: 'Kanyun', zh: '看云控股', s: 0.95, hasChinese: true },
  { file: 'cingta.svg', width: 156, height: 24, en: 'Cingta', zh: '青塔', s: 0.85, hasChinese: true },
  { file: 'kros.svg', width: 137, height: 32, en: 'KROS' },
  {
    file: 'hengchang.jpg',
    width: 837,
    height: 884,
    en: 'Hengchang',
    zh: '衡昌烧坊',
    surface: 'light',
    lockup: true,
    hasChinese: true,
  },
  { file: 'brightwave.svg', width: 19, height: 20, en: 'Brightwave', lockup: true },
  { file: 'energent-ai.png', width: 241, height: 338, en: 'Energent.ai', lockup: true },
  { file: 'learnyst.png', width: 522, height: 113, en: 'Learnyst', s: 1.1 },
  { file: 'ntelio.webp', width: 600, height: 190, en: 'Ntelio', s: 0.75 },
  { file: 'red-unisol.jpg', width: 355, height: 355, en: 'Red Unisol', surface: 'light', lockup: true },
  { file: 'se-survey.png', width: 381, height: 215, en: 'SE Survey', s: 1.1 },
  { file: 'nstc.png', width: 119, height: 65, en: 'NSTC', zh: '九恒星', s: 1.15, hasChinese: true },
  { file: 'goodlinker.svg', width: 559, height: 125, en: 'GoodLinker' },
  { file: 'starrides.png', width: 336, height: 94, en: 'StarRides', zh: '耀出行' },
  { file: 'asg-logistics.png', width: 1200, height: 389, en: 'ASG Logistics' },
  { file: 'cloudoffis.svg', width: 240, height: 41, en: 'Cloudoffis' },
  { file: 'hallo-welt.png', width: 321, height: 329, en: 'Hallo Welt!' },
  { file: 'modern-widya-tehnical.jpg', width: 150, height: 118, en: 'Modern Widya', surface: 'light', lockup: true },
  { file: 'nuwax.png', width: 230, height: 245, en: 'Nuwax', surface: 'dark', lockup: true },
  { file: 'redikru.svg', width: 558, height: 142, en: 'Redikru' },
  { file: 'seeger-weiss.svg', width: 241, height: 21, en: 'Seeger Weiss' },
  { file: 'xpert-ai.png', width: 960, height: 694, en: 'XpertAI', lockup: true },
  { file: 'jnpf.png', width: 210, height: 56, en: 'JNPF', s: 1.15 },
  { file: 'accton.png', width: 5581, height: 1240, en: 'Accton', s: 0.7 },
  { file: 'lets-magic.webp', width: 1248, height: 320, en: 'Super Magic', zh: '超级麦吉', surface: 'light', s: 1.1 },
  { file: 'fit2cloud.svg', width: 2717, height: 285, en: 'FIT2CLOUD', zh: '飞致云', hasChinese: true },
]

const customers = [...rowA, ...rowB]

// Stable groups keep the original order within each language group.
export const customerList = [...customers.filter((c) => !c.hasChinese), ...customers.filter((c) => c.hasChinese)]

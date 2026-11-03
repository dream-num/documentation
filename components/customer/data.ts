import type { StaticImageData } from 'next/image'
import logo01aiSvg from './logo/01ai.svg'
import logo4399Png from './logo/4399.png'
import logoAcctonPng from './logo/accton.png'
import logoAllGreenRecyclingPng from './logo/all-green-recycling.png'
import logoAsgLogisticsPng from './logo/asg-logistics.png'
import logoBeemSvg from './logo/beem.svg'
import logoBilibiliSvg from './logo/bilibili.svg'
import logoBrightwaveSvg from './logo/brightwave.svg'
import logoChempartnerSvg from './logo/chempartner.svg'
import logoChinaTelecomSvg from './logo/china-telecom.svg'
import logoCingtaSvg from './logo/cingta.svg'
import logoClickupSvg from './logo/clickup.svg'
import logoCloudoffisSvg from './logo/cloudoffis.svg'
import logoDocyrusSvg from './logo/docyrus.svg'
import logoEnergentAiPng from './logo/energent-ai.png'
import logoFarbenSvg from './logo/farben.svg'
import logoFit2cloudSvg from './logo/fit2cloud.svg'
import logoGensparkSvg from './logo/genspark.svg'
import logoGoodlinkerSvg from './logo/goodlinker.svg'
import logoHalloWeltPng from './logo/hallo-welt.png'
import logoHebeiGodePng from './logo/hebei-gode.png'
import logoHengchangJpg from './logo/hengchang.jpg'
import logoIflytekSvg from './logo/iflytek.svg'
import logoIntsigSvg from './logo/intsig.svg'
import logoJnpfPng from './logo/jnpf.png'
import logoKanyunSvg from './logo/kanyun.svg'
import logoKodixPng from './logo/kodix.png'
import logoKrosSvg from './logo/kros.svg'
import logoKunlunTechSvg from './logo/kunlun-tech.svg'
import logoLearnystPng from './logo/learnyst.png'
import logoLetsMagicWebp from './logo/lets-magic.webp'
import logoMccJpg from './logo/mcc.jpg'
import logoMininglampSvg from './logo/mininglamp.svg'
import logoMistralAiPng from './logo/mistral-ai.png'
import logoModelbestSvg from './logo/modelbest.svg'
import logoModernWidyaTehnicalJpg from './logo/modern-widya-tehnical.jpg'
import logoMongosoSvg from './logo/mongoso.svg'
import logoNotegptWebp from './logo/notegpt.webp'
import logoNovartisSvg from './logo/novartis.svg'
import logoNstcPng from './logo/nstc.png'
import logoNtelioWebp from './logo/ntelio.webp'
import logoNutstoreSvg from './logo/nutstore.svg'
import logoNuwaxPng from './logo/nuwax.png'
import logoOlimpPng from './logo/olimp.png'
import logoPingAnBankSvg from './logo/ping-an-bank.svg'
import logoQiaoyinPng from './logo/qiaoyin.png'
import logoRedUnisolJpg from './logo/red-unisol.jpg'
import logoRedikruSvg from './logo/redikru.svg'
import logoRedrobPng from './logo/redrob.png'
import logoSamsungSvg from './logo/samsung.svg'
import logoSeSurveyPng from './logo/se-survey.png'
import logoSeegerWeissSvg from './logo/seeger-weiss.svg'
import logoShopeeSvg from './logo/shopee.svg'
import logoStarridesPng from './logo/starrides.png'
import logoSudoprivacyPng from './logo/sudoprivacy.png'
import logoTopsnapHexieJpg from './logo/topsnap-hexie.jpg'
import logoTuhuPng from './logo/tuhu.png'
import logoVanchipPng from './logo/vanchip.png'
import logoVifmPng from './logo/vifm.png'
import logoWeaverPng from './logo/weaver.png'
import logoXpertAiPng from './logo/xpert-ai.png'
import logoYoudaoSvg from './logo/youdao.svg'
import logoZhipuAiSvg from './logo/zhipu-ai.svg'

// Synced from dream-num/univer.ai: src/data/customers.ts and src/assets/customers.
// Preserve the website's order, visual scale, background treatment, and icon/name lockups.
interface ICustomer {
  img: StaticImageData
  en: string
  zh?: string
  surface?: 'transparent' | 'light' | 'dark'
  lockup?: boolean
  hasChinese?: boolean
  s?: number
}

const rowA: ICustomer[] = [
  // Lead with widely recognized international brands.
  { img: logoSamsungSvg, en: 'Samsung', zh: '三星', s: 0.85 },
  { img: logoNovartisSvg, en: 'Novartis', zh: '诺华' },
  { img: logoShopeeSvg, en: 'Shopee' },
  { img: logoClickupSvg, en: 'ClickUp' },
  { img: logoMistralAiPng, en: 'Mistral AI', s: 0.85 },
  { img: logoGensparkSvg, en: 'Genspark', surface: 'dark', lockup: true },
  { img: logoZhipuAiSvg, en: 'Z.AI', zh: '智谱 AI', s: 0.8 },
  { img: logo01aiSvg, en: '01.AI', zh: '零一万物' },
  { img: logoBilibiliSvg, en: 'bilibili', zh: '哔哩哔哩', s: 0.8 },
  { img: logoChinaTelecomSvg, en: 'China Telecom', zh: '中国电信', hasChinese: true },
  { img: logoPingAnBankSvg, en: 'Ping An Bank', zh: '平安银行' },
  { img: logoIflytekSvg, en: 'iFLYTEK', zh: '科大讯飞' },
  { img: logoKunlunTechSvg, en: 'Kunlun Tech', zh: '昆仑万维' },
  { img: logoModelbestSvg, en: 'ModelBest', zh: '面壁智能' },
  { img: logoIntsigSvg, en: 'INTSIG', zh: '合合信息' },
  { img: logoYoudaoSvg, en: 'NetEase Youdao', zh: '网易有道' },
  { img: logoBeemSvg, en: 'Beem' },
  { img: logoDocyrusSvg, en: 'Docyrus', s: 1.1 },
  { img: logoNotegptWebp, en: 'NoteGPT', s: 1.3 },
  { img: logoKodixPng, en: 'KodiX', surface: 'dark', s: 0.8 },
  { img: logoOlimpPng, en: 'Olimp', s: 1.1 },
  { img: logoRedrobPng, en: 'Redrob', s: 0.75 },
  { img: logoVifmPng, en: 'VIFM', s: 0.85 },
  { img: logo4399Png, en: '4399', s: 0.3 },
  { img: logoMccJpg, en: 'MCC', zh: '中冶 MCC', surface: 'light', s: 1.4 },
  { img: logoWeaverPng, en: 'Weaver', zh: '泛微', s: 1.15 },
  { img: logoTuhuPng, en: 'Tuhu', zh: '途虎养车', surface: 'light', s: 0.8, hasChinese: true },
  { img: logoNutstoreSvg, en: 'Nutstore', zh: '坚果云', s: 1.25 },
  { img: logoMininglampSvg, en: 'Mininglamp', zh: '明略科技', s: 1.3 },
  { img: logoChempartnerSvg, en: 'ChemPartner', s: 1.2 },
  { img: logoFarbenSvg, en: 'Farben', zh: '法本信息', s: 0.7 },
  { img: logoVanchipPng, en: 'Vanchip', zh: '唯捷创芯' },
]

const rowB: ICustomer[] = [
  { img: logoQiaoyinPng, en: 'Qiaoyin', zh: '侨银股份', s: 0.9, hasChinese: true },
  { img: logoHebeiGodePng, en: 'Hebei Gode', zh: '河北戈德防伪科技', s: 1.25, hasChinese: true },
  { img: logoMongosoSvg, en: 'Mongoso', zh: '深圳芒果松科技', s: 0.55 },
  { img: logoTopsnapHexieJpg, en: 'Topsnap Hexie', zh: '合携', surface: 'light', s: 1.2, hasChinese: true },
  { img: logoAllGreenRecyclingPng, en: 'All Green Recycling', surface: 'light', s: 1.1 },
  { img: logoSudoprivacyPng, en: 'Sudoprivacy', zh: '数牍科技', s: 1.3, hasChinese: true },
  { img: logoKanyunSvg, en: 'Kanyun', zh: '看云控股', s: 0.95, hasChinese: true },
  { img: logoCingtaSvg, en: 'Cingta', zh: '青塔', s: 0.85, hasChinese: true },
  { img: logoKrosSvg, en: 'KROS' },
  { img: logoHengchangJpg, en: 'Hengchang', zh: '衡昌烧坊', surface: 'light', lockup: true, hasChinese: true },
  { img: logoBrightwaveSvg, en: 'Brightwave', lockup: true },
  { img: logoEnergentAiPng, en: 'Energent.ai', lockup: true },
  { img: logoLearnystPng, en: 'Learnyst', s: 1.1 },
  { img: logoNtelioWebp, en: 'Ntelio', s: 0.75 },
  { img: logoRedUnisolJpg, en: 'Red Unisol', surface: 'light', lockup: true },
  { img: logoSeSurveyPng, en: 'SE Survey', s: 1.1 },
  { img: logoNstcPng, en: 'NSTC', zh: '九恒星', s: 1.15, hasChinese: true },
  { img: logoGoodlinkerSvg, en: 'GoodLinker' },
  { img: logoStarridesPng, en: 'StarRides', zh: '耀出行' },
  { img: logoAsgLogisticsPng, en: 'ASG Logistics' },
  { img: logoCloudoffisSvg, en: 'Cloudoffis' },
  { img: logoHalloWeltPng, en: 'Hallo Welt!' },
  { img: logoModernWidyaTehnicalJpg, en: 'Modern Widya', surface: 'light', lockup: true },
  { img: logoNuwaxPng, en: 'Nuwax', surface: 'dark', lockup: true },
  { img: logoRedikruSvg, en: 'Redikru' },
  { img: logoSeegerWeissSvg, en: 'Seeger Weiss' },
  { img: logoXpertAiPng, en: 'XpertAI', lockup: true },
  { img: logoJnpfPng, en: 'JNPF', s: 1.15 },
  { img: logoAcctonPng, en: 'Accton', s: 0.7 },
  { img: logoLetsMagicWebp, en: 'Super Magic', zh: '超级麦吉', surface: 'light', s: 1.1 },
  { img: logoFit2cloudSvg, en: 'FIT2CLOUD', zh: '飞致云', hasChinese: true },
]

const customers = [...rowA, ...rowB]

// Stable groups keep the original order within each language group.
export const customerList = [...customers.filter((c) => !c.hasChinese), ...customers.filter((c) => c.hasChinese)]

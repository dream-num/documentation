'use client'

import { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { clsx } from '@/lib/clsx'

const SPECS = {
  '2c4g': {
    nodeQps: 360,
    universerQps: 400,
    broadcastPerCore: 3500,
    cores: 2,
    label: '2c4g',
  },
  '4c8g': {
    nodeQps: 400,
    universerQps: 730,
    broadcastPerCore: 3500,
    cores: 4,
    label: '4c8g',
  },
}

type SpecKey = keyof typeof SPECS
type Locale = 'zh-CN' | 'zh-TW' | 'en' | 'ja-JP'

const T: Record<Locale, {
  title: string
  subtitle: string
  docCount: string
  saveInterval: string
  saveIntervalSuffix: string
  multiDocRatio: string
  avgCollaborators: string
  collaboratorsSuffix: string
  redundancy: string
  redundancySuffix: string
  spec: string
  spec2c4g: string
  spec4c8g: string
  editQps: string
  broadcastQps: string
  activeUsers: string
  recommended: string
  nodeServer: string
  nodeServerDesc: (qps: number) => string
  universer: string
  universerDesc: (qps: number, bps: number) => string
  postgresql: string
  postgresqlDescBaseline: string
  postgresqlDescUpgrade: string
  notes: string
  noteEditQps: string
  noteBroadcastQps: string
  noteNode: (spec: string, qps: number) => string
  noteUniverser: (spec: string, qps: number, bps: number) => string
  noteFinal: string
}> = {
  'zh-CN': {
    title: '容量需求计算器',
    subtitle: '输入你的业务参数，获取推荐的 Univer Pro 资源配置',
    docCount: '最大同时在线编辑文档数',
    saveInterval: '平均保存间隔',
    saveIntervalSuffix: '秒',
    multiDocRatio: '多人文档比例',
    avgCollaborators: '每文档平均协同人数',
    collaboratorsSuffix: '人',
    redundancy: '冗余倍数',
    redundancySuffix: '倍',
    spec: '服务规格',
    spec2c4g: '2c4g（常规规模）',
    spec4c8g: '4c8g（较大规模）',
    editQps: '编辑保存 QPS',
    broadcastQps: '协同广播 QPS',
    activeUsers: '活跃用户数',
    recommended: '推荐资源配置（含冗余）',
    nodeServer: 'Node server (collaboration-server)',
    nodeServerDesc: qps => `按 ${qps} QPS/实例计算`,
    universer: 'Universer',
    universerDesc: (qps, bps) => `编辑 ${qps} QPS/实例，广播 ${bps}/实例`,
    postgresql: 'PostgreSQL',
    postgresqlDescBaseline: '编辑 QPS ≤ 1000 基准配置',
    postgresqlDescUpgrade: '编辑 QPS > 1000 建议升级',
    notes: '计算说明',
    noteEditQps: '编辑保存 QPS = 文档数 ÷ 保存间隔',
    noteBroadcastQps: '协同广播 QPS = 编辑保存 QPS × (活跃用户数/文档数 − 1)',
    noteNode: (spec, qps) => `单实例 collaboration-server ${spec} 约支撑 ${qps} 编辑 QPS`,
    noteUniverser: (spec, qps, bps) => `单实例 universer ${spec} 约支撑 ${qps} 编辑 QPS 或 ${bps} 广播 QPS`,
    noteFinal: '最终配置 = 基础实例数 × (1 + 冗余倍数)',
  },
  'zh-TW': {
    title: '容量需求計算器',
    subtitle: '輸入你的業務參數，取得推薦的 Univer Pro 資源配置',
    docCount: '最大同時線上編輯文件數',
    saveInterval: '平均儲存間隔',
    saveIntervalSuffix: '秒',
    multiDocRatio: '多人文件比例',
    avgCollaborators: '每文件平均協同人數',
    collaboratorsSuffix: '人',
    redundancy: '冗餘倍數',
    redundancySuffix: '倍',
    spec: '服務規格',
    spec2c4g: '2c4g（常規規模）',
    spec4c8g: '4c8g（較大規模）',
    editQps: '編輯儲存 QPS',
    broadcastQps: '協同廣播 QPS',
    activeUsers: '活躍使用者數',
    recommended: '推薦資源配置（含冗餘）',
    nodeServer: 'Node server (collaboration-server)',
    nodeServerDesc: qps => `按 ${qps} QPS/實例計算`,
    universer: 'Universer',
    universerDesc: (qps, bps) => `編輯 ${qps} QPS/實例，廣播 ${bps}/實例`,
    postgresql: 'PostgreSQL',
    postgresqlDescBaseline: '編輯 QPS ≤ 1000 基準配置',
    postgresqlDescUpgrade: '編輯 QPS > 1000 建議升級',
    notes: '計算說明',
    noteEditQps: '編輯儲存 QPS = 文件數 ÷ 儲存間隔',
    noteBroadcastQps: '協同廣播 QPS = 編輯儲存 QPS × (活躍使用者數/文件數 − 1)',
    noteNode: (spec, qps) => `單實例 collaboration-server ${spec} 約支撐 ${qps} 編輯 QPS`,
    noteUniverser: (spec, qps, bps) => `單實例 universer ${spec} 約支撐 ${qps} 編輯 QPS 或 ${bps} 廣播 QPS`,
    noteFinal: '最終配置 = 基礎實例數 × (1 + 冗餘倍數)',
  },
  en: {
    title: 'Capacity Calculator',
    subtitle: 'Enter your business parameters to get recommended Univer Pro resource configurations',
    docCount: 'Max concurrent editing documents',
    saveInterval: 'Average save interval',
    saveIntervalSuffix: 's',
    multiDocRatio: 'Multi-user document ratio',
    avgCollaborators: 'Avg. collaborators per document',
    collaboratorsSuffix: 'users',
    redundancy: 'Redundancy factor',
    redundancySuffix: 'x',
    spec: 'Instance spec',
    spec2c4g: '2c4g (standard)',
    spec4c8g: '4c8g (large scale)',
    editQps: 'Edit save QPS',
    broadcastQps: 'Collaboration broadcast QPS',
    activeUsers: 'Active users',
    recommended: 'Recommended resources (with redundancy)',
    nodeServer: 'Node server (collaboration-server)',
    nodeServerDesc: qps => `Based on ${qps} QPS/instance`,
    universer: 'Universer',
    universerDesc: (qps, bps) => `${qps} edit QPS/instance, ${bps} broadcast/instance`,
    postgresql: 'PostgreSQL',
    postgresqlDescBaseline: 'Baseline for edit QPS ≤ 1000',
    postgresqlDescUpgrade: 'Upgrade recommended when edit QPS > 1000',
    notes: 'Calculation notes',
    noteEditQps: 'Edit save QPS = documents ÷ save interval',
    noteBroadcastQps: 'Broadcast QPS = edit save QPS × (active users / documents − 1)',
    noteNode: (spec, qps) => `One collaboration-server ${spec} instance supports ~${qps} edit QPS`,
    noteUniverser: (spec, qps, bps) => `One universer ${spec} instance supports ~${qps} edit QPS or ${bps} broadcast QPS`,
    noteFinal: 'Final config = base instances × (1 + redundancy factor)',
  },
  'ja-JP': {
    title: '容量見積もりツール',
    subtitle: '業務パラメータを入力して、推奨される Univer Pro リソース構成を取得',
    docCount: '最大同時編集ドキュメント数',
    saveInterval: '平均保存間隔',
    saveIntervalSuffix: '秒',
    multiDocRatio: '多人ドキュメント比率',
    avgCollaborators: 'ドキュメントあたり平均協調人数',
    collaboratorsSuffix: '人',
    redundancy: '冗長性倍率',
    redundancySuffix: '倍',
    spec: 'サービス仕様',
    spec2c4g: '2c4g（通常規模）',
    spec4c8g: '4c8g（大規模）',
    editQps: '編集保存 QPS',
    broadcastQps: '協調ブロードキャスト QPS',
    activeUsers: 'アクティブユーザー数',
    recommended: '推奨リソース構成（冗長性込み）',
    nodeServer: 'Node server (collaboration-server)',
    nodeServerDesc: qps => `${qps} QPS/インスタンスで計算`,
    universer: 'Universer',
    universerDesc: (qps, bps) => `編集 ${qps} QPS/インスタンス、ブロードキャスト ${bps}/インスタンス`,
    postgresql: 'PostgreSQL',
    postgresqlDescBaseline: '編集 QPS ≤ 1000 のベースライン',
    postgresqlDescUpgrade: '編集 QPS > 1000 の場合はアップグレード推奨',
    notes: '計算式の説明',
    noteEditQps: '編集保存 QPS = ドキュメント数 ÷ 保存間隔',
    noteBroadcastQps: 'ブロードキャスト QPS = 編集保存 QPS × (アクティブユーザー数 / ドキュメント数 − 1)',
    noteNode: (spec, qps) => `collaboration-server ${spec} の単一インスタンスは約 ${qps} 編集 QPS を処理`,
    noteUniverser: (spec, qps, bps) => `universer ${spec} の単一インスタンスは約 ${qps} 編集 QPS または ${bps} ブロードキャスト QPS を処理`,
    noteFinal: '最終構成 = 基本インスタンス数 × (1 + 冗長性倍率)',
  },
}

function NumberInput({
  label,
  value,
  onChange,
  min = 0,
  step = 1,
  suffix,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  step?: number
  suffix?: string
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="relative">
        <Input
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="pr-8"
        />
        {suffix && (
          <span
            className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground"
          >
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}

function ResultCard({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={clsx('rounded-lg border bg-card p-4 shadow-sm', className)}>
      <div className="mb-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
        {title}
      </div>
      <div className="text-2xl font-semibold text-foreground">{children}</div>
    </div>
  )
}

function ConfigRow({
  label,
  value,
  desc,
}: {
  label: string
  value: string
  desc?: string
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-foreground">{label}</span>
      <div className="text-right">
        <div className="text-sm font-medium text-foreground">{value}</div>
        {desc && <div className="text-xs text-muted-foreground">{desc}</div>}
      </div>
    </div>
  )
}

export function CapacityCalculator({ locale = 'zh-CN' }: { locale?: Locale }) {
  const t = T[locale]

  const [docCount, setDocCount] = useState(2000)
  const [saveInterval, setSaveInterval] = useState(2)
  const [multiDocRatio, setMultiDocRatio] = useState(50)
  const [avgCollaborators, setAvgCollaborators] = useState(2)
  const [redundancy, setRedundancy] = useState(1)
  const [spec, setSpec] = useState<SpecKey>('2c4g')

  const {
    editQps,
    broadcastQps,
    activeUsers,
    nodeInstances,
    universerInstances,
    dbSpec,
  } = useMemo(() => {
    const editQps = docCount / saveInterval
    const activeUsers = docCount * (1 + (multiDocRatio / 100) * (avgCollaborators - 1))
    const broadcastQps = editQps * (activeUsers / docCount - 1)

    const s = SPECS[spec]
    const broadcastCapacity = s.cores * s.broadcastPerCore

    const baseNode = Math.ceil(editQps / s.nodeQps)
    const baseUniverserEdit = Math.ceil(editQps / s.universerQps)
    const baseUniverserBroadcast = Math.ceil(broadcastQps / broadcastCapacity)
    const baseUniverser = Math.max(baseUniverserEdit, baseUniverserBroadcast)

    const factor = 1 + redundancy
    const nodeInstances = Math.ceil(baseNode * factor)
    const universerInstances = Math.ceil(baseUniverser * factor)

    const dbSpec = editQps <= 1000 ? '2c4g × 1' : '4c8g'

    return {
      editQps,
      broadcastQps,
      activeUsers,
      nodeInstances,
      universerInstances,
      dbSpec,
    }
  }, [docCount, saveInterval, multiDocRatio, avgCollaborators, redundancy, spec])

  return (
    <div className="my-6 rounded-xl border bg-background shadow-sm">
      <div className="border-b bg-muted/50 px-4 py-3">
        <h3 className="text-base font-semibold text-foreground">{t.title}</h3>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      <div
        className="
          grid gap-6 p-4
          md:grid-cols-2 md:p-6
        "
      >
        {/* inputs */}
        <div className="space-y-5">
          <NumberInput
            label={t.docCount}
            value={docCount}
            onChange={setDocCount}
            min={1}
            step={100}
          />

          <NumberInput
            label={t.saveInterval}
            value={saveInterval}
            onChange={setSaveInterval}
            min={0.1}
            step={0.5}
            suffix={t.saveIntervalSuffix}
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">{t.multiDocRatio}</label>
              <span className="text-sm text-muted-foreground">
                {multiDocRatio}
                %
              </span>
            </div>
            <Slider
              value={[multiDocRatio]}
              onValueChange={([v]) => setMultiDocRatio(v)}
              min={0}
              max={100}
              step={5}
            />
          </div>

          <NumberInput
            label={t.avgCollaborators}
            value={avgCollaborators}
            onChange={setAvgCollaborators}
            min={1}
            step={1}
            suffix={t.collaboratorsSuffix}
          />

          <NumberInput
            label={t.redundancy}
            value={redundancy}
            onChange={setRedundancy}
            min={0}
            step={0.5}
            suffix={t.redundancySuffix}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t.spec}</label>
            <Select value={spec} onValueChange={(v: SpecKey) => setSpec(v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2c4g">{t.spec2c4g}</SelectItem>
                <SelectItem value="4c8g">{t.spec4c8g}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* results */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <ResultCard title={t.editQps}>
              {Math.round(editQps).toLocaleString()}
            </ResultCard>
            <ResultCard title={t.broadcastQps}>
              {Math.round(broadcastQps).toLocaleString()}
            </ResultCard>
            <ResultCard title={t.activeUsers} className="col-span-2">
              {Math.round(activeUsers).toLocaleString()}
            </ResultCard>
          </div>

          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="mb-3 text-sm font-semibold text-foreground">{t.recommended}</div>
            <div className="divide-y">
              <ConfigRow
                label={t.nodeServer}
                value={`${spec} × ${nodeInstances}`}
                desc={t.nodeServerDesc(SPECS[spec].nodeQps)}
              />
              <ConfigRow
                label={t.universer}
                value={`${spec} × ${universerInstances}`}
                desc={t.universerDesc(SPECS[spec].universerQps, SPECS[spec].cores * SPECS[spec].broadcastPerCore)}
              />
              <ConfigRow
                label={t.postgresql}
                value={dbSpec}
                desc={editQps <= 1000 ? t.postgresqlDescBaseline : t.postgresqlDescUpgrade}
              />
            </div>
          </div>

          <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
            <p className="mb-1 font-medium text-foreground">{t.notes}</p>
            <ul className="list-disc space-y-0.5 pl-4">
              <li>{t.noteEditQps}</li>
              <li>{t.noteBroadcastQps}</li>
              <li>{t.noteNode(spec, SPECS[spec].nodeQps)}</li>
              <li>{t.noteUniverser(spec, SPECS[spec].universerQps, SPECS[spec].cores * SPECS[spec].broadcastPerCore)}</li>
              <li>{t.noteFinal}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

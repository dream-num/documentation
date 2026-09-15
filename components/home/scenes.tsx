'use client'

import type { ReactNode } from 'react'
import {
  DatabaseIcon,
  FilePenLineIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  PresentationIcon,
  ShapesIcon,
} from 'lucide-react'

import { BlurFade } from '@/components/magicui/blur-fade'

interface ISceneItem {
  icon: ReactNode
  title: string
  desc: string
  colorClass: string
  visual: ReactNode
}

interface IProps {
  title: string
  subtitle: string
  sheetsTitle: string
  sheetsDesc: string
  docsTitle: string
  docsDesc: string
  slidesTitle: string
  slidesDesc: string
  basesTitle: string
  basesDesc: string
  boardsTitle: string
  boardsDesc: string
  pdfTitle: string
  pdfDesc: string
}

export function Scenes(props: IProps) {
  const {
    title,
    subtitle,
    sheetsTitle,
    sheetsDesc,
    docsTitle,
    docsDesc,
    slidesTitle,
    slidesDesc,
    basesTitle,
    basesDesc,
    boardsTitle,
    boardsDesc,
    pdfTitle,
    pdfDesc,
  } = props

  const items: ISceneItem[] = [
    {
      icon: <FileSpreadsheetIcon className="size-5 text-emerald-600 dark:text-emerald-400" />,
      title: sheetsTitle,
      desc: sheetsDesc,
      colorClass: 'text-[#428b70]',
      visual: (
        <>
          <rect x="24" y="46" width="232" height="17" rx="3" className="fill-(--scene-wash)" />
          <rect x="24" y="68" width="18" height="84" className="fill-(--scene-wash)" />
          <path
            d="M24 68H256M24 89H256M24 110H256M24 131H256M24 152H256M42 68V152M96 68V152M150 68V152M204 68V152M256 68V152"
            className="fill-none stroke-(--scene-line) stroke-1"
          />
          <rect x="96" y="89" width="108" height="42" className="fill-current/10" />
          <rect x="96" y="89" width="108" height="42" className="fill-none stroke-current stroke-[1.5]" />
          <rect x="201" y="128" width="6" height="6" fill="currentColor" />
          <path
            d="M52 79H78M106 79H131M161 79H186M52 100H71M52 120H82M52 141H75M161 141H186M214 79H240M214 100H231M214 120H241"
            className="fill-none stroke-(--scene-muted) stroke-2 [stroke-linecap:round]"
          />
          <rect x="35" y="52" width="52" height="4" rx="2" className="fill-(--scene-muted) opacity-60" />
          <rect x="106" y="98" width="30" height="4" rx="2" className="fill-current/55" />
          <rect x="160" y="119" width="25" height="4" rx="2" className="fill-current/55" />
        </>
      ),
    },
    {
      icon: <FileTextIcon className="size-5 text-blue-600 dark:text-blue-400" />,
      title: docsTitle,
      desc: docsDesc,
      colorClass: 'text-[#648ec9]',
      visual: (
        <>
          <rect x="24" y="44" width="232" height="112" rx="4" className="fill-(--scene-wash)" />
          <rect x="77" y="48" width="126" height="111" rx="3" className="fill-(--scene-paper) stroke-(--scene-line)" />
          <rect x="92" y="62" width="71" height="6" rx="2" className="fill-current/55" />
          <path
            d="M92 80H186M92 88H181M92 96H168M92 117H186M92 125H178M92 133H186M92 141H154"
            className="fill-none stroke-(--scene-muted) stroke-2 [stroke-linecap:round]"
          />
          <rect x="90" y="84" width="96" height="9" className="fill-current/10" />
          <path d="M185 83V95" className="fill-none stroke-current stroke-[1.5]" />
          <rect x="194" y="88" width="40" height="28" rx="5" className="fill-(--scene-paper) stroke-(--scene-line)" />
          <path
            d="M201 97H225M201 104H219"
            className="fill-none stroke-(--scene-muted) stroke-2 [stroke-linecap:round]"
          />
          <circle cx="221" cy="57" r="9" className="fill-current/10" />
          <path d="M217 57L220 60L225 54" className="fill-none stroke-current stroke-[1.5]" />
        </>
      ),
    },
    {
      icon: <PresentationIcon className="size-5 text-red-600 dark:text-red-400" />,
      title: slidesTitle,
      desc: slidesDesc,
      colorClass: 'text-[#c97e70]',
      visual: (
        <>
          <rect x="22" y="44" width="45" height="114" rx="3" className="fill-(--scene-wash)" />
          <rect x="28" y="51" width="33" height="23" rx="2" className="fill-(--scene-paper) stroke-(--scene-line)" />
          <rect x="28" y="51" width="33" height="23" rx="2" className="fill-none stroke-current stroke-[1.5]" />
          <rect x="28" y="83" width="33" height="23" rx="2" className="fill-(--scene-paper) stroke-(--scene-line)" />
          <rect x="28" y="115" width="33" height="23" rx="2" className="fill-(--scene-paper) stroke-(--scene-line)" />
          <rect x="78" y="50" width="176" height="99" rx="3" className="fill-(--scene-paper) stroke-(--scene-line)" />
          <rect x="90" y="64" width="70" height="6" rx="2" className="fill-current/55" />
          <path
            d="M90 83H152M90 91H141M90 99H146"
            className="fill-none stroke-(--scene-muted) stroke-2 [stroke-linecap:round]"
          />
          <rect x="176" y="103" width="15" height="27" rx="2" className="fill-current/10" />
          <rect x="197" y="89" width="15" height="41" rx="2" className="fill-current/55" />
          <rect x="218" y="73" width="15" height="57" rx="2" fill="currentColor" />
          <path d="M83 157H170" className="fill-none stroke-(--scene-line) stroke-1" />
          <circle cx="246" cy="157" r="2" className="fill-current/55" />
        </>
      ),
    },
    {
      icon: <DatabaseIcon className="size-5 text-teal-600 dark:text-teal-400" />,
      title: basesTitle,
      desc: basesDesc,
      colorClass: 'text-[#569b96]',
      visual: (
        <>
          <rect x="24" y="47" width="55" height="13" rx="6" className="fill-current/10" />
          <path
            d="M35 53H66M91 53H125M143 53H174"
            className="fill-none stroke-(--scene-muted) stroke-2 [stroke-linecap:round]"
          />
          <rect x="24" y="70" width="232" height="18" className="fill-(--scene-wash)" />
          <path
            d="M24 70H256M24 88H256M24 112H256M24 136H256M24 158H256M48 70V158M140 70V158M205 70V158"
            className="fill-none stroke-(--scene-line) stroke-1"
          />
          <path
            d="M58 78H112M151 78H186M217 78H244M58 100H121M58 124H108M58 148H128"
            className="fill-none stroke-(--scene-muted) stroke-2 [stroke-linecap:round]"
          />
          <rect x="151" y="96" width="38" height="10" rx="5" className="fill-current/55" />
          <rect x="151" y="120" width="29" height="10" rx="5" className="fill-current/10" />
          <rect x="151" y="144" width="38" height="10" rx="5" className="fill-current/55" />
          <circle cx="35" cy="101" r="4" className="fill-(--scene-muted) opacity-60" />
          <circle cx="35" cy="125" r="4" className="fill-(--scene-muted) opacity-60" />
          <circle cx="35" cy="149" r="4" className="fill-(--scene-muted) opacity-60" />
          <path
            d="M216 101H244M216 125H236M216 149H241"
            className="fill-none stroke-(--scene-muted) stroke-2 [stroke-linecap:round]"
          />
        </>
      ),
    },
    {
      icon: <ShapesIcon className="size-5 text-violet-600 dark:text-violet-400" />,
      title: boardsTitle,
      desc: boardsDesc,
      colorClass: 'text-[#9782bd]',
      visual: (
        <>
          <path
            d="M38 55H242M38 86H242M38 117H242M38 148H242M57 44V157M98 44V157M139 44V157M180 44V157M221 44V157"
            className="fill-none stroke-(--scene-line) stroke-1"
            strokeDasharray="1 7"
          />
          <path d="M97 81H126Q136 81 136 91V116H158M197 99V73H224" className="fill-none stroke-current stroke-[1.5]" />
          <rect x="44" y="58" width="53" height="46" rx="4" className="fill-(--scene-paper) stroke-(--scene-line)" />
          <rect x="44" y="58" width="53" height="46" rx="4" className="fill-current/10" />
          <path
            d="M55 72H83M55 80H75M55 88H79"
            className="fill-none stroke-(--scene-muted) stroke-2 [stroke-linecap:round]"
          />
          <rect x="158" y="95" width="70" height="44" rx="5" className="fill-(--scene-paper) stroke-(--scene-line)" />
          <path
            d="M172 111H212M172 121H199"
            className="fill-none stroke-(--scene-muted) stroke-2 [stroke-linecap:round]"
          />
          <rect x="152" y="89" width="82" height="56" rx="1" className="fill-none stroke-current stroke-[1.5]" />
          <rect x="149" y="86" width="6" height="6" fill="currentColor" />
          <rect x="231" y="142" width="6" height="6" fill="currentColor" />
          <circle cx="226" cy="62" r="16" className="fill-current/10" />
          <rect
            x="45"
            y="123"
            width="24"
            height="24"
            rx="3"
            className="fill-current/55"
            transform="rotate(-8 57 135)"
          />
        </>
      ),
    },
    {
      icon: <FilePenLineIcon className="size-5 text-rose-600 dark:text-rose-400" />,
      title: pdfTitle,
      desc: pdfDesc,
      colorClass: 'text-[#c77b89]',
      visual: (
        <>
          <rect x="24" y="44" width="232" height="114" rx="4" className="fill-(--scene-wash)" />
          <rect x="35" y="53" width="29" height="37" rx="2" className="fill-(--scene-paper) stroke-(--scene-line)" />
          <rect x="35" y="53" width="29" height="37" rx="2" className="fill-none stroke-current stroke-[1.5]" />
          <rect x="35" y="101" width="29" height="37" rx="2" className="fill-(--scene-paper) stroke-(--scene-line)" />
          <rect x="102" y="51" width="105" height="107" rx="3" className="fill-(--scene-paper) stroke-(--scene-line)" />
          <path
            d="M117 66H169M117 81H191M117 91H181M117 101H191M117 127H182M117 137H174"
            className="fill-none stroke-(--scene-muted) stroke-2 [stroke-linecap:round]"
          />
          <rect x="114" y="85" width="70" height="10" className="fill-current/10" />
          <rect x="114" y="119" width="79" height="25" rx="3" className="fill-none stroke-current stroke-[1.5]" />
          <path d="M180 112L206 86L214 94L188 120L177 123Z" className="fill-(--scene-paper) stroke-(--scene-line)" />
          <path d="M180 112L188 120M205 87L213 95" className="fill-none stroke-current stroke-[1.5]" />
          <circle cx="222" cy="69" r="12" className="fill-current/55" />
          <path d="M218 66H226M218 71H223" stroke="var(--scene-paper)" strokeWidth="1.5" />
        </>
      ),
    },
  ]

  return (
    <BlurFade inView>
      <section className="container px-4">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">{title}</h2>
          <p className="text-neutral-600 dark:text-neutral-400">{subtitle}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <BlurFade key={item.title} inView delay={index * 0.05} className="h-full">
              <article className="flex h-full flex-col rounded-2xl border border-neutral-200/80 bg-white/70 p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/70">
                <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  {item.icon}
                  {item.title}
                </h3>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 280 180"
                  fill="none"
                  className={`my-2.5 h-45 w-full [--scene-line:#dfe2e7] [--scene-muted:#b9bec7] [--scene-paper:#fff] [--scene-wash:#f5f6f8] dark:[--scene-line:#3e414c] dark:[--scene-muted:#737987] dark:[--scene-paper:#202127] dark:[--scene-wash:#292b33] ${item.colorClass}`}
                >
                  <rect
                    x="12"
                    y="12"
                    width="256"
                    height="156"
                    rx="8"
                    className="fill-(--scene-paper) stroke-(--scene-line)"
                  />
                  <path d="M12 35H268" className="fill-none stroke-(--scene-line) stroke-1" />
                  <circle cx="25" cy="24" r="2" className="fill-(--scene-muted) opacity-60" />
                  <circle cx="33" cy="24" r="2" className="fill-(--scene-muted) opacity-60" />
                  <circle cx="41" cy="24" r="2" className="fill-(--scene-muted) opacity-60" />
                  <rect x="220" y="22" width="33" height="4" rx="2" className="fill-(--scene-muted) opacity-60" />
                  {item.visual}
                </svg>
                <p className="text-sm/relaxed text-neutral-600 dark:text-neutral-400">{item.desc}</p>
              </article>
            </BlurFade>
          ))}
        </div>
      </section>
    </BlurFade>
  )
}

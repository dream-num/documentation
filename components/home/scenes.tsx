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
          <rect x="24" y="68" width="24" height="88" className="fill-(--scene-wash)" />
          <path
            d="M24 68H256V156H24ZM24 90H256M24 112H256M24 134H256M48 68V156M100 68V156M152 68V156M204 68V156"
            className="fill-none stroke-(--scene-line) stroke-1"
          />
          <path
            d="M58 79H84M110 79H135M162 79H187M58 101H77M58 123H88M58 145H81M162 145H187M214 79H240M214 101H231M214 123H241"
            className="fill-none stroke-(--scene-muted) stroke-2 [stroke-linecap:round]"
          />
          <rect x="35" y="52.5" width="52" height="4" rx="2" className="fill-(--scene-muted) opacity-60" />
          <rect x="110" y="99" width="30" height="4" rx="2" className="fill-current/55" />
          <rect
            x="162"
            y="121"
            width="25"
            height="4"
            rx="2"
            data-motion="cell-value"
            className="motion-safe:group-hover/scene:animate-scene-reveal origin-left fill-current/55 [--scene-delay:180ms] [--scene-from:scaleX(0.6)]"
          />
          <g data-motion="selection" className="motion-safe:group-hover/scene:translate-x-13">
            <rect x="100" y="90" width="104" height="44" className="fill-current/10 stroke-current stroke-[1.5]" />
            <rect x="201" y="131" width="6" height="6" fill="currentColor" />
          </g>
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
          <rect x="24" y="46" width="232" height="110" rx="4" className="fill-(--scene-wash)" />
          <rect x="78" y="50" width="124" height="102" rx="3" className="fill-(--scene-paper) stroke-(--scene-line)" />
          <rect x="92" y="62" width="71" height="6" rx="2" className="fill-current/55" />
          <rect
            x="90"
            y="84"
            width="96"
            height="9"
            data-motion="highlight"
            className="motion-safe:group-hover/scene:animate-scene-reveal origin-left fill-current/15 [--scene-from:scaleX(0.25)]"
          />
          <path
            d="M92 80H186M92 88H181M92 96H168M92 117H186M92 125H178M92 133H186M92 141H154"
            className="fill-none stroke-(--scene-muted) stroke-2 [stroke-linecap:round]"
          />
          <path
            d="M186 83V94"
            data-motion="caret"
            className="motion-safe:group-hover/scene:animate-scene-reveal fill-none stroke-current stroke-[1.5] [--scene-from:translateX(-72px)]"
          />
          <g
            data-motion="comment"
            className="motion-safe:group-hover/scene:-translate-y-1 motion-safe:group-hover/scene:delay-150"
          >
            <rect x="194" y="92" width="40" height="28" rx="4" className="fill-(--scene-paper) stroke-(--scene-line)" />
            <path
              d="M202 102H226M202 110H220"
              data-motion="comment-text"
              className="motion-safe:group-hover/scene:animate-scene-reveal origin-left fill-none stroke-(--scene-muted) stroke-2 [--scene-delay:200ms] [--scene-from:scaleX(0.65)] [stroke-linecap:round]"
            />
          </g>
          <circle cx="221" cy="57" r="9" className="fill-current/10" />
          <path
            d="M217 57L220 60L225 54"
            pathLength="1"
            className="motion-safe:group-hover/scene:animate-scene-draw fill-none stroke-current stroke-[1.5] [--scene-delay:350ms] [stroke-dasharray:1]"
          />
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
          <rect x="24" y="46" width="44" height="110" rx="3" className="fill-(--scene-wash)" />
          <rect
            x="30"
            y="52"
            width="32"
            height="22"
            rx="2"
            className="fill-(--scene-paper) stroke-current stroke-[1.5]"
          />
          <rect x="30" y="84" width="32" height="22" rx="2" className="fill-(--scene-paper) stroke-(--scene-line)" />
          <rect x="30" y="116" width="32" height="22" rx="2" className="fill-(--scene-paper) stroke-(--scene-line)" />
          <rect x="78" y="50" width="176" height="99" rx="3" className="fill-(--scene-paper) stroke-(--scene-line)" />
          <rect x="90" y="64" width="70" height="6" rx="2" className="fill-current/55" />
          <path
            d="M90 83H152M90 91H141M90 99H146"
            className="fill-none stroke-(--scene-muted) stroke-2 [stroke-linecap:round]"
          />
          <rect
            x="176"
            y="103"
            width="15"
            height="27"
            rx="2"
            data-motion="bar"
            className="motion-safe:group-hover/scene:animate-scene-reveal origin-bottom fill-current/25 [--scene-from:scaleY(0.55)]"
          />
          <rect
            x="197"
            y="89"
            width="15"
            height="41"
            rx="2"
            data-motion="bar"
            className="motion-safe:group-hover/scene:animate-scene-reveal origin-bottom fill-current/55 [--scene-delay:70ms] [--scene-from:scaleY(0.55)]"
          />
          <rect
            x="218"
            y="73"
            width="15"
            height="57"
            rx="2"
            data-motion="bar"
            className="motion-safe:group-hover/scene:animate-scene-reveal origin-bottom fill-current [--scene-delay:140ms] [--scene-from:scaleY(0.55)]"
          />
          <path d="M90 156H176" className="fill-none stroke-(--scene-line) stroke-1" />
          <circle cx="246" cy="156" r="2" className="fill-current/55" />
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
          <rect x="24" y="46" width="56" height="14" rx="7" className="fill-current/10" />
          <path
            d="M35 53H66M91 53H125M143 53H174"
            className="fill-none stroke-(--scene-muted) stroke-2 [stroke-linecap:round]"
          />
          <rect x="24" y="68" width="232" height="16" className="fill-(--scene-wash)" />
          <rect
            x="24"
            y="84"
            width="232"
            height="24"
            data-motion="record"
            className="fill-current/10 opacity-40 motion-safe:group-hover/scene:translate-y-6 motion-safe:group-hover/scene:opacity-100"
          />
          <path
            d="M24 68H256V156H24ZM24 84H256M24 108H256M24 132H256M48 68V156M140 68V156M204 68V156"
            className="fill-none stroke-(--scene-line) stroke-1"
          />
          <path
            d="M58 76H112M150 76H186M216 76H244M58 96H121M58 120H108M58 144H128"
            className="fill-none stroke-(--scene-muted) stroke-2 [stroke-linecap:round]"
          />
          <rect x="150" y="91" width="38" height="10" rx="5" className="fill-current/55" />
          <rect
            x="150"
            y="115"
            width="29"
            height="10"
            rx="5"
            data-motion="status"
            className="origin-left fill-current/55 motion-safe:group-hover/scene:scale-x-130"
          />
          <rect x="150" y="139" width="38" height="10" rx="5" className="fill-current/55" />
          <circle cx="36" cy="96" r="4" className="fill-(--scene-muted) opacity-60" />
          <circle cx="36" cy="120" r="4" className="fill-(--scene-muted) opacity-60" />
          <circle cx="36" cy="144" r="4" className="fill-(--scene-muted) opacity-60" />
          <g
            data-motion="record-check"
            className="origin-center opacity-0 motion-safe:scale-90 motion-safe:group-hover/scene:scale-100 motion-safe:group-hover/scene:opacity-100 motion-safe:group-hover/scene:delay-150"
          >
            <circle cx="36" cy="120" r="5" fill="currentColor" />
            <path d="M33.5 120L35.5 122L39 118" className="stroke-(--scene-paper) stroke-[1.5]" />
          </g>
          <path
            d="M216 96H244M216 120H236M216 144H241"
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
            d="M32 54H248M32 70H248M32 86H248M32 102H248M32 118H248M32 134H248M32 150H248"
            className="fill-none stroke-(--scene-line) stroke-1"
            strokeDasharray="1 15"
          />
          <circle
            cx="226"
            cy="62"
            r="14"
            data-motion="node"
            className="motion-safe:group-hover/scene:animate-scene-reveal origin-center fill-current/10 [--scene-delay:260ms] [--scene-from:scale(0.85)]"
          />
          <path
            d="M97 81H124Q134 81 134 91V107Q134 117 144 117H158M193 95V86Q193 78 201 78H218Q226 78 226 70V62"
            className="fill-none stroke-current/25 stroke-[1.5]"
          />
          <path
            d="M97 81H124Q134 81 134 91V107Q134 117 144 117H158M193 95V86Q193 78 201 78H218Q226 78 226 70V62"
            pathLength="1"
            data-motion="connection"
            className="motion-safe:group-hover/scene:animate-scene-draw fill-none stroke-current stroke-[1.5] [stroke-dasharray:1]"
          />
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
          <g
            data-motion="bounds"
            className="motion-safe:group-hover/scene:animate-scene-reveal origin-center opacity-55 [--scene-delay:200ms] [--scene-from:scale(0.97)] motion-safe:group-hover/scene:opacity-100"
          >
            <rect x="152" y="89" width="82" height="56" rx="1" className="fill-none stroke-current stroke-[1.5]" />
            <rect x="149" y="86" width="6" height="6" fill="currentColor" />
            <rect x="231" y="142" width="6" height="6" fill="currentColor" />
          </g>
          <g transform="rotate(-8 57 135)">
            <rect
              x="45"
              y="123"
              width="24"
              height="24"
              rx="3"
              data-motion="note"
              className="origin-center fill-current/55 motion-safe:group-hover/scene:-translate-y-1 motion-safe:group-hover/scene:rotate-8 motion-safe:group-hover/scene:delay-100"
            />
          </g>
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
          <rect x="24" y="46" width="232" height="110" rx="4" className="fill-(--scene-wash)" />
          <rect
            x="35"
            y="54"
            width="28"
            height="36"
            rx="2"
            className="fill-(--scene-paper) stroke-current stroke-[1.5]"
          />
          <rect x="35" y="102" width="28" height="36" rx="2" className="fill-(--scene-paper) stroke-(--scene-line)" />
          <rect x="102" y="50" width="106" height="102" rx="3" className="fill-(--scene-paper) stroke-(--scene-line)" />
          <rect x="114" y="85" width="70" height="10" className="fill-current/10" />
          <path
            d="M117 66H169M117 81H191M117 91H181M117 101H191M117 127H182M117 137H174"
            className="fill-none stroke-(--scene-muted) stroke-2 [stroke-linecap:round]"
          />
          <rect
            x="114"
            y="119"
            width="82"
            height="25"
            rx="3"
            data-motion="annotation"
            className="fill-current/10 stroke-current stroke-[1.5] opacity-65 motion-safe:group-hover/scene:opacity-100"
          />
          <path
            d="M172 119H193"
            data-motion="ink"
            className="motion-safe:group-hover/scene:animate-scene-reveal origin-left stroke-current stroke-[1.5] opacity-0 [--scene-delay:300ms] [--scene-from:scaleX(0)] motion-safe:group-hover/scene:opacity-70"
          />
          <g data-motion="pen" className="motion-safe:group-hover/scene:animate-scene-pen">
            <path d="M199 110L221 88L229 96L207 118L196 121Z" className="fill-(--scene-paper) stroke-(--scene-line)" />
            <path d="M199 110L207 118M219 90L227 98" className="fill-none stroke-current stroke-[1.5]" />
          </g>
          <circle cx="222" cy="69" r="12" className="fill-current/55" />
          <path
            d="M218 66H226M218 71H223"
            data-motion="annotation-text"
            className="motion-safe:group-hover/scene:animate-scene-reveal origin-left stroke-(--scene-paper) stroke-[1.5] [--scene-delay:400ms] [--scene-from:scaleX(0.5)]"
          />
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
              <article className="group/scene flex h-full flex-col rounded-2xl border border-neutral-200/80 bg-white/70 p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/70">
                <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  {item.icon}
                  {item.title}
                </h3>
                <svg
                  aria-hidden="true"
                  focusable="false"
                  viewBox="0 0 280 180"
                  fill="none"
                  className={`my-2.5 h-45 w-full [--scene-line:#dfe2e7] [--scene-muted:#b9bec7] [--scene-paper:#fff] [--scene-wash:#f5f6f8] **:data-motion:transform-fill dark:[--scene-line:#3e414c] dark:[--scene-muted:#737987] dark:[--scene-paper:#202127] dark:[--scene-wash:#292b33] motion-safe:[&_[data-motion]]:transition-[translate,scale,rotate,opacity] motion-safe:[&_[data-motion]]:duration-500 motion-safe:[&_[data-motion]]:ease-[cubic-bezier(0.22,1,0.36,1)] ${item.colorClass}`}
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

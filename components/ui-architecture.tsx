'use client'

import type { ReactNode } from 'react'
import { clsx } from '@/lib/clsx'

function Slot({
  children,
  className,
  part,
  subtle = false,
}: {
  children: ReactNode
  className?: string
  part?: string
  subtle?: boolean
}) {
  return (
    <div
      data-part={part}
      className={clsx(
        `relative flex min-h-14 items-center justify-center overflow-hidden rounded-md border p-3 text-center text-xs`,
        subtle
          ? 'border-dashed bg-muted/20 text-muted-foreground'
          : 'bg-background text-foreground shadow-xs',
        className,
      )}
    >
      {part
        ? (
            <span
              className="
                absolute top-1.5 left-1.5 max-w-[calc(100%-0.75rem)] truncate rounded-sm bg-muted px-1.5 py-0.5
                font-mono text-[9px] leading-none text-muted-foreground
              "
            >
              {part}
            </span>
          )
        : null}
      <span className="min-w-0 font-medium">{children}</span>
    </div>
  )
}

function SlotGroup({
  children,
  label,
}: {
  children: ReactNode
  label: string
}) {
  return (
    <section className="rounded-md border bg-card">
      <div className="border-b px-3 py-2 text-[11px] font-medium text-muted-foreground">{label}</div>
      <div className="p-3">{children}</div>
    </section>
  )
}

export function UIArchitecture() {
  return (
    // eslint-disable-next-line better-tailwindcss/no-unknown-classes -- MDX diagrams need to opt out of article prose styles.
    <figure className="not-prose my-6">
      <div className="rounded-lg border bg-muted/15 p-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-medium text-foreground">DesktopWorkbench BuiltInUIPart slots</span>
          <span className="font-mono text-[10px] text-muted-foreground">
            IUIPartsService.registerComponent(part, factory)
          </span>
        </div>

        <div className="grid gap-3">
          <SlotGroup label="workbench-layout">
            <div className="grid gap-2">
              <Slot part="BuiltInUIPart.CUSTOM_HEADER" subtle>
                Custom Header
              </Slot>

              <Slot part="BuiltInUIPart.TOOLBAR">
                <span>Toolbar</span>
                <span className="ml-2 font-mono text-[9px] font-normal text-muted-foreground">
                  + HEADER_MENU
                </span>
              </Slot>

              <div
                className="
                  grid gap-2
                  md:grid-cols-[minmax(11rem,1fr)_minmax(0,2.4fr)_minmax(11rem,1fr)]
                "
              >
                <Slot part="BuiltInUIPart.LEFT_SIDEBAR" subtle>
                  Left Sidebar
                </Slot>

                <div className="grid gap-2">
                  <Slot part="BuiltInUIPart.HEADER">Header</Slot>
                  <Slot part="BuiltInUIPart.CONTENT" className="min-h-24">
                    Content
                  </Slot>
                </div>

                <Slot part="internal Sidebar service" subtle>
                  Right Sidebar
                </Slot>
              </div>

              <Slot part="BuiltInUIPart.FOOTER">Footer</Slot>
            </div>
          </SlotGroup>

          <SlotGroup label="outside workbench-layout">
            <div
              className="
                grid gap-2
                sm:grid-cols-2
              "
            >
              <Slot part="BuiltInUIPart.GLOBAL">Global</Slot>
              <Slot part="BuiltInUIPart.FLOATING">Floating Portal</Slot>
            </div>
          </SlotGroup>
        </div>
      </div>
    </figure>
  )
}

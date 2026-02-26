import type { HTMLAttributes, ReactNode } from 'react'

export interface IphoneProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

/**
 * 一个简单的 iPhone 外观容器，模拟移动端屏幕，children 会被裁剪在屏幕区域。
 */
export function Iphone({ children, className, style, ...props }: IphoneProps) {
  return (
    <div
      className={
        `
          relative mx-auto aspect-9/19.5 w-[320px] max-w-full rounded-[40px] border border-neutral-200 bg-neutral-100
          shadow-lg
          dark:border-neutral-700 dark:bg-neutral-900
          ${
    className || ''}
        `
      }
      style={style}
      {...props}
    >
      {/* 屏幕内容区域 */}
      <div
        className="
          absolute top-0 left-0 z-10 size-full overflow-hidden rounded-4xl bg-white
          dark:bg-neutral-950
        "
        style={{
          top: 12,
          left: 8,
          right: 8,
          bottom: 12,
          width: 'calc(100% - 16px)',
          height: 'calc(100% - 24px)',
          position: 'absolute',
        }}
      >
        {children}
      </div>
      {/* 顶部刘海/听筒 */}
      <div
        className="absolute top-2 left-1/2 z-20 h-6 w-18 -translate-x-1/2 rounded-full bg-black"
      />
      {/* 侧边按钮（静音/音量） */}
      <div
        className="
          absolute top-16 left-0 z-20 h-8 w-1 rounded-r bg-neutral-300
          dark:bg-neutral-700
        "
      />
      <div
        className="
          absolute top-32 left-0 z-20 h-12 w-1 rounded-r bg-neutral-300
          dark:bg-neutral-700
        "
      />
      <div
        className="
          absolute top-24 right-0 z-20 h-16 w-1 rounded-l bg-neutral-300
          dark:bg-neutral-700
        "
      />
    </div>
  )
}

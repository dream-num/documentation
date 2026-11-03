'use client'

import { useInView } from 'motion/react'
import { useLocale } from 'next-intl'
import Image from 'next/image'
import { useRef } from 'react'
import { customerList } from '@/components/customer/data'
import { BlurFade } from '@/components/magicui/blur-fade'
import styles from './logo-cloud.module.css'

interface IProps {
  title: string
}

export function LogoCloud({ title }: IProps) {
  const locale = useLocale()
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref)

  return (
    <BlurFade inView>
      <section id="customers" ref={ref} className={styles.cloud} aria-label={title} data-paused={!inView || undefined}>
        <h2 className="mb-6 text-center text-sm font-semibold text-neutral-800 dark:text-neutral-400">{title}</h2>
        <div className={styles.marquee}>
          <div className={styles.track}>
            {[0, 1].map((copy) => (
              <ul key={copy} className={styles.group} aria-hidden={copy === 1 || undefined}>
                {customerList.map((customer) => {
                  const name = locale === 'zh-CN' && customer.zh ? customer.zh : customer.en
                  const ratio = customer.img.width / customer.img.height
                  const height = Math.min(1.75, Math.max(0.875, Math.sqrt((8 * (customer.s ?? 1)) / ratio)))
                  const logo = (
                    <Image
                      className={styles.logo}
                      src={customer.img}
                      alt={copy === 1 || customer.lockup ? '' : name}
                      style={customer.lockup ? undefined : { height: `${height}rem`, width: `${height * ratio}rem` }}
                      sizes={customer.lockup ? '20px' : `${Math.ceil(height * ratio * 16)}px`}
                      draggable={false}
                    />
                  )

                  return (
                    <li key={customer.en} className={styles.customer} data-surface={customer.surface ?? 'transparent'}>
                      {customer.lockup ? (
                        <span className="flex items-center gap-2">
                          <span className={styles.mark}>{logo}</span>
                          <span className={styles.name}>{name}</span>
                        </span>
                      ) : (
                        logo
                      )}
                    </li>
                  )
                })}
              </ul>
            ))}
          </div>
        </div>
      </section>
    </BlurFade>
  )
}

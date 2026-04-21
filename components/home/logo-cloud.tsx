import Image from 'next/image'
import { customerList } from '@/components/customer/data'
import { BlurFade } from '@/components/magicui/blur-fade'

interface IProps {
  title: string
}

export function LogoCloud(props: IProps) {
  const { title } = props

  return (
    <BlurFade inView>
      <section className="mb-12 text-center">
        <h2
          className={`
            mb-6 text-sm font-semibold text-neutral-800
            dark:text-neutral-400
          `}
        >
          {title}
        </h2>

        <div
          className="relative flex items-center justify-center gap-10 overflow-hidden px-8"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 60px, black calc(100% - 60px), transparent)',
          }}
        >
          {customerList.map(item => (
            <Image
              key={item.name}
              className={`
                h-4 w-fit opacity-60 grayscale transition-opacity select-none
                hover:opacity-100 hover:grayscale-0
                md:h-5
              `}
              src={item.img}
              alt={item.name}
              draggable={false}
            />
          ))}
        </div>
      </section>
    </BlurFade>
  )
}

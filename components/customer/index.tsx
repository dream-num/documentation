import Image from 'next/image'
import { customerList } from './data'

export function Customer() {
  return (
    <div
      className="relative flex items-center gap-8"
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 180px, black calc(100% - 180px), transparent)',
      }}
    >
      {customerList.map(item => (
        <Image
          key={item.name}
          className={`
            h-4 w-fit select-none
            md:h-5
          `}
          src={item.img}
          alt={item.name}
          draggable={false}
        />
      ))}
    </div>
  )
}

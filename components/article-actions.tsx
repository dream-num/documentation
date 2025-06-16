import { SiGithub } from '@icons-pack/react-simple-icons'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

interface IProps {
  path: string
}

export function ArticleActions(props: IProps) {
  const { path } = props

  return (
    <div>
      <Link
        className={buttonVariants({
          variant: 'secondary',
          size: 'sm',
          className: 'gap-2',
        })}
        href={`https://github.com/dream-num/univer-documentation/tree/v1/content/${path}`}
        target="_blank"
        rel="nofollow noreferrer"
      >
        <SiGithub />
        View on GitHub
      </Link>
    </div>
  )
}

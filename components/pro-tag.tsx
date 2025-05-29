interface IProps {
  children: React.ReactNode
}

export default function ProTag(props: IProps) {
  const { children } = props

  return (
    <span>
      {children}
      <span
        className={`
          ml-2 rounded-lg bg-[linear-gradient(90deg,#5357ED_0%,#40B9FF_104.41%)] px-2 py-0.5 text-xs text-white/80
        `}
      >
        Pro
      </span>
    </span>
  )
}

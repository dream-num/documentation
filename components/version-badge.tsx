interface IProps {
  version: string
}

export default function VersionBadge(props: IProps) {
  const { version } = props

  return (
    <span className="rounded-sm bg-slate-700 px-1.5 py-0.5 align-text-top text-xs font-medium text-white">
      {version}
    </span>
  )
}

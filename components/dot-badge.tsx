interface IProps {
  children: React.ReactNode
}

export default function ProTag(props: IProps) {
  const { children } = props

  return (
    <span>
      {children}
      <sup
        className="relative -top-2 left-0.5 inline-block h-1.5 w-1.5 rounded-full bg-red-600"
      />
    </span>
  )
}

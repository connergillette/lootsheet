interface Props {
  children: any
}

export default function SectionHeader ({ children }: Props) {
  return (
    <h2 className="font-bold text-lg">{...children}</h2>
  )
}

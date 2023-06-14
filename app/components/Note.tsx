export interface NoteData {
  id: number,
  created_at: Date,
  text: string,
  inferred_type: string
}

interface Props {
  data: NoteData
}

export default function Note({ data }: Props) {
  return (
    <div className="w-full flex flex-col gap-2 py-2 px-4">
      <span className="text-xs opacity-50">{new Date(data.created_at).toDateString()}</span>
      <span>{data.text}</span>
    </div>
  )
}
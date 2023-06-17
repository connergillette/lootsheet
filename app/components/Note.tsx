export interface NoteData {
  id: number,
  created_at: Date,
  text: string,
  inferred_type: string
}

export interface NewNote {
  text: string,
  inferred_type?: string
}

interface Props {
  data: NoteData,
  query?: string,
}

export default function Note({ data, query }: Props) {
  let highlightedText = <span>{data.text}</span>

  if (query) {
    const split = data.text.split(query)
    highlightedText = (
      <span>
        {
          split.map((segment, index) => (
            <span key={`resultId${data.id}-segment${index}`}>{segment}</span>
          )).reduce((prev, curr) => [prev, <span className="text-blue-400" key={`match${data.id}`}>{query}</span>, curr])
        }
      </span>
    )
  }

  return (
    <div
      className={`
        w-full flex flex-col gap-2 py-2 px-4 \
        my-2 rounded-md \
        ${data.text.includes('GP') ? 'bg-yellow-50' : ''} \
        ${data.text.includes('Fought') ? 'bg-red-50' : ''}
      `}
    >
      <span className="text-xs opacity-50">{new Date(data.created_at).toDateString()}</span>
      <span>{highlightedText}</span>
    </div>
  )
}
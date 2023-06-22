export const categoryColors : object = {
  currency: 'bg-yellow-400',
  loot: 'bg-orange-400',
  encounter: 'bg-red-400',
  information: 'bg-blue-400',
  event: 'bg-gray-300',
  general: 'bg-gray-300'
}
export interface NoteData {
  id: number,
  created_at: Date,
  text: string,
  inferred_type: string
}

export interface NewNote {
  text: string,
  user_id: string,
  inferred_type?: string,
}

interface Props {
  data: NoteData,
  query?: string,
}

export default function Note({ data, query }: Props) {
  let highlightedText = <span>{data.text}</span>

  if (query) {
    const split = data.text.split(query)
    const highlighted = <span className="text-blue-400" key={`match${data.id}`}>{query}</span>
    highlightedText = (
      <span>
        {
          split.map((segment, index) => (
            <span key={`resultId${data.id}-segment${index}`}>{segment}</span>
          )).reduce((prev, curr) => [prev, highlighted, curr])
        }
      </span>
    )
  }

  return (
    <div className="flex">
      <div className={`
          flex w-2 rounded-md h-3/4 my-auto \
          ${categoryColors[data.inferred_type]} \
      `}></div>
      <div
        // TODO: Implement better color-coding implementation based on category
        className={`
          w-full flex flex-col gap-2 py-2 px-4 \
          my-2 rounded-md h-full \
        `}
      >
        <span className="text-xs opacity-50">{new Date(data.created_at).toDateString()}</span>
        <span>{highlightedText}</span>
      </div>
    </div>
  )
}
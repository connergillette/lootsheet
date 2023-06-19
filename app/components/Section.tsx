import Note, { NoteData } from './Note'
import SectionHeader from './SectionHeader'

interface Props {
  name: string,
  items: object[]
}

export default function Section({name, items}: Props) {
  return (
    <div className="w-1/2 p-2 h-min">
      <SectionHeader>{name}</SectionHeader>
      <div className="flex flex-col overflow-y-scroll no-scrollbar pb-5 max-h-[400px]">
        {
          items.length > 0 && items.map((note: NoteData) => (
            <div className="flex" key={`${note.id}`}>
              <Note data={note} />
            </div>
          ))
        }
        {
          items.length === 0 && <div className="text-gray-400 text-center px-auto py-10">No items to show.</div>
        }
      </div>
    </div>
  )
}

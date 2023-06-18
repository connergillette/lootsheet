import Note, { NoteData } from './Note'
import SectionHeader from './SectionHeader'

interface Props {
  name: string,
  items: object[]
}

export default function Section({name, items}: Props) {
  return (
    <div className="w-1/2 p-2 h-[400px]">
      <SectionHeader>{name}</SectionHeader>
      <div className="overflow-y-scroll max-h-full">
        {
          items.length > 0 && items.map((note: NoteData) => (
            <Note data={note} key={`${note.id}`} />
          ))
        }
        {
          items.length === 0 && <div className="text-gray-400 text-center px-auto py-10">No items to show.</div>
        }
      </div>
    </div>
  )
}

import Note, { NoteData } from './Note'
import SectionHeader from './SectionHeader'

interface Props {
  name: string,
  items: NoteData[]
}

export default function Section({name, items}: Props) {
  return (
    <div className="max-md:w-full p-2 mb-5 overflow-y-scroll no-scrollbar">
      <SectionHeader>{name}</SectionHeader>
      <div className="flex flex-col overflow-y-scroll no-scrollbar pb-5">
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
        {
          (items && items.length > 5) && (
            <div className="text-gray-300 text-center w-full">(End of section)</div>
          )
        }
      </div>
    </div>
  )
}

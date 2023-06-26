import type { NoteData } from './Note'
import Note from './Note'

interface Props {
  notes: NoteData[],
  showCategoryView: boolean
}

export default function NotesFeed ({ notes, showCategoryView }: Props) {
  return (
    <div className={`flex flex-col overflow-y-scroll no-scrollbar px-2 ${showCategoryView ? 'max-md:max-h-[300px]' : 'max-md:h-[900px]'} mt-2`}>
      <div>
        {
          notes && notes.map((note: NoteData) => (
            <div className="flex" key={note.id}>
              <Note data={note}  />
            </div>
          ))
        }
        {
          (notes && notes.length > 10) && (
            <div className="text-gray-300 text-center w-full">(End of notes)</div>
          )
        }
      </div>
    </div>
  )
}
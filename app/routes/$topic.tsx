import { LoaderArgs, LoaderFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import Note, { NoteData } from '~/components/Note'
import { supabase } from '~/server/supabase.server'

interface Props {

}

export const loader: LoaderFunction = async ({ params }: LoaderArgs) => {
  const { topic } = params

  let notes : NoteData[] = []
  if (topic) {
    const notesResponse = await supabase.from('notes').select().textSearch('text', topic)
    console.log(notesResponse)
    if (!notesResponse.error) {
      notes = notesResponse.data
    }
    // TODO: Implement error handling here
  }

  return { topic, notes }
}

export default function Topic() {
  const { topic, notes } = useLoaderData()
  return (
    <div className="flex flex-col gap-6 px-2 my-5">
      <h1 className="text-2xl">{topic}</h1>
      <div>
        {notes.map((note: NoteData) => <Note data={note} key={note.id}/>)}
      </div>
    </div>
  )
}

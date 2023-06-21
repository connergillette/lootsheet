import { LoaderArgs, LoaderFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import Note, { NoteData } from '~/components/Note'
import { supabase } from '~/server/supabase.server'

import { fetchTopicSummary } from '~/server/openai.server'
import SectionHeader from '~/components/SectionHeader'

interface Props {

}

export const loader: LoaderFunction = async ({ params }: LoaderArgs) => {
  const { topic } = params

  let notes : NoteData[] = []
  let summary : string = ''
  let topicName = topic?.split('+').join(' ')
  if (topic) {
    const notesResponse = await supabase.from('notes').select().textSearch('text', topic).order('id', { ascending: false })
    if (!notesResponse.error) {
      notes = notesResponse.data

      // TODO: Implement stored summary system to only generate a summary when the topic notes change
      // summary = await fetchTopicSummary(notes.map((note) => note.text))
    } else {
      return { topic, error: notesResponse.error }
    }
    // TODO: Implement error handling here
  }
  
  return { topicName, notes }
}

export default function Topic() {
  const { topicName, notes, error } = useLoaderData()
  return (
    <div className="flex flex-col gap-6 px-2 my-5">
      <h1 className="text-2xl">{topicName}</h1>
      <div className="flex max-md:flex-col gap-4">
        {error && (
          <div className="text-red-400 text-lg h-full w-full text-center justify-center my-20">
            <span>There was a problem fetching notes for this topic.</span>
            <span>
              {JSON.stringify(error)}
            </span>
          </div>
        )}
        {!error && 
          <>
            <div className="w-2/3 max-md:w-full min-h-[200px]">
              <SectionHeader>Summary</SectionHeader>
            </div>
            <div className="flex flex-col w-1/3 max-md:w-full rounded-md">
              <SectionHeader>Notes</SectionHeader>
              {notes.map((note: NoteData) => <div className="flex"><Note data={note} key={note.id}/></div>)}
            </div>
          </>
        }
      </div>
    </div>
  )
}

import { LoaderArgs, LoaderFunction, Response, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import Note, { NoteData } from '~/components/Note'

import { fetchTopicSummary } from '~/server/openai.server'
import SectionHeader from '~/components/SectionHeader'
import { createServerClient } from '@supabase/auth-helpers-remix'

interface Props {

}

export const loader: LoaderFunction = async ({ request, params }: LoaderArgs) => {
  const { topic: topicQuery } = params

  const response = new Response()

  const supabase = createServerClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_KEY || '',
    { request, response }
  )

  const {data: { session }} = await supabase.auth.getSession()

  if (session) {
    let notes : NoteData[] = []
    let summary : string = ''
    let topicName = topicQuery?.split('+').join(' ')
    const userId = session.user.id
    
    if (topicQuery) {
      const notesResponse = await supabase.from('notes').select().textSearch('text', topicQuery).eq('user_id', userId).order('id', { ascending: false })
      if (!notesResponse.error) {
        notes = notesResponse.data

        if (notes.length > 0) {
          const topicRequest = await supabase.from('topics').select().eq('name', topicName).eq('user_id', userId)
        
          // TODO: Clean up this mess, add checks for empty notes list
          let topicRecord = topicRequest.data[0]
  
          if (!topicRecord) {
            summary = await fetchTopicSummary(notes.map((note) => note.text))
            topicRecord = (await supabase.from('topics').insert({
              name: topicName,
              current_summary: summary,
              num_notes_summarized: notes.length,
              user_id: userId
            }).select()).data[0]
          } else if (topicRecord.num_notes_summarized !== notes.length) {
            summary = await fetchTopicSummary(notes.map((note) => note.text))
            topicRecord = await supabase.from('topics').update({
              current_summary: summary,
              num_notes_summarized: notes.length,
            }).eq('id', topicRecord.id)
          }
  
          console.log(topicRecord)
  
          summary = topicRecord.current_summary
        
        // TODO: Implement error handling here
        }
      } else {
        return { topicName, error: notesResponse.error }
      }
    }
    
    return { topicName, notes, summary }
  }

  return redirect('/login')
}

export default function Topic() {
  const { topicName, notes, summary, error } = useLoaderData()
  return (
    <div className="flex flex-col gap-6 px-2 my-5">
      <h1 className="text-2xl">{topicName}</h1>
      <div className="flex max-md:flex-col">
        {error && (
          <div className="text-red-400 text-lg h-full w-full text-center justify-center my-20">
            <span>There was a problem fetching notes for this topic.</span>
            <span>
              {JSON.stringify(error)}
            </span>
          </div>
        )}
        {!error && notes.length > 0 &&
          <>
            <div className="w-2/3 max-md:w-full min-h-[200px]">
              <SectionHeader>Summary</SectionHeader>
              <p className="text-lg w-3/4">{summary}</p>
            </div>
            <div className="flex flex-col w-1/3 max-md:w-full rounded-md">
              <SectionHeader>Notes</SectionHeader>
              {notes.map((note: NoteData) => <div className="flex" key={note.id}><Note data={note}/></div>)}
            </div>
          </>
        }
        {
          !error && notes.length === 0 && (
            <div className="w-full rounded-lg text-center p-20 text-xl opacity-60">
              You have no notes about this topic.
            </div>
          )
        }
      </div>
    </div>
  )
}

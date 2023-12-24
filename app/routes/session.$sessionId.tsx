import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { createServerClient } from '@supabase/auth-helpers-remix'
import NotesFeed from '~/components/NotesFeed'

import { fetchTopicSummary } from '~/server/openai.server'

export const loader = async ({params, request}: LoaderArgs) => {
  const { sessionId } = params

  const response = new Response()

  const supabase = createServerClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_KEY || '',
    { request, response }
  )

  const { data: { session } } = await supabase.auth.getSession()

  const sessionResponse = await supabase.from('sessions').select().eq('id', sessionId).eq('user_id', session?.user.id)
  const notesResponse = await supabase.from('notes').select().eq('session_id', sessionId).eq('user_id', session?.user.id)

  if (!sessionResponse.error && !notesResponse.error) {
    const playSession = sessionResponse.data[0]
    console.log(playSession)
    const notes = notesResponse.data

    const notesText = notes.map((note) => note.text)


    console.log(notes.length, playSession.num_notes_summarized)
    if (notes.length !== (playSession.num_notes_summarized || 0)) {
      const summary = await fetchTopicSummary(notesText)
      const updateResponse = await supabase.from('sessions').update({ current_summary: summary, num_notes_summarized: notes.length }).eq('id', sessionId)
      console.log(updateResponse)
      playSession.current_summary = summary
    }

    return json({ playSession, notes, session })
  }
}

export default function SessionDetail() {
  const { playSession, notes, session } = useLoaderData()

  return (
    <div className="flex flex-col gap-6 px-2 my-20">
      <div>
        <h1 className="text-4xl font-bold">Session on {new Date(playSession.created_at).toLocaleDateString()}</h1>
        {/* <h2 className="text-gray-400"></h2> */}
      </div>
      {/* <div className="flex max-md:flex-col gap-10 h-max"> */}
        {/* <div className={`w-1/3 max-md:w-full transition-height transition-width h-full max-md:min-h-[200px] max-md:max-h-[800px] rounded-lg overflow-hidden max-md:overflow-y-scroll no-scrollbar pb-10`}> */}
          <div className="flex gap-10">
            <div className="flex w-2/3">
              {playSession.current_summary}
            </div>
            <div className="grow h-[1400px]">
              <NotesFeed notes={notes} showCategoryView={false} />
            </div>
          </div>
        {/* </div> */}
      {/* </div> */}
    </div>
  )
}
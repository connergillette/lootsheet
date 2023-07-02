import { LoaderArgs, LoaderFunction, Response, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import Note, { NoteData } from '~/components/Note'

import { fetchTopicSummary } from '~/server/openai.server'
import SectionHeader from '~/components/SectionHeader'
import { createServerClient } from '@supabase/auth-helpers-remix'
import Image from '~/components/Image'

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

  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    let notes : NoteData[] = []
    let notesText : string[] = []
    let relatedTopics : string[] = []
    let summary : string = ''
    let topicName = topicQuery?.split('+').join(' ')
    const userId = session.user.id
    
    if (topicQuery) {
      const notesResponse = await supabase.from('notes').select().textSearch('text', topicQuery).eq('user_id', userId).order('id', { ascending: false })
      if (!notesResponse.error) {
        notes = notesResponse.data
        notesText = notesResponse.data.map((note) => note.text)

        if (notes.length > 0) {
          const topicRequest = await supabase.from('topics').select().eq('name', topicName).eq('user_id', userId)
          const allTopicsRequest = await supabase.from('topics').select('name').eq('user_id', userId)
        
          // TODO: Clean up this mess
          let topicRecord = topicRequest?.data[0] || null
          let allTopics = allTopicsRequest?.data.map((topic) => topic.name)

          const notesWithAttachments = notes.filter((note: NoteData) => note.has_attachment)
          for (const note of notesWithAttachments) {
            const file = await supabase.storage.from('note_attachments').createSignedUrl(`${session.user.id}/${note.id}`, 60)
            if (file && file.data) {
              note.attachment = file.data.signedUrl
            }
          }
          
          if (!topicRecord) {
            summary = await fetchTopicSummary(notesText)
            topicRecord = (await supabase.from('topics').insert({
              name: topicName,
              current_summary: summary,
              num_notes_summarized: notes.length,
              user_id: userId
            }).select()).data[0]
          } else if (topicRecord.num_notes_summarized !== notes.length) {
            summary = await fetchTopicSummary(notesText)
            topicRecord = (await supabase.from('topics').update({
              current_summary: summary,
              num_notes_summarized: notes.length,
            }).eq('id', topicRecord.id).select()).data[0]
          }

          for (const note of notesText) {
            for (const topic of allTopics) {
              if (topic === topicRecord.name) break
              if (note.includes(topic) && !relatedTopics.includes(topic)) {
                relatedTopics.push(topic)
              }
            }
          }
  
          summary = topicRecord.current_summary
        
        // TODO: Implement error handling here
        }
      } else {
        return { topicName, error: notesResponse.error }
      }
    }
    
    return { topicName, notes, summary, relatedTopics }
  }

  return redirect('/login')
}

export default function Topic() {
  const { topicName, notes, summary, relatedTopics, error } = useLoaderData()

  let notesWithAttachments
  
  if (!error) notesWithAttachments = notes.filter((note: NoteData) => note.has_attachment)

  return (
    <div className="flex flex-col gap-6 px-2 my-20">
      <h1 className="text-4xl font-bold">{topicName}</h1>
      <div className="flex max-md:flex-col gap-10">
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
              { notesWithAttachments.length > 0 && (
                <div className="grid grid-flow-row grid-cols-3 gap-4 pb-10 min-h-[400px] transition-height">
                  {
                    notesWithAttachments.map((note) => (
                      <Image url={note.attachment} key={`image-${note.id}`} />
                    ))
                  }
                </div>
              )}
              <SectionHeader>Summary</SectionHeader>
              <p className="text-lg w-3/4 pt-2 pb-10">{summary}</p>
              {
                relatedTopics.length > 0 && (
                  <>
                    <SectionHeader>Related Topics</SectionHeader>
                    <div className="flex gap-2 pt-2 flex-wrap">
                      {
                        relatedTopics.map((topic) => (
                          <a href={`/${topic.split(' ').join('+')}`} key={topic}>
                            <button key={topic} type="button" className="bg-gray-200 rounded-lg px-2">{topic}</button>
                          </a> 
                        ))
                      }
                    </div>
                  </>
                )
              }
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

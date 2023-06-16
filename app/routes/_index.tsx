import { ActionFunction, LoaderFunction, V2_MetaFunction, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from '@remix-run/react'
import { useEffect, useState } from 'react'
import Note, { NewNote } from '~/components/Note'
import type { NoteData } from '~/components/Note'
import { supabase } from '~/server/supabase.server'
// import SectionHeader from '~/components/SectionHeader'

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Lootsheet" },
    { name: "description", content: "Feed-based tool for tracking gained items / information in TTRPGs." },
  ];
}

export const action: ActionFunction = async ({ request, params }) => {
  const data = await request.formData()

  const text = data.get('text')
  const note : NewNote = {
    text: text?.toString() || ''
  }
  const noteResponse = await supabase.from('notes').insert(note)
  if (!noteResponse.error) {
    return redirect('/')
  }

  return noteResponse.error.message
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url)
  const search = new URLSearchParams(url.search)
  const query = search.get('query') || ''

  const notesResponse = await supabase.from('notes').select().order('id', { ascending: false })

  let notes = []
  let searchResults = []
  if (!notesResponse.error) {
    notes = notesResponse.data

    if (query) {
      searchResults = notes.filter((note: NoteData) => note.text.includes(query))
    }
  } else {
    return { error: notesResponse.error }
  }
  return { notes, searchResults, query }
}

export default function Index() {
  const { notes, searchResults, query } = useLoaderData()
  const error = useActionData()
  const [noteText, setNoteText] = useState('')
  const [searchQuery, setSearchQuery] = useState(query)
  const [queryIsDirty, setQueryIsDirty] = useState(false)

  useEffect(() => {
    setNoteText('')
    setSearchQuery(query)
    setQueryIsDirty(false)
  }, [notes, query])

  const updateQuery = (newQuery: string) => {
    setSearchQuery(newQuery)
    setQueryIsDirty(true)
  }
  
  return (
    <div className="w-full my-10">
      {error && <pre className="text-red-500">{error.toString()}</pre>}
      <Form method="post">
        <input name="text" value={noteText} onChange={(e) => setNoteText(e.target.value)} className="rounded-md py-2 px-4 w-full max-w-full bg-transparent focus:outline-none resize-none text-lg h-20 whitespace-break-spaces" autoFocus />
      </Form>
      <div className="flex flex-col gap-6">
        <div className={`bg-gray-100 ${searchQuery && !queryIsDirty ? 'h-72' : 'h-10'} ${searchResults.length == 0 ? 'max-h-32' : 'max-h-72'} transition-height rounded-md overflow-hidden`}>
          <Form method="get">
            <input
              name="query" 
              value={searchQuery} 
              onChange={(e) => updateQuery(e.target.value)} 
              className={`rounded-md py-2 px-4 w-full bg-transparent focus:outline-none resize-none text-lg ${!queryIsDirty ? 'bg-gray-200' : ''} transition`} 
              placeholder="Search" 
              autoFocus 
            />
          </Form>
          {
            !queryIsDirty && (
              <>
                <div className="border-solid border-t-2 border-gray-200 mx-2"></div>
                <div className="p-6 flex flex-col align-center h-64 overflow-scroll">
                  { searchResults.length > 0 && searchResults.map((note: NoteData) => (
                      <Note data={note} key={`searchResult-${note.id}`} query={searchQuery} />
                    ))
                  }
                  {
                    searchResults.length == 0 && (
                      <span className="text-gray-400 text-center w-full">No results found.</span>
                    )
                  }
                </div>
              </>
            )
          }
        </div>
        {
          notes && notes.map((note: NoteData) => (
            <Note data={note} key={note.id} />
          ))
        }
      </div>
      {/* Keywords: "PP", "GP", "SP", "EP", "CP", "gold", "silver", etc. */}
      {/* <SectionHeader>Currency</SectionHeader> */}

      {/* Keywords: "gained", "found", "chest", "loot" */}
      {/* <SectionHeader>Loot</SectionHeader> */}

      {/* Somewhat of a catch-all */}
      {/* <SectionHeader>Events</SectionHeader> */}
      
      {/* Keywords: "fought", "encountered", "attacked" */}
      {/* <SectionHeader>Encounters</SectionHeader> */}

      {/* Keywords: "learned", "found out", "researched", "told that" */}
      {/* <SectionHeader>Information</SectionHeader> */}
    </div>
  );
}

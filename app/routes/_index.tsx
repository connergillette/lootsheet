import { ActionFunction, LoaderFunction, V2_MetaFunction, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from '@remix-run/react'
import { useEffect, useState } from 'react'
import Note, { NewNote } from '~/components/Note'
import type { NoteData } from '~/components/Note'
import { supabase } from '~/server/supabase.server'
import Section from '~/components/Section'

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

  const categories = {
    currency: {
      terms: ['pp', 'gp', 'sp', 'ep', 'cp', 'platinum', 'gold', 'silver', 'electrum', 'copper'],
      notes: []
    },
    loot: {
      terms: ['gained', 'found', 'chest', 'loot'],
      notes: []
    },
    encounters: {
      terms: ['fought', 'encountered', 'attacked', 'met with', 'talked with'],
      notes: []
    },
    information: {
      terms: ['learned', 'found out', 'researched', 'told that'],
      notes: []
    },
  }

  let notes = []
  let searchResults = []
  if (!notesResponse.error) {
    notes = notesResponse.data

    const events = {
      notes: []
    }

    // TODO: Consider case where a note matches multiple category keywords
    for (const note of notes) {
      let assignedCategory = false
      for (const categoryName of Object.keys(categories)) {
        const category = categories[categoryName]
        const words = note.text.toLowerCase().split(' ')
        console.log(category)
        for (const term of category.terms) {
          if (words.includes(term)) {
            console.log(categoryName, term, words)
            category.notes.push(note)
            assignedCategory = true
            break
          }
        }
        if (assignedCategory) break
      }
      if (!assignedCategory) {
        events.notes.push(note)
      }
    }
    categories.events = events

    if (query) {
      searchResults = notes.filter((note: NoteData) => note.text.includes(query))
    }
  } else {
    return { error: notesResponse.error }
  }
  return { notes, searchResults, query, categories }
}

export default function Index() {
  const { notes, searchResults, query, categories } = useLoaderData()
  const error = useActionData()
  const [noteText, setNoteText] = useState('')
  const [searchQuery, setSearchQuery] = useState(query)
  const [queryIsDirty, setQueryIsDirty] = useState(false)
  const [view, setView] = useState('feed')

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
    <div className="w-full">
      <div className="flex justify-end gap-2 my-4">
        <button type="button" onClick={() => setView('feed')} className={`${view === 'feed' ? 'bg-gray-200' : 'hover:bg-gray-100'} rounded-md px-4 py-2 transition`}>Feed</button>
        <button type="button" onClick={() => setView('categories')} className={`${view === 'categories' ? 'bg-gray-200' : 'hover:bg-gray-100'} rounded-md px-4 py-2 transition`}>Categories</button>
      </div>
      {error && <pre className="text-red-500">{error.toString()}</pre>}
      <Form method="post">
        <input name="text"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          className="rounded-md py-2 px-4 w-full max-w-full bg-transparent focus:outline-none resize-none text-lg h-20 whitespace-break-spaces"
          placeholder="Write a note here."
          autoFocus
        />
      </Form>
      {
        view === 'feed' && (
          <div className="flex flex-col gap-6">
            <div className={`bg-gray-100 ${searchQuery && !queryIsDirty ? 'h-72' : 'h-12'} ${searchResults.length == 0 ? 'max-h-32' : 'max-h-72'} transition-height rounded-md overflow-hidden`}>
              <Form method="get" className="flex">
                <input
                  name="query" 
                  value={searchQuery} 
                  onChange={(e) => updateQuery(e.target.value)} 
                  className={`rounded-md py-2 px-4 w-full bg-transparent focus:outline-none resize-none text-lg ${!queryIsDirty ? 'bg-gray-200' : ''} transition`} 
                  placeholder="Search" 
                  autoFocus 
                />
                <a href={`/${searchQuery}`}><button type="button" className={`bg-gray-600 text-white rounded-md px-4 py-2 m-1 whitespace-nowrap transition-opacity ${searchQuery ? 'opacity-100' : 'opacity-0'}`}>Go to page {'>'}</button></a>
              </Form>
              {
                !queryIsDirty && (
                  <>
                    <div className="border-solid border-t-2 border-gray-200 mx-2"></div>
                    <div className="p-6 flex flex-col align-center h-64 overflow-scroll">
                      { searchResults.length > 0 && (
                          searchResults.map((note: NoteData) => (
                            <Note data={note} key={`searchResult-${note.id}`} query={searchQuery} />
                          ))
                        )
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
        )
      }
      {
        view === 'categories' && (
          <div className="flex flex-wrap">
            {
              Object.keys(categories).map((categoryName: string) => {
                const category = categories[categoryName]
                return (
                  <Section name={categoryName.toLocaleUpperCase()} items={category.notes} key={categoryName} />
                )
              })
            }
          </div>
        )
      }
      

    </div>
  );
}

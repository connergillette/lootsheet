import { ActionFunction, LoaderArgs, LoaderFunction, V2_MetaFunction, json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from '@remix-run/react'
import { useEffect, useRef, useState } from 'react'
import Note, { NewNote } from '~/components/Note'
import type { NoteData } from '~/components/Note'
import Section from '~/components/Section'
import { createServerClient } from '@supabase/auth-helpers-remix'

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Lootsheet" },
    { name: "description", content: "Feed-based tool for tracking gained items / information in TTRPGs." },
  ];
}

const categoryTerms : object = {
  currency: ['pp', 'gp', 'sp', 'ep', 'cp', 'platinum', 'gold', 'silver', 'electrum', 'copper'],
  loot: ['gained', 'found', 'chest', 'loot'],
  encounter: ['fought', 'encountered', 'attacked', 'met with', 'talked with'],
  information: ['learned', 'found out', 'researched', 'told that', 'is'],
  general: []
}

export const action: ActionFunction = async ({ request }) => {
  const response = new Response()

  const supabase = createServerClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_KEY || '',
    { request, response }
  )

  const { data: { session }} = await supabase.auth.getSession()

  if (session) {
    const data = await request.formData()

    const text = data.get('text')

    // TODO: Allow note to belong to multiple categories (e.g. currency + loot)
    let inferredType = 'general'
    const categories = Object.keys(categoryTerms)
    for (const category of categories) {
      for (const term of categoryTerms[category]) {
        const words = text.toLowerCase().split(' ')
        if (words.includes(term)) {
          inferredType = category
          break
        }
      }
    }

    const note : NewNote = {
      text: text?.toString() || '',
      inferred_type: inferredType,
      user_id: session.user.id
    }
    const noteResponse = await supabase.from('notes').insert(note)
    if (!noteResponse.error) {
      return redirect('/')
    }

    return noteResponse.error.message
  }

  return redirect('/')
}

export const loader: LoaderFunction = async ({ request }: LoaderArgs) => {
  const response = new Response()
  // an empty response is required for the auth helpers
  // to set cookies to manage auth

  const supabase = createServerClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_KEY || '',
    { request, response }
  )
  const { data: { session }} = await supabase.auth.getSession()

  if (!session) {
    return redirect('/login')
  }

  const url = new URL(request.url)
  const search = new URLSearchParams(url.search)
  const query = search.get('query') || ''
  const queryParsed = query.split('+').join(' ')

  const notesResponse = await supabase.from('notes').select().eq('user_id', session.user.id).order('id', { ascending: false })
  const topicsResponse = await supabase.from('topics').select('name').eq('user_id', session.user.id).order('id', { ascending: false })
  
  const categories = {}
  let notes = []
  let topics = []
  let searchResults = []
  if (!notesResponse.error) {
    notes = notesResponse.data

    const categoryNames = Object.keys(categoryTerms)
    for (const category of categoryNames) {
      categories[category] = notes.filter((note) => note.inferred_type === category)
    }

    if (queryParsed) {
      searchResults = notes.filter((note: NoteData) => note.text.includes(queryParsed))
    }
  } else {
    return { error: notesResponse.error }
  }

  if (!topicsResponse.error) {
    topics = topicsResponse.data.map((topic) => topic.name)
  }


  return json({ notes, topics, searchResults, query, queryParsed, categories, session }, {
    "Cache-Control": "public, s-maxage=60",
  })
}

export default function Index() {
  const { notes, topics, searchResults, query, queryParsed, categories, session } = useLoaderData()
  const error = useActionData()
  const noteInputRef = useRef()
  const [noteText, setNoteText] = useState('')
  const [searchQuery, setSearchQuery] = useState(queryParsed)
  const [queryIsDirty, setQueryIsDirty] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  // const [view, setView] = useState('feed')

  const noteTextWords = noteText.split(' ')
  const searchQueryWords = searchQuery.split(' ')
  const currentNoteFragment = noteTextWords[noteTextWords.length - 1]
  const currentSearchQueryFragment = searchQueryWords[searchQueryWords.length - 1]
  const noteTopicMatches = currentNoteFragment ? topics.filter((topic: string) => topic.substring(0, currentNoteFragment.length) === currentNoteFragment) : []
  const searchQueryTopicMatches = currentSearchQueryFragment ? topics.filter((topic: string) => topic.substring(0, currentSearchQueryFragment.length) === currentSearchQueryFragment) : []

  useEffect(() => {
    setNoteText('')
    setSearchQuery(queryParsed)
    setQueryIsDirty(false)
  }, [notes, queryParsed])

  const updateQuery = (newQuery: string) => {
    setSearchQuery(newQuery)
    setQueryIsDirty(true)
  }

  const autocomplete = (fragment: string) => {
    noteTextWords[noteTextWords.length - 1] = fragment + ' '
    setNoteText(noteTextWords.join(' '))
    noteInputRef.current?.focus()
  }

  return (
    <div className="w-full h-full max-md:h-full pb-24">
      {error && <pre className="text-red-500">{error.toString()}</pre>}
      <Form method="post" className="flex">
        <div className="flex flex-col grow px-4">
          <textarea name="text"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="rounded-md py-2 w-full max-w-full bg-transparent focus:outline-none resize-none text-lg h-20 whitespace-break-spaces no-scrollbar"
            placeholder="Write a note here."
            ref={noteInputRef}
            autoFocus
          />
          <div className={`flex gap-2 h-6 ${noteTopicMatches.length > 0 ? 'opacity-100' : 'opacity-0'} transition`}>
            {
              noteTopicMatches && (
                noteTopicMatches.map((topicMatch: string) => <button key={topicMatch} type="button" className="bg-gray-200 rounded-lg px-2" onClick={() => autocomplete(topicMatch)}>{topicMatch}</button>)
              )
            }
          </div>
        </div>
        <button type="submit" className={`bg-gray-600 text-white rounded-md px-4 max-md:px-2 py-2 max-md:py-1 m-1 h-min whitespace-nowrap transition-opacity ${noteText ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>Save Note</button>
      </Form>
      <div className="flex max-md:flex-col h-full my-2 gap-5 overflow-y-hidden">
        <div className="flex flex-col w-1/3 rounded-md max-md:w-full">
          <div className={`bg-gray-100 ${searchQuery && !queryIsDirty ? 'h-[900px] max-md:h-[400px]' : `${searchQueryTopicMatches.length > 0 ? 'h-[76px] min-h-[76px]' : 'h-[48px] min-h-[48px]'}`} transition-height rounded-md overflow-hidden`}>
            <Form method="get" className="flex-col">
              <div className="flex">
                <input
                  name="query" 
                  value={searchQuery} 
                  onChange={(e) => updateQuery(e.target.value)} 
                  className={`rounded-md py-2 px-4 w-full bg-transparent focus:outline-none resize-none text-lg ${!queryIsDirty ? 'bg-gray-200' : ''} transition`} 
                  placeholder="Search"
                  autoComplete='off'
                  />
                <a href={`/${searchQuery.split(' ').join('+')}`} onClick={() => setIsLoading(true)} className={`bg-gray-600 text-white rounded-md px-4 max-md:px-2 py-2 max-md:py-1 m-1 whitespace-nowrap transition-opacity ${searchQuery ? 'opacity-100' : 'opacity-0 pointer-events-none'} ${isLoading ? 'animate-pulse' : ''}`}>
                  Go to page {'>'}
                </a>
              </div>
              <div className={`flex gap-2 h-6 ${searchQueryTopicMatches.length > 0 ? 'opacity-100' : 'opacity-0'} transition mb-2 mx-2`}>
                {
                  searchQueryTopicMatches && (
                    searchQueryTopicMatches.map((topicMatch: string) => (
                      <a href={`/${topicMatch}`} key={topicMatch}>
                        <button key={topicMatch} type="button" className="bg-gray-200 rounded-lg px-2">{topicMatch}</button>
                      </a> 
                    ))
                  )
                }
              </div>
            </Form>
            {
              searchQuery && !queryIsDirty && (
                <>
                  <div className="border-solid border-t-2 border-gray-200 mx-2"></div>
                  <div className="p-6 pt-2 flex flex-col align-center h-full pb-20 overflow-y-scroll no-scrollbar">
                    { searchResults.length > 0 && (
                        searchResults.map((note: NoteData) => (
                          <div className="flex" key={`searchResult-${note.id}`}>
                            <Note data={note} query={searchQuery} />
                          </div>
                        ))
                      )
                    }
                    {
                      (searchResults && searchResults.length > 5) && (
                        <div className="text-gray-300 text-center w-full">(End of results)</div>
                      )
                    }
                    {
                      searchResults.length == 0 && (
                        <span className="text-gray-400 text-center w-full mt-3">No results found.</span>
                      )
                    }
                  </div>
                </>
              )
            }
          </div>
          <div className="flex flex-col overflow-y-scroll no-scrollbar px-2 max-md:max-h-[300px] mt-2">
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
        </div>
        <div className="flex flex-wrap w-2/3 max-md:w-full bg-gray-100 rounded-lg p-5 h-full">
          {
            Object.keys(categories).map((categoryName: string) => {
              const category = categories[categoryName]
              return (
                <Section name={categoryName.toLocaleUpperCase()} items={category} key={categoryName} />
              )
            })
          }
        </div>
      </div>
    </div>
  );
}

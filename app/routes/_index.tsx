import { ActionFunction, LoaderArgs, LoaderFunction, V2_MetaFunction, json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from '@remix-run/react'
import { useEffect, useRef, useState } from 'react'
import Note, { NewNote } from '~/components/Note'
import type { NoteData } from '~/components/Note'
import Section from '~/components/Section'
import { createServerClient } from '@supabase/auth-helpers-remix'
import CategoryGrid from '~/components/CategoryGrid'
import NoteEntryForm from '~/components/NoteEntryForm'
import NotesFeed from '~/components/NotesFeed'
import NotesSearch from '~/components/NotesSearch'

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Lootsheet" },
    { name: "description", content: "Feed-based tool for tracking gained items / information in TTRPGs." },
  ];
}

export interface CategoryMap {
  [key: string]: string[]
}

const categoryTerms : CategoryMap = {
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

    const text = data.get('text')?.toString() || ''

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
  
  const categories: CategoryMap = {}
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
  const { notes, topics, searchResults, queryParsed, categories } = useLoaderData()
  const error = useActionData()
  const noteInputRef = useRef()
  const [noteText, setNoteText] = useState('')
  const [queryIsDirty, setQueryIsDirty] = useState(false)
  const [searchQuery, setSearchQuery] = useState(queryParsed)
  const [showCategoryView, setShowCategoryView] = useState(true)

  useEffect(() => {
    setNoteText('')
    setSearchQuery(queryParsed)
    setQueryIsDirty(false)
  }, [notes, queryParsed])

  return (
    <div className="w-full h-full max-md:h-full pb-24">
      <NoteEntryForm 
        error={error}
        noteText={noteText}
        setNoteText={setNoteText}
        noteInputRef={noteInputRef}
        topics={topics}
        showCategoryView={showCategoryView}
        setShowCategoryView={setShowCategoryView} 
      />
      <div className="flex max-md:flex-col h-full my-2 overflow-y-hidden">
        <div className={`flex flex-col ${showCategoryView ? 'w-1/3 px-4' : 'w-full p-0'} transition-width rounded-md max-md:w-full`}>
          <NotesSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery} 
            topics={topics} 
            queryIsDirty={queryIsDirty}
            setQueryIsDirty={setQueryIsDirty}
            searchResults={searchResults}
          />
          <NotesFeed notes={notes} showCategoryView={showCategoryView} />
        </div>
        <CategoryGrid categories={categories} showCategoryView={showCategoryView} />
      </div>
    </div>
  );
}

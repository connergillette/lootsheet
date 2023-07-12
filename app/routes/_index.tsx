import { ActionFunction, LoaderArgs, LoaderFunction, V2_MetaFunction, json, redirect } from "@remix-run/node";
import { Form, Outlet, useActionData, useLoaderData } from '@remix-run/react'
import { useEffect, useRef, useState } from 'react'
import Note, { NewNote } from '~/components/Note'
import type { NoteData } from '~/components/Note'
import Section from '~/components/Section'
import { createServerClient } from '@supabase/auth-helpers-remix'
import CategoryGrid from '~/components/CategoryGrid'
import NoteEntryForm from '~/components/NoteEntryForm'
import NotesFeed from '~/components/NotesFeed'
import NotesSearch from '~/components/NotesSearch'
import AssetGrid from '~/components/AssetGrid'
import FilterPanel from '~/components/FilterPanel'

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Lootsheet" },
    { name: "description", content: "Feed-based tool for tracking gained items / information in TTRPGs." },
  ];
}

export interface CategoryMap {
  [key: string]: string[]
}

export interface CategorizedNotes {
  [key: string]: NoteData[]
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
    const attachments : FormDataEntryValue | null = data.get('attachments') || null

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
      user_id: session.user.id,
      has_attachment: !!attachments
    }

    const noteResponse = await supabase.from('notes').insert(note).select()
    if (!noteResponse.error) {
      const noteData = noteResponse.data
      if (attachments) {
        await supabase.storage.from('note_attachments').upload(`${session.user.id}/${noteResponse.data[0].id}`, attachments)
      }
      return { noteData }
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
  
  const categories: CategorizedNotes = {}
  let allAttachments: string[] = []
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

  return json({ notes, topics, searchResults, query, queryParsed, categories, allAttachments, session }, {
    "Cache-Control": "public, s-maxage=60",
  })
}

export default function Index() {
  const { notes, topics, searchResults, queryParsed, categories, allAttachments } = useLoaderData()
  const actionData = useActionData()
  const noteInputRef = useRef()
  const [noteText, setNoteText] = useState('')
  const [queryIsDirty, setQueryIsDirty] = useState(false)
  const [searchQuery, setSearchQuery] = useState(queryParsed)
  const [showCategoryView, setShowCategoryView] = useState(true)

  useEffect(() => {
    if (actionData && actionData.noteData) {
      notes.push(actionData.noteData)
    }
  }, [notes, actionData])

  useEffect(() => {
    setNoteText('')
    setSearchQuery(queryParsed)
    setQueryIsDirty(false)
  }, [notes, queryParsed])

  return (
    <div className="w-full h-full max-md:h-min mt-16 mb-6 pb-6">
      <NoteEntryForm 
        error={actionData && actionData.error}
        noteText={noteText}
        setNoteText={setNoteText}
        noteInputRef={noteInputRef}
        topics={topics}
        showCategoryView={showCategoryView}
        setShowCategoryView={setShowCategoryView} 
      />
      <div className="flex max-md:flex-col h-full my-2 overflow-y-hidden max-md:overflow-y-scroll no-scrollbar gap-4">
        <div className={`w-1/3 max-md:w-full p-5 transition-height transition-width min-h-[400px] max-md:min-h-[200px] max-h-[1500px] max-md:max-h-[800px] rounded-lg overflow-hidden max-md:overflow-y-scroll no-scrollbar`}>
          {/* <div className={`flex flex-col ${showCategoryView ? 'w-1/3 max-md:px-0' : 'w-full p-0'} transition-width rounded-md max-md:w-full max-md:h-1/3`}> */}
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
        {/* </div> */}
        <CategoryGrid categories={categories} showCategoryView={showCategoryView} />
        <FilterPanel notes={notes} />
      </div>
    </div>
  );
}

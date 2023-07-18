import { useState } from 'react'
import SearchForm from './SearchForm'
import type { NoteData } from './Note'
import Note from './Note'

interface Props {
  searchQuery: string,
  setSearchQuery: Function,
  queryIsDirty: boolean,
  setQueryIsDirty: Function,
  topics: string[],
  searchResults: NoteData[],
}

export default function NotesSearch({ searchQuery, setSearchQuery, queryIsDirty, setQueryIsDirty, topics, searchResults }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const searchQueryWords = searchQuery.split(' ')
  const currentSearchQueryFragment = searchQueryWords[searchQueryWords.length - 1]
  const searchQueryTopicMatches = currentSearchQueryFragment ? topics.filter((topic: string) => topic.substring(0, currentSearchQueryFragment.length) === currentSearchQueryFragment) : []

  const updateQuery = (newQuery: string) => {
    setSearchQuery(newQuery)
    setQueryIsDirty(true)
  }

  return (
    <div className={`bg-gray-100 ${searchQuery && !queryIsDirty ? `h-[900px] max-md:h-[400px]` : `${searchQueryTopicMatches.length > 0 ? 'h-[84px] min-h-[84px]' : 'h-[48px] min-h-[48px]'}`} transition-height rounded-md overflow-hidden`}>
      <SearchForm
        updateQuery={updateQuery}
        searchQuery={searchQuery}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        queryIsDirty={queryIsDirty}
      />
      <div className={`flex gap-2 h-6 ${searchQueryTopicMatches.length > 0 ? 'opacity-100' : 'opacity-0'} transition mb-2 mx-2`}>
        {
          searchQueryTopicMatches && (
            searchQueryTopicMatches.map((topicMatch: string, index) => (
              <a href={`/${topicMatch.split(' ').join('+')}`} key={topicMatch}>
                <button key={topicMatch} type="button" className={`rounded-lg px-2 border-2 border-solid ${index !== 0 ? `border-gray-200` : `bg-gray-200 border-transparent` }`}>{topicMatch}</button>
              </a> 
            ))
          )
        }
      </div>
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
  )
}
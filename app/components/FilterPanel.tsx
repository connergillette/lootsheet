import Section from '~/components/Section'
import type { CategorizedNotes } from '~/routes/_index'
import { NoteData } from './Note'
import { useState } from 'react'
import NotesFeed from './NotesFeed'
import AssetGrid from './AssetGrid'
import SessionList from './SessionList'

interface Props {
  notes: NoteData[],
  sessions: object,
}

export default function FilterPanel ({ notes, sessions }: Props) {
  const [selectedFilter, setSelectedFilter] = useState('assets')

  const options = ['assets', 'sessions']

  return (
    <div className={`w-1/3 max-md:w-full p-5 transition-height transition-width min-h-[400px] max-md:min-h-[200px] max-h-[1500px] bg-gray-100 rounded-lg overflow-hidden max-md:overflow-y-scroll max-md:h-1/3 no-scrollbar`}>
      <div className="relative flex w-full gap-2 overflow-x-scroll no-scrollbar">
        {
          options.map((option) => {
            return (
              <button className={`${selectedFilter === option ? 'bg-gray-700 text-gray-100' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-600'} rounded-md px-2 py-1 transition h-min`} key={option} type="button" onClick={() => setSelectedFilter(option)}>{option}</button>
            )
          })
        }
      </div>
      <AssetGrid notes={notes} isShowing={selectedFilter === 'assets'} />
      <SessionList isShowing={selectedFilter === 'sessions'} sessions={sessions} />
    </div>
  )
}
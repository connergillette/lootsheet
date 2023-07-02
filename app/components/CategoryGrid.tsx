import Section from '~/components/Section'
import type { CategorizedNotes } from '~/routes/_index'
import { NoteData } from './Note'
import { useState } from 'react'
import NotesFeed from './NotesFeed'

interface Props {
  categories: CategorizedNotes,
  showCategoryView: boolean
}

export default function CategoryGrid({ categories, showCategoryView }: Props) {
  const [selectedCategory, setSelectedCategory] = useState('currency')

  const categoryColors = {
    currency: 'bg-yellow-400',
    loot: 'bg-orange-400',
    encounter: 'bg-red-400',
    information: 'bg-blue-400',
    general: 'bg-gray-300'
  }

  return (
    <div className={`${showCategoryView ? 'w-1/3 max-md:w-full p-5' : 'w-0 h-0 hidden'} transition-height transition-width min-h-[400px] max-h-[1500px] bg-gray-100 rounded-lg overflow-hidden max-md:overflow-y-scroll no-scrollbar`}>
      <div className="relative flex w-full gap-2 overflow-x-scroll no-scrollbar">
        {
          Object.keys(categoryColors).map((categoryName) => {
            const color : string = `${categoryColors[categoryName]} text-white`
            return (
              <button className={`hover:bg-gray-200 hover:text-gray-600 ${selectedCategory === categoryName ? color : ''} rounded-md px-2 py-1 transition h-min text-gray-600`} key={categoryName} type="button" onClick={() => setSelectedCategory(categoryName)}>{categoryName}</button>
            )
          })
        }
        {/* TODO: Add category management */}
        {/* <div className="flex grow justify-end">
          <button type="button" onClick={() => {}} className={`absolute opacity-100 hover:opacity-90 rounded-md px-4 py-2 transition h-min bg-gray-500 text-white`}>
            Manage
          </button>
        </div> */}
      </div>
      <NotesFeed notes={categories[selectedCategory]} showCategoryView={false} />
      {/* TODO: Repurpose / remove the grid category view */}
      {/* <div className={`grid grid-flow-row max-md:flex max-md:flex-col grid-cols-2 grid-rows-3 max-h-full`}>
        {
          Object.keys(categories).filter((categoryKey) => categoryKey === selectedCategory).map((categoryName: string) => {
            const category = categories[categoryName]
            return (
                <Section name={categoryName.toLocaleUpperCase()} items={category} key={categoryName} />
              )
            }
          )
        }
      </div> */}
    </div>
  )
}
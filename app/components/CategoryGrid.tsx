import Section from '~/components/Section'
import type { CategorizedNotes } from '~/routes/_index'
import { NoteData } from './Note'

interface Props {
  categories: CategorizedNotes,
  showCategoryView: boolean
}

export default function CategoryGrid({ categories, showCategoryView }: Props) {
  return (
    <div className={`${showCategoryView ? 'h-full w-2/3 max-md:w-full p-5' : 'w-0 h-0'} transition-height transition-width bg-gray-100 rounded-lg overflow-hidden`}>
      <div className="relative flex justify-end w-full">
        <button type="button" onClick={() => {}} className={`absolute opacity-100 hover:opacity-90 rounded-md px-4 py-2 transition h-min bg-gray-500 text-white`}>
          Manage
        </button>
      </div>
      <div className={`flex flex-wrap`}>
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
  )
}
import Section from '~/components/Section'
import { NoteData } from './Note'

interface Props {
  categories: object,
  showCategoryView: boolean
}

export default function CategoryGrid({ categories, showCategoryView }: Props) {
  return (
    <div className={`flex flex-wrap bg-gray-100 rounded-lg ${showCategoryView ? 'h-full w-2/3 max-md:w-full p-5' : 'w-0 h-0'} transition-height transition-width overflow-hidden`}>
      {
        Object.keys(categories).map((categoryName: string) => {
          const category = categories[categoryName]
          return (
            <Section name={categoryName.toLocaleUpperCase()} items={category} key={categoryName} />
          )
        })
      }
    </div>
  )
}
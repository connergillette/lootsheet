import { Form } from '@remix-run/react'

interface Props {
  searchQuery: string,
  isLoading: boolean,
  setIsLoading: Function,
  updateQuery: Function,
  queryIsDirty: boolean
}

export default function SearchForm({ searchQuery, isLoading, setIsLoading, updateQuery, queryIsDirty }: Props) {
  return (
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
        <a 
          href={`/${searchQuery.split(' ').join('+')}`}
          onClick={() => setIsLoading(true)}
          className={`bg-gray-600 text-white rounded-md px-4 max-md:px-2 \
            py-2 max-md:py-1 m-1 whitespace-nowrap transition-opacity \
            ${searchQuery ? 'opacity-100' : 'opacity-0 pointer-events-none'} \
            ${isLoading ? 'animate-pulse' : ''}`}
        >
          Go to topic
        </a>
      </div>
    </Form>
  )
}
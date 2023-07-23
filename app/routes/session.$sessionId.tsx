import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { createServerClient } from '@supabase/auth-helpers-remix'
import NotesFeed from '~/components/NotesFeed'

export const loader = async ({params, request}: LoaderArgs) => {
  const { sessionId } = params

  const response = new Response()

  const supabase = createServerClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_KEY || '',
    { request, response }
  )

  const { data: { session } } = await supabase.auth.getSession()

  const notesResponse = await supabase.from('notes').select().eq('user_id', session?.user.id).limit(10)

  const notes = notesResponse.data

  return json({ sessionId, notes, session })
}

export default function SessionDetail() {
  const { sessionId, notes, session } = useLoaderData()

  return (
    <div className="flex flex-col gap-6 px-2 my-20">
      <div>
        <h1 className="text-4xl font-bold">{sessionId}</h1>
        <h2 className="text-gray-400">01/02/2023</h2>
      </div>
      {/* <div className="flex max-md:flex-col gap-10 h-max"> */}
        {/* <div className={`w-1/3 max-md:w-full transition-height transition-width h-full max-md:min-h-[200px] max-md:max-h-[800px] rounded-lg overflow-hidden max-md:overflow-y-scroll no-scrollbar pb-10`}> */}
          <div className="flex gap-10">
            <div className="flex grow">
              Summary goes here.
            </div>
            <div className="w-1/3 h-[1400px]">
              <NotesFeed notes={notes} showCategoryView={false} />
            </div>
          </div>
        {/* </div> */}
      {/* </div> */}
    </div>
  )
}
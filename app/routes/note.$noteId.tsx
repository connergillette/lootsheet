import { LoaderArgs, json } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { createServerClient } from '@supabase/auth-helpers-remix'
import DeleteButton from '~/components/DeleteButton'

export const loader = async ({ params, request }: LoaderArgs) => {
  const response = new Response()
  // an empty response is required for the auth helpers
  // to set cookies to manage auth

  const supabase = createServerClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_KEY || '',
    { request, response }
  )
  const { data: { session }} = await supabase.auth.getSession()

  if (session) {
    const noteId = params['noteId']

    const noteResponse = await supabase.from('notes').select().eq('id', noteId)
    let note = {}
    if (!noteResponse.error) {
      note = noteResponse.data[0]
    }

    return json({ note })
  }
  return json({})
}

export default function NoteDetail() {
  const { note } = useLoaderData()

  return (
    <div className="w-full h-full max-md:h-min mt-16 mb-6 pb-6">
      <div className="flex">
        <div className="flex whitespace-nowrap opacity-50 w-full">
          <div className="self-center">{new Date(note.created_at).toLocaleString()}</div>
        </div>
        <div className="flex gap-4 w-full justify-end">
          <button>Edit</button>
          <button>Categorize</button>
          <Form action={`note/${note.id}/destroy`} method="post" onSubmit={(event) => {
            const response = confirm("Are you sure you want to delete this note?")
            if (!response) {
              event.preventDefault()
            }
          }}>
            <DeleteButton />
          </Form>
        </div>
      </div>
      <pre className="max-w-full whitespace-pre-line py-10">{note.text}</pre>
    </div>
  )
}
import { ActionArgs, redirect } from '@remix-run/node'
import { createServerClient } from '@supabase/auth-helpers-remix'

export const action = async ({ params, request }: ActionArgs) => {
  const response = new Response()

  const supabase = createServerClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_KEY || '',
    { request, response }
  )

  const { data: { session }} = await supabase.auth.getSession()
  if (session) {
    const noteId = params['noteId']

    const deleteResponse = await supabase.from('notes').delete().eq('id', noteId)
    if (!deleteResponse.error) {
      return redirect('/')
    }
  }
}
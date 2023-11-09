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
    const formData = await request.formData()
    const noteContents = formData.get('noteContents')?.toString() || ''

    const updateResponse = await supabase.from('notes').update({ text: noteContents }).eq('id', noteId)
    if (!updateResponse.error) {
      return redirect(`/note/${noteId}`);
    } else {
      return updateResponse.error
    }
  }
}
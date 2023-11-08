import type { ActionArgs } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import { createServerClient } from '@supabase/auth-helpers-remix'
import { useEffect, useState } from 'react';
import Button from '~/components/Button'

export const action = async ({ request }: ActionArgs) => {
  const data = await request.formData()

  const response = new Response()

  const supabase = createServerClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_KEY || '',
    { request, response }
  )

  const password = data.get('password')
  const confirmPassword = data.get('confirmPassword')

  if (password !== confirmPassword) {
    return { error: 'Password confirmation does not match.' }
  }

  const loginResponse = supabase.auth.signUp({ email: data.get('email'), password: data.get('password') })
  if ((await loginResponse).data.user) {
    return { success: true }
  }

  return { error: 'Something went wrong.' }
}

export default function Register() {
  const data = useActionData()
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {    
    if (data) {
      setSuccess(data.success || '')
      setError(data.error || '')
    }
    setIsLoading(false)
  }, [data])

  return (
    <div className="flex flex-col mx-auto my-10 max-md:w-10/12 w-8/12">
      <Form method="post" onSubmit={() => setIsLoading(true)}>
        <div className="mx-auto flex flex-col gap-10 max-w-[600px]">
          <div className={`text-green-400 text-center ${success ? 'opacity-100 h-full' : 'opacity-0 h-0 pointer-events-none'} transition`}>
            <h2 className="text-5xl my-10">Success!</h2>
            <span className="text-xl">Please click on the link that was just sent to your email to finish signing up.</span>
          </div>
          {
            !success && (
              <>
                <span className={`text-red-400 text-center ${error ? 'opacity-100' : 'opacity-0'} transition`}>{error}</span>
                <h1 className="text-4xl">Sign up</h1>
                <div className="flex flex-col gap-2">
                  <span>Email</span>
                  <input name="email" className="h-10 px-4 py-2 bg-gray-100 rounded-md text-black" required></input>
                </div>
                <div className="flex flex-col gap-2">
                  <span>Password</span>
                  <input name="password" type="password" className="h-10 px-4 py-2 bg-gray-100 rounded-md text-black" required></input>
                </div>
                <div className="flex flex-col gap-2">
                  <span>Confirm Password</span>
                  <input name="confirmPassword" type="password" className="h-10 px-4 py-2 bg-gray-100 rounded-md text-black" required></input>
                </div>
                <div className="max-w-4xl">
                  <Button type="submit" isLoading={isLoading}>Register</Button>
                </div>
              </>
            )
          }
        </div>
      </Form>
    </div>
  )
}

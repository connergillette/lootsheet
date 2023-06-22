import { Form } from '@remix-run/react'
import { useState } from 'react'

interface Props {
  session?: object
}

export default function Nav({ session }: Props) {
  const [hoverColor, setHoverColor] = useState('')
  const colors : string[] = ['text-yellow-400', 'text-orange-400', 'text-red-400', 'text-blue-400', 'text-gray-300']

  const onHover = () => {
    setHoverColor(colors[(Math.floor(Math.random() * 5))])
  }

  return (
    <div className="flex mx-auto align-middle">
      <a href="/" onMouseEnter={onHover} onMouseLeave={() => setHoverColor('')}>
        <div className={`font-bold text-2xl align-middle py-2 ${hoverColor ? hoverColor : ''} transition`}>lootsheet</div>
      </a>
      {/* TODO: Determine navbar buttons */}
      <div className="flex justify-end gap-2 grow">
        {
          !session && (
            <>
              <a href="/login" className={`hover:bg-gray-100 rounded-md px-4 py-2 transition h-min`}>Log in</a>
              <a href="/register" className={`hover:bg-gray-500 bg-gray-600 text-white rounded-md px-4 py-2 transition h-min`}>Sign up</a>
            </>
          )
        }
        {
          session && (
            <Form method="post" action="/logout">
              <button type="submit" className={`hover:bg-gray-100 rounded-md px-4 py-2 transition h-min`}>Log out</button>
            </Form>
          )
        }
      </div>
    </div>
  )
}
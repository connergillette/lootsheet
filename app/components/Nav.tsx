import { Form } from '@remix-run/react'
import { useState } from 'react'

interface Props {
  signOut: Function,
  session?: object
}

export default function Nav({ signOut, session }: Props) {
  const [hoverColor, setHoverColor] = useState('')
  const colors : string[] = ['text-yellow-400', 'text-orange-400', 'text-red-400', 'text-blue-400', 'text-gray-300']

  const onHover = () => {
    setHoverColor(colors[(Math.floor(Math.random() * 5))])
  }

  return (
    <div className="flex mx-auto align-middle">
      <a href="/" onMouseEnter={onHover} onMouseLeave={() => setHoverColor('')}>
        <div className={`font-bold text-2xl align-middle py-2 px-4 ${hoverColor ? hoverColor : 'text-gray-500'} transition`}>lootsheet</div>
      </a>
      {/* TODO: Determine navbar buttons */}
      <div className="flex justify-end align-middle gap-2 grow">
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
            <>
              <button className={`hover:bg-gray-200 bg-gray-100 hover:text-black rounded-md px-4 py-2 transition h-min text-gray-600`}>+</button>
              <button className={`hover:bg-gray-100 hover:text-black rounded-md px-4 py-2 transition h-min text-gray-600`}>Work</button>
              <button className={`hover:bg-gray-100 hover:text-black rounded-md px-4 py-2 transition h-min text-gray-600`}>Personal</button>
              <button className={`hover:bg-gray-100 hover:text-black rounded-md px-4 py-2 transition h-min text-gray-600`}>Pathfinder</button>
              <div className="w-1 border-l-2 border-solid border-gray-100 align-middle h-1/2 my-2"></div>
              <button className={`hover:bg-gray-100 hover:text-black rounded-md px-4 py-2 transition h-min text-gray-300`} onClick={() => signOut()}>Log out</button>
            </>
          )
        }
      </div>
    </div>
  )
}
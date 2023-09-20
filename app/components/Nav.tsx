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
    <div className="fixed flex align-middle w-8/12 min-w-[900px] max-md:w-11/12 max-md:min-w-[300px] mx-auto h-14 z-20">
      <a href="/" className="py-3" onMouseEnter={onHover} onMouseLeave={() => setHoverColor('')}>
        <div className={`font-bold text-xl align-middle py-1 px-4 ${hoverColor ? hoverColor : 'text-gray-700'} transition`} data-gktag="gk-01-03">lootsheet</div>
      </a>
      {/* TODO: Determine navbar buttons */}
      <div className="flex justify-end align-middle gap-2 grow py-2">
        {
          !session && (
            <>
              <a href="/login" className={`hover:bg-gray-100 rounded-md px-4 py-2 transition h-min`} data-gktag="gk-01-01">Log in</a>
              <a href="/register" className={`hover:bg-yellow-300 bg-yellow-400 hover:text-gray-800 text-gray-900 rounded-md px-4 py-2 transition h-min font-bold`}>Sign up</a>
            </>
          )
        }
        {
          session && (
            <>
              {/* <button className={`hover:bg-gray-200 bg-gray-100 hover:text-black rounded-md px-4 py-2 transition h-min text-gray-600`}>+</button>
              <button className={`hover:bg-gray-100 hover:text-black rounded-md px-4 py-2 transition h-min text-gray-600`}>Work</button>
              <button className={`hover:bg-gray-100 hover:text-black rounded-md px-4 py-2 transition h-min text-gray-600`}>Personal</button>
              <button className={`hover:bg-gray-700 bg-gray-600 text-white rounded-md px-4 py-2 transition h-min`}>Pathfinder</button>
              <div className="w-1 border-l-2 border-solid border-gray-100 align-middle h-1/2 my-2"></div> */}
              <button className={`hover:bg-gray-100 hover:text-black rounded-md px-4 py-2 transition h-min text-gray-600`} onClick={() => signOut()}>Log out</button>
            </>
          )
        }
      </div>
    </div>
  )
}
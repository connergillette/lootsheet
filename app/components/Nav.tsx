import { useState } from 'react'

export default function Nav() {
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
      {/* <div className="flex justify-end gap-2 grow">
        <button type="button" className={`hover:bg-gray-100 rounded-md px-4 py-2 transition`}>Feed</button>
        <button type="button" className={`hover:bg-gray-100 rounded-md px-4 py-2 transition`}>Categories</button>
      </div> */}
    </div>
  )
}
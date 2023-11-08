import { useState } from 'react'

export default function DeleteButton() {
  const [isConfirming, setIsConfirming] = useState(false)

  return (
    // <button className={`${!isConfirming ? 'text-red-600 bg-transparent' : 'bg-red-600 text-white'} transition px-2 py-1 rounded-md whitespace-nowrap`} onClick={() => setIsConfirming(true)}>
    //   {
    //     !isConfirming ? 'Delete' : 'Confirm Delete'
    //   }
    // </button>
    <button className={`text-red-600 bg-transparent hover:text-white hover:bg-red-600 transition px-2 py-1 rounded-md whitespace-nowrap font-bold`} onClick={() => setIsConfirming(true)}>
      Delete
    </button>
  )
}
import { useState } from 'react'

interface Params {
  url: string,
  aspect?: string,
}

export default function Image({ url, aspect }: Params) {
  const [imageIsLoading, setImageIsLoading] = useState(true)

  return (
    <a href={url} target="_blank" rel="noreferrer" className={`justify-end ${imageIsLoading ? 'bg-gray-100 animate-pulse' : ''}`} >
      <img src={url} alt="Note attachment" className={`object-cover ${aspect ? aspect : 'aspect-auto'} hover:scale-105 transition rounded-lg bg-gray-100 ${imageIsLoading ? 'opacity-0' : 'opacity-100'}`} loading="lazy" onLoad={() => setImageIsLoading(false)}/>
    </a>
  )
}
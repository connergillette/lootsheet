import { useEffect, useState } from 'react'
import Image from './Image'
import SectionHeader from './SectionHeader'
import { NoteData } from './Note'
import { useOutletContext } from '@remix-run/react'

interface Params {
  notes: NoteData[]
}

export default function AssetGrid ({ notes }: Params) {
  const { supabase } = useOutletContext()
  const [attachments, setAttachments] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const { data: { session }} = await supabase.auth.getSession()

      const allAttachments = []
      const notesWithAttachments = notes.filter((note: NoteData) => note.has_attachment)
      for (const note of notesWithAttachments) {
        const file = await supabase.storage.from('note_attachments').createSignedUrl(`${session.user.id}/${note.id}`, 60, {
          transform: {
            width: 100,
            height: 100
          }
        })
        if (file && file.data) {
          note.attachment = file.data.signedUrl
          allAttachments.push(file.data.signedUrl)
        }
      }
      setAttachments(allAttachments)
      setIsLoading(false)
    })()
  }, [notes])

  return (
    <div className="w-1/3 max-md:w-full h-full bg-gray-100 rounded-lg p-5">
      <SectionHeader>Assets</SectionHeader>
      {
        isLoading && (
          <div className="text-center w-full text-lg animate-pulse my-10">
            Loading assets...
          </div>
        )
      }
      {
        !isLoading && attachments.length > 0 && (
          <div className="w-full grid grid-flow-row grid-cols-3 gap-2 pt-2">
            {
              attachments.map((url) => (
                <div className="w-full h-full overflow-hidden rounded-lg" key={url} >
                  <Image url={url} aspect="aspect-square" />
                </div>
              ))
            }
          </div>
        )
      }
      {
        !isLoading && attachments.length === 0 && (
          <div className="text-center w-full opacity-70 my-10">
            No assets yet. Images attached to notes will appear here.
          </div>
        )
      }
    </div>
  )
}
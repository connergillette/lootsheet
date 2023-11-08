import { useEffect, useState } from 'react'
import Image from './Image'
import { Form, useOutletContext } from '@remix-run/react'
import DeleteButton from './DeleteButton'

export const categoryColors : object = {
  currency: 'bg-yellow-400',
  loot: 'bg-orange-400',
  encounter: 'bg-red-400',
  information: 'bg-blue-400',
  event: 'bg-gray-300',
  general: 'bg-gray-300'
}
export interface NoteData {
  id: number,
  created_at: Date,
  text: string,
  inferred_type: string,
  attachment?: string,
  has_attachment?: boolean
}

export interface NewNote {
  text: string,
  user_id: string,
  inferred_type?: string,
  has_attachment: boolean
}

interface Props {
  data: NoteData,
  query?: string,
}

export default function Note({ data, query }: Props) {
  const { supabase } = useOutletContext()
  const [attachmentUrl, setAttachmentUrl] = useState()
  const [showToolbar, setShowToolbar] = useState(false)

  useEffect(() => {
    (async () => {
      if (data.has_attachment) {
        const {data: { session } } = await supabase.auth.getSession()

        const file = await supabase.storage.from('note_attachments').createSignedUrl(`${session.user.id}/${data.id}`, 60, {
          // TODO: This only works on a Supabase Pro project
          // transform: {
          //   width: 100,
          //   height: 100
          // }
        })
        if (file && file.data) {
          setAttachmentUrl(file.data.signedUrl)
        }
      }
    })()
  }, [data, supabase])

  let highlightedText = <span>{data.text}</span>

  if (query) {
    const split = data.text.split(query)
    const highlighted = <span className="text-blue-400" key={`match${data.id}`}>{query}</span>
    highlightedText = (
      <span>
        {
          split.map((segment, index) => (
            <span key={`resultId${data.id}-segment${index}`}>{segment}</span>
          )).reduce((prev, curr) => [prev, highlighted, curr])
        }
      </span>
    )
  }

      return (
        <div className="flex w-full max-h-36 overflow-hidden" onMouseOver={() => setShowToolbar(true)} onMouseLeave={() => setShowToolbar(false)}>
          <div className={`
            flex w-2 rounded-md h-3/4 my-auto \
            ${categoryColors[data.inferred_type]} \
            `}>
          </div>
          <div
            // TODO: Implement better color-coding implementation based on category
            className={`
            w-full flex flex-col gap-2 py-2 px-4 \
            my-2 rounded-md h-full \
            `}
          >
            <a href={`/note/${data.id}`}>
            <div className="flex w-full gap-2">
              <div className="flex flex-col grow w-full">
                <div className="flex text-xs max-md:-z-10 w-full">
                  <span className="w-full">{new Date(data.created_at).toDateString()}</span>
                  <div className={`flex gap-2 ${showToolbar ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity z-10`}>
                    <Form action={`note/${data.id}/destroy`} method="post" onSubmit={(event) => {
                      const response = confirm("Are you sure you want to delete this note?")
                      if (!response) {
                        event.preventDefault()
                      }
                    }}>
                      <DeleteButton />
                    </Form>
                    <button>Edit</button>
                    <button>Categorize</button>
                  </div>
                </div>
                
                  <div className="w-full">{highlightedText}</div>
                
              </div>
              {
                data.has_attachment && (
                  <a href={attachmentUrl} target="_blank" rel="noreferrer">
                    <div className="h-min w-24 overflow-hidden rounded-lg place-self-center object-fill bg-gray-100">
                      {
                        attachmentUrl && (
                          <Image url={attachmentUrl} aspect={'aspect-square'} />
                        )
                      }
                    </div>
                  </a>
                )
              }
            </div>
          </a>
        </div>
      </div>
  )
}
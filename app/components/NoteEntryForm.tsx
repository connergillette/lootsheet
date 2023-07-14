import { Form } from '@remix-run/react'
import { MutableRefObject, useEffect, useMemo, useRef, useState } from 'react'

interface Props {
  error?: string,
  topics: string[],
  noteText: string,
  setNoteText: Function,
  noteInputRef: MutableRefObject<any>,
  showCategoryView: boolean,
  setShowCategoryView: Function
}

export default function NoteEntryForm({ noteText, setNoteText, noteInputRef, topics, showCategoryView, setShowCategoryView, error }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const noteTextWords = noteText.split(' ')
  const currentNoteFragment = noteTextWords[noteTextWords.length - 1]
  const noteTopicMatches = currentNoteFragment ? topics.filter((topic: string) => topic.substring(0, currentNoteFragment.length) === currentNoteFragment) : []
  const formRef = useRef()

  useEffect(() => {
    setIsSubmitting(false)
  }, [noteText])

  const autocomplete = (fragment: string) => {
    noteTextWords[noteTextWords.length - 1] = fragment + ' '
    setNoteText(noteTextWords.join(' '))
    noteInputRef.current?.focus()
  }

  const handleInputKey = (e) => {
    if (e.keyCode === 13 && e.shiftKey === false) {
      if (formRef.current) {
        formRef.current.submit()
        setIsSubmitting(true)
      }
    }
  }

  return (
    <>
      {error && <pre className="text-red-500">{error.toString()}</pre>}
      <Form method="post" encType="multipart/form-data" onSubmit={() => setIsSubmitting(true)} className="flex flex-col gap-2" ref={formRef}>
        <div className={`flex w-full rounded-lg transition-colors ${isSubmitting ? 'animate-pulse bg-gray-100' : ''}`}>
          <div className="grow w-full">
            <textarea name="text"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="rounded-md py-2 px-4 w-full max-w-full bg-transparent focus:outline-none resize-none text-lg h-20 whitespace-break-spaces no-scrollbar"
              placeholder="Write a note here."
              onKeyDown={(e) => handleInputKey(e)}
              ref={noteInputRef}
              autoFocus
              disabled={isSubmitting}
            />
          </div>
          <div className="flex flex-col">
            <button type="submit" className={`bg-gray-600 text-white rounded-md px-4 max-md:px-2 py-2 max-md:py-1 m-1 h-min whitespace-nowrap transition-opacity ${noteText && !isSubmitting ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>Save Note</button>
          </div>
        </div>
        <div className="flex max-md:flex-col max-md:gap-4 px-4 max-md:px-0">
          <div className={`flex grow gap-2 h-6 ${noteTopicMatches.length > 0 ? 'opacity-100' : 'opacity-0'} transition w-full`}>
            {
              noteTopicMatches && (
                noteTopicMatches.map((topicMatch: string) => <button key={topicMatch} type="button" className="bg-gray-200 rounded-lg px-2 w-max" onClick={() => autocomplete(topicMatch)}>{topicMatch}</button>)
              )
            }
          </div>
          <div className="flex justify-end max-md:justify-normal gap-2 align-middle w-full">
            <input name="attachments" type="file" accept='image/*' alt="Image upload" className={`self-center bg-gray-100 rounded-md px-2 py-1 h-full whitespace-nowrap transition-opacity`} />
            {/* <button type="button" onClick={() => {setShowCategoryView(!showCategoryView)}} className={`opacity-100 hover:opacity-90 rounded-md px-4 py-2 transition h-min ${showCategoryView ? 'bg-gray-600 text-white': 'bg-gray-100 text-gray-600'} whitespace-nowrap`} disabled={isSubmitting}>
              {showCategoryView ? 'Hide Categories' : 'Show Categories'}
            </button> */}
          </div>
        </div>
      </Form>
    </>
  )
}
interface Props {
  isShowing: boolean,
  sessions: object,
}

export default function SessionList({ isShowing, sessions }: Props) {
  return (
    <div className={`h-full bg-gray-100 rounded-lg ${isShowing ? `opacity-100` : `opacity-0 hidden`} transition-opacity overflow-y-scroll no-scrollbar pb-10`}>
      <div className="flex flex-col gap-4 pt-2">
        {
          Object.keys(sessions).map((sessionDate) => {
            const sessionNoteCount = sessions[sessionDate].length
            return (
              <div className="flex h-12 w-full bg-gray-300 rounded-md px-4 items-center" key={sessionDate}>
                <div className="grow">
                  {sessionDate}
                </div>
                <div>
                  {sessionNoteCount}
                </div>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}
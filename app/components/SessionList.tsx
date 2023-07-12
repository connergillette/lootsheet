interface Props {
  isShowing: boolean
}

export default function SessionList({ isShowing }: Props) {
  return (
    <div className={`h-full bg-gray-100 rounded-lg ${isShowing ? `opacity-100` : `opacity-0 hidden`} transition-opacity`}>
      <div className="flex flex-col gap-4 pt-2">
        {/* TODO: Replace this with actual session entries (notes grouped by day) */}
        <div className="h-12 w-full bg-gray-300 rounded-md"></div>
        <div className="h-12 w-full bg-gray-300 rounded-md"></div>
        <div className="h-12 w-full bg-gray-300 rounded-md"></div>
        <div className="h-12 w-full bg-gray-300 rounded-md"></div>
      </div>
    </div>
  )
}
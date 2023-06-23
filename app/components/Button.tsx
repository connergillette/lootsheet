interface Props {
  isLoading: boolean,
  type?: string
}

export default function Button ({ isLoading, type }: Props) {
  return (
    <button type="submit" className={`px-4 py-2 rounded-md bg-gray-600 text-white ${isLoading ? 'opacity-40' : ''}`} disabled={isLoading}>Register</button>
  )
}
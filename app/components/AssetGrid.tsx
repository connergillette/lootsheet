import Image from './Image'
import SectionHeader from './SectionHeader'

interface Params {
  attachments: string[]
}

export default function AssetGrid ({ attachments }: Params) {
  return (
    <div className="w-1/3 max-md:w-full h-full bg-gray-100 rounded-lg p-5">
      <SectionHeader>Assets</SectionHeader>
      {
        attachments.length > 0 && (
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
        attachments.length === 0 && (
          <div className="text-center w-full opacity-70">
            No assets yet. Images attached to notes will appear here.
          </div>
        )
      }
    </div>
  )
}
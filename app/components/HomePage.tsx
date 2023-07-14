import HeroImage from '~/assets/hero.png'

export default function HomePage () {
  return (
    <div className="flex flex-col my-20 max-md:my-10 gap-5 content-center">
      <h1 className="text-center text-gray-900 text-8xl max-lg:text-6xl max-md:text-4xl font-bold">The easiest way to take notes in TTRPGs.</h1>
      {/* <ul className="flex w-1/2 self-center text-gray-600">
        <li className="grow text-center">Dungeons & Dragons</li>
        <li className="grow text-center">Pathfinder</li>
        <li className="grow text-center">Cyberpunk Red</li>
        <li className="grow text-center">and more!</li>
      </ul> */}
      <img src={HeroImage} className="border-solid border-2 border-gray-200 rounded-lg" alt="An example usage of the note-taking tool Lootsheet" />
    </div>
  )
}
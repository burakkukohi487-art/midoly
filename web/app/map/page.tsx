import Navigation from "../components/navigation";

export default function Home() {
  return (
    <main className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white w-full h-dvh sm:max-w-md sm:shadow-md">
        <div className="flex flex-col h-full">
          <div className="flex-1 bg-green-300">
            map表示用の枠
          </div>
          <Navigation />
        </div>
      </div>
    </main>
  )
}
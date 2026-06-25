import Navigation from "../components/navigation";

export default function Home() {
    return (
        <main className="min-h-screen flex justify-center items-center bg-gray-100">
            <div className="bg-white w-full h-dvh sm:max-w-md sm:shadow-md">
                <div className="flex flex-col h-full">
                    <div className="flex-1 p-4">
                        <h1 className="text-lg mb-8 font-bold">アカウント</h1>
                        <div>アカウント情報</div>
                    </div>
                    <Navigation />
                </div>
            </div>
        </main>
    )
}
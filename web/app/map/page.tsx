"use client";

import Navigation from "../components/navigation";
import dynamic from "next/dynamic"
const Map = dynamic(() => import("../components/map"), { ssr: false })


export default function Home() {
  return (
    <main className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white w-full h-dvh sm:max-w-md sm:shadow-md">
        <div className="flex flex-col h-full">
          <div className="flex-1">
            <Map />
          </div>
          <Navigation />
        </div>
      </div>
    </main>
  )
}
"use client";

import Link from "next/link";
import Navigation from "@/app/components/navigation";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
    const [roomName, setRoomName] = useState("");
    const [error, setError] = useState("");

    const router = useRouter();

    const handleRoomCreate = async () => {
        if (!roomName) return;
        const res = await fetch("http://localhost:8080/room/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: roomName }),
            credentials: "include",
        });

        if (res.ok) {
            setRoomName("");
            alert("ルーム作成が完了しました")
            router.push("/chat?type=group")
        } else {
            const message = await res.text();
            setError(message);
        }
    }

    return (
        <main className="min-h-screen flex justify-center items-center bg-gray-100">
            <div className="bg-white w-full h-dvh sm:max-w-md sm:shadow-md">
                <div className="flex flex-col h-full">
                    <div className="flex flex-col flex-1 p-4">
                        <h1 className="text-lg mb-8 font-bold">グループ作成画面</h1>
                        <Link href="/chat?type=group">戻る</Link>
                        <div className="flex flex-col flex-1 p-4 justify-center items-center">
                            {error && <p className="text-red-500 mt-2">{error}</p>}
                            <input
                                type="text"
                                placeholder="グループ名"
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleRoomCreate()}
                                className="w-full border border-gray-300 outline-none p-2 my-1 rounded-md"
                            />
                            <button
                                onClick={handleRoomCreate}
                                className="bg-green-600 text-white py-2 px-4 rounded-xl"
                            >
                                作成
                            </button>
                        </div>
                    </div>
                    <Navigation />
                </div>
            </div>
        </main>

    )
}
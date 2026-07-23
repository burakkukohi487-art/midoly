"use client";

import { use, useState } from "react";
import Navigation from "@/app/components/navigation";
import Link from "next/link"
import { useRouter } from "next/navigation";

export default function Home({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
    const chatTypeParams = use(searchParams);
    const chatType = chatTypeParams.type ?? "talk";

    const [inviteCode, setInviteCode] = useState("");
    const [error, setError] = useState("");

    const router = useRouter();

    const changeType = () => {
        if (chatType === "talk") {
            router.push("/chat?type=group");
        } else {
            router.push("/chat?type=talk");
        };
    }

    const handleRoomJoin = async () => {
        if (!inviteCode) return;

        const res = await fetch("http://localhost:8080/room/join", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ inviteCode }),
            credentials: "include",
        })

        if (res.ok) {
            alert("成功");      // 後で消す
            router.push("");    // 後で"/chat/group/[roomid]"に変更
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
                        <h1 className="text-lg mb-8 font-bold">チャット</h1>
                        <div className="rounded-2xl h-12 mx-4 p-1 bg-gray-100 shadow-md">
                            <button
                                className={`w-1/2 h-full rounded-xl cursor-pointer
                                    ${chatType === "talk" ? "bg-green-600 text-white" : "text-black"}`
                                }
                                onClick={changeType}
                            >
                                トーク
                            </button>
                            <button
                                className={`w-1/2 h-full rounded-xl cursor-pointer
                                    ${chatType === "group" ? "bg-green-600 text-white" : "text-black"}`
                                }
                                onClick={changeType}
                            >
                                グループ
                            </button>
                        </div>
                        {chatType === "talk"
                            ?
                            <div>
                                トーク画面
                            </div>

                            :
                            <div className="flex-1">
                                <div className="flex flex-col justify-center mt-10">
                                    <div className="flex flex-col my-4 justify-center items-center">
                                        <h2 className="text-center text-xl">招待コードで参加する</h2>
                                        {error && <p className="text-red-500 mt-2">{error}</p>}
                                        <input
                                            type="text"
                                            placeholder="招待コードを入力"
                                            value={inviteCode}
                                            onChange={(e) => setInviteCode(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleRoomJoin()}
                                            className="w-full border border-gray-300 outline-none p-2 my-4 rounded-md"
                                        />
                                        <button
                                            onClick={handleRoomJoin}
                                            className="bg-green-600 text-white p-2 rounded-xl cursor-pointer"
                                        >
                                            参加する
                                        </button>
                                    </div>
                                    <hr className="border-gray-300" />
                                    <div className="m-auto">
                                        <p className="text-center my-4">もしくは</p>
                                        <Link
                                            className="bg-green-600 text-white p-2 rounded-xl"
                                            href={"/chat/room/create"}
                                        >
                                            新しくグループを作成する
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                    <Navigation />
                </div>
            </div>
        </main>
    )
}
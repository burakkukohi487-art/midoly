"use client";

import { useState } from "react";
import Navigation from "../components/navigation";

type ChatType = "talk" | "group";

export default function Home() {
    const [chatType, setChatType] = useState<ChatType>("talk");

    const changeType = () => {
        if (chatType === "talk") {
            setChatType("group");
        } else {
            setChatType("talk");
        };
    }

    return (
        <main className="min-h-screen flex justify-center items-center bg-gray-100">
            <div className="bg-white w-full h-dvh sm:max-w-md sm:shadow-md">
                <div className="flex flex-col h-full">
                    <div className="flex-1 p-4">
                        <h1 className="text-lg mb-8 font-bold">チャット</h1>
                        <div className="rounded-2xl flex-1 h-12 mx-4 p-1 bg-gray-100 shadow-md">
                            <button
                                className={`w-1/2 h-full rounded-xl
                                    ${chatType === "talk" ? "bg-green-600 text-white" : "text-black"}`
                                }
                                onClick={changeType}
                            >
                                トーク
                            </button>
                            <button
                                className={`w-1/2 h-full rounded-xl
                                    ${chatType === "group" ? "bg-green-600 text-white" : "text-black"}`
                                }
                                onClick={changeType}
                            >
                                グループ
                            </button>
                        </div>
                        {chatType === "talk"
                        ? <div>トーク画面</div>
                        : <div>グループチャット画面</div>
                        }
                    </div>
                    <Navigation />
                </div>
            </div>
        </main>
    )
}
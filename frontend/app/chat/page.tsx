"use client";

import { use } from "react";
import Navigation from "@/app/components/navigation";
import Link from "next/link"
import { useRouter } from "next/navigation";

export default function Home({ searchParams }: { searchParams: Promise <{ type?: string }> }) {
    const chatTypeParams = use(searchParams);
    const chatType = chatTypeParams.type ?? "talk";

    const router = useRouter();

    const changeType = () => {
        if (chatType === "talk") {
            router.push("/chat?type=group");
        } else {
            router.push("/chat?type=talk");
        };
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
                                <div className="flex justify-center mt-10">
                                    <Link
                                        className="bg-green-600 text-white p-2 rounded-xl"
                                        href={"/chat/room/create"}
                                    >
                                        グループ作成
                                    </Link>
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
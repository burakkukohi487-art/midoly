"use client"

import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");

    const [showPass, setShowPass] = useState(false);

    const [error, setError] = useState("");

    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !pass) return;

        const res = await fetch("http://localhost:8080/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password: pass }),
            credentials: "include",
        });

        if (res.ok) {
            const data = await res.json();
            setError("");
            console.log(data)
            router.push("/map")
            alert("ログイン成功")
        } else {
            const message = await res.text();
            setError(message);
            return
        }
    }

    return (
        <main className="min-h-screen flex justify-center items-center bg-gray-100">
            <div className="bg-white w-full h-dvh sm:max-w-md sm:shadow-md">
                <a href="/map">マップへ</a>
                <div className="flex flex-1 h-full justify-center items-center">
                    <div className="w-full p-4 justify-center">
                        <h1 className="text-2xl mb-8 font-bold text-center">ログインページ</h1>
                        {error && <p className="text-red-500 mt-2">{error}</p>}
                        <input
                            type="text"
                            placeholder="メールアドレス"
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                            className="w-full border border-gray-300 outline-none p-2 my-1 rounded-md"
                        />
                        <div className="relative">
                            <input
                                type={showPass ? "text" : "password"}
                                placeholder="パスワード"
                                onChange={(e) => setPass(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                                className="w-full border border-gray-300 outline-none p-2 my-1 rounded-md"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                            >
                                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <div className="flex justify-center mt-4">
                            <button
                                type="submit"
                                onClick={handleLogin}
                                className="py-2 px-3 bg-green-400 rounded-md text-white hover:bg-green-500 transition-colors"
                            >
                                ログイン
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

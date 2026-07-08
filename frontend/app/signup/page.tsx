"use client"

import { Eye, EyeOff, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import LoadingSpinner from "../components/loadingSpinner";

export default function Home() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");

    const [showPass, setShowPass] = useState(false);

    const [error, setError] = useState("");

    const [loading, setLoading] = useState(true);

    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
            const res = await fetch("http://localhost:8080/me", {
                credentials: "include",
            });
            const data = await res.json();

            if (data.loggedIn) {
                router.push("/map");
                return;
            }

            setLoading(false);
        };

        checkSession();
    }, [router])

    const handleSignup = async () => {
        if (!name || !email || !pass) return;

        if (confirm(`名前：${name}\nメールアドレス：${email}\nこの情報で登録しますか？`)) {
            const res = await fetch("http://localhost:8080/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password: pass }),
                credentials: "include",
            });

            if (res.ok) {
                const data = await res.json();
                setError("");
                console.log(data)
                router.push("/map")
                alert("登録完了")
            } else {
                const message = await res.text();
                setError(message);
                return
            }
        } else {
            return
        }
    }

    if (loading) return <div className="bg-white min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;

    return (
        <main className="min-h-screen flex justify-center items-center bg-gray-100">
            <div className="bg-white w-full h-dvh sm:max-w-md sm:shadow-md p-4">
                <Link
                    href="/"
                    className="flex items-center text-xl absolute"
                >
                    <ChevronLeft />戻る
                </Link>
                <div className="flex flex-1 h-full justify-center items-center">
                    <div className="w-full p-4 justify-center">
                        <h1 className="text-2xl mb-8 font-bold text-center">新規登録</h1>
                        {error && <p className="text-red-500 mt-2">{error}</p>}
                        <input
                            type="text"
                            placeholder="名前"
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                            className="w-full border border-gray-300 outline-none p-2 my-1 rounded-md"
                        />
                        <input
                            type="text"
                            placeholder="メールアドレス"
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                            className="w-full border border-gray-300 outline-none p-2 my-1 rounded-md"
                        />
                        <div className="relative">
                            <input
                                type={showPass ? "text" : "password"}
                                placeholder="パスワード"
                                onChange={(e) => setPass(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSignup()}
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
                        <div className="flex justify-center mt-4 gap-6">
                            <button
                                type="submit"
                                onClick={handleSignup}
                                className="py-2 px-6 bg-green-400 rounded-md text-white hover:bg-green-500 transition-colors cursor-pointer"
                            >
                                登録
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

"use client"

import { Map, MessageCircle, MapPin, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
    { href: "/map", icon: Map, label: "マップ" },
    { href: "/chat", icon: MessageCircle, label: "チャット" },
    { href: "/meetup", icon: MapPin, label: "集合" },
    { href: "/account", icon: User, label: "アカウント" },
]

export default function Navigation() {
    const pathname = usePathname()

    return (
        <nav className="flex justify-around bg-white py-3">
            {navItems.map(({ href, icon: Icon, label }) => {
                const isActive = pathname.includes(href)
                return (
                    <Link
                        key={href}
                        href={href}
                        className={`w-20 flex flex-col items-center hover:scale-110 transition-transform duration-150
                            ${isActive ? "text-green-600 font-bold" : "text-gray-500"}`
                        }>
                        <Icon size={24} />
                        <span className="text-sm">{label}</span>
                    </Link>
                )
            })}
        </nav>
    )
}
'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FiHome, FiBox, FiDollarSign, FiSettings, FiLogOut, FiShoppingBag, FiMessageSquare, FiTag, FiGift, FiClock } from 'react-icons/fi'

export default function SellerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    const isLoginPage = pathname === '/seller/login'

    if (isLoginPage) {
        return <div className="min-h-screen bg-white">{children}</div>
    }

    const links = [
        { href: '/seller', label: 'Panel Özeti', icon: FiHome },
        { href: '/seller/products', label: 'Ürün Yönetimi', icon: FiBox },
        { href: '/seller/orders', label: 'Siparişler', icon: FiShoppingBag },
        { href: '/seller/campaigns', label: 'Kampanyalar', icon: FiTag },
        { href: '/seller/coupons', label: 'Kuponlar', icon: FiGift },
        { href: '/seller/deals', label: 'Günün Fırsatları', icon: FiClock },
        { href: '/seller/questions', label: 'Müşteri Soruları', icon: FiMessageSquare },
        { href: '/seller/finance', label: 'Finans', icon: FiDollarSign }, // Placeholder
        { href: '/seller/settings', label: 'Ayarlar', icon: FiSettings }, // Placeholder
    ]

    return (
        <div className="min-h-screen bg-white text-gray-900 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-green-600">Satıcı Paneli</h1>
                    <p className="text-xs text-gray-500 mt-1">Mağaza Yönetimi</p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {links.map(link => {
                        const isActive = pathname === link.href
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${isActive
                                    ? 'bg-green-50 text-green-600'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <link.icon className="text-lg" />
                                {link.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <Link href="/" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-gray-900 transition">
                        <FiLogOut />
                        Mağazaya Dön
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}

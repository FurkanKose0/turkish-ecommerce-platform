'use client'

import { useState, useEffect } from 'react'
import { FiHeadphones, FiMessageSquare, FiMail, FiSearch } from 'react-icons/fi'
import Link from 'next/link'
import ChatWidget from '@/components/ChatWidget'

export default function SupportPage() {
    const [isChatOpen, setIsChatOpen] = useState(false)

    // URL hash kontrolü (#chat)
    useEffect(() => {
        if (typeof window !== 'undefined' && window.location.hash === '#chat') {
            setIsChatOpen(true)
        }
    }, [])

    return (
        <div className="bg-gray-50 min-h-screen py-16 text-gray-800">
            {/* Header */}
            <div className="container mx-auto px-4 max-w-5xl text-center mb-16">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Size Nasıl Yardımcı Olabiliriz?</h1>

                <div className="relative max-w-2xl mx-auto mt-8">
                    <input
                        type="text"
                        placeholder="Sorunuzu arayın (ör: kargo takibi, iade...)"
                        className="w-full pl-12 pr-4 py-4 rounded-full border-none shadow-lg focus:ring-2 focus:ring-green-500 outline-none text-gray-700"
                    />
                    <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-5xl">
                {/* Grid of Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <div onClick={() => setIsChatOpen(true)} className="cursor-pointer h-full">
                        <SupportCard
                            icon={<FiMessageSquare />}
                            title="Canlı Destek"
                            desc="Müşteri temsilcimizle anında yazışmaya başlayın."
                            action="Sohbeti Başlat"
                            primary
                        />
                    </div>
                    <SupportCard
                        icon={<FiMail />}
                        title="Bize Yazın"
                        desc="Sorularınızı detaylıca anlatın, e-posta ile dönelim."
                        action="Formu Doldur"
                        href="/contact"
                    />
                    <SupportCard
                        icon={<FiHeadphones />}
                        title="Bizi Arayın"
                        desc="0850 123 45 67 numaralı hattan bize ulaşın."
                        action="Hemen Ara"
                        href="tel:08501234567"
                    />
                </div>

                {/* Common Topics */}
                <div className="bg-white rounded-2xl p-8 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Popüler Konular</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link href="/faq" className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 flex items-center justify-between group transition">
                            <span className="font-medium text-gray-700">Kargom nerede?</span>
                            <span className="text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                        <Link href="/faq" className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 flex items-center justify-between group transition">
                            <span className="font-medium text-gray-700">İade işlemi nasıl yapılır?</span>
                            <span className="text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                        <Link href="/profile?tab=orders" className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 flex items-center justify-between group transition">
                            <span className="font-medium text-gray-700">Siparişimi iptal etmek istiyorum</span>
                            <span className="text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                        <Link href="/membership" className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 flex items-center justify-between group transition">
                            <span className="font-medium text-gray-700">Üyelik avantajları nelerdir?</span>
                            <span className="text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                    </div>
                </div>
            </div>

            <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} /> 
        </div>
    )
}

function SupportCard({ icon, title, desc, action, href, primary }: { icon: any, title: string, desc: string, action: string, href?: string, primary?: boolean }) {
    const CardContent = (
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center hover:shadow-md transition border border-gray-100 flex flex-col items-center h-full">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-6 ${primary ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 mb-8 text-sm">{desc}</p>
            <div
                className={`mt-auto w-full py-3 rounded-xl font-semibold transition ${primary
                        ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-200'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
            >
                {action}
            </div>
        </div>
    )

    if (href) {
        return <Link href={href} className="block h-full">{CardContent}</Link>
    }
    return CardContent
}

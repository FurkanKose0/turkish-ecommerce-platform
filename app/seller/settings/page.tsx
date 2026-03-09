'use client'

import React, { useState } from 'react'
import { FiSave, FiUser, FiLock, FiBell, FiCreditCard } from 'react-icons/fi'

export default function SellerSettingsPage() {
    const [activeTab, setActiveTab] = useState('profile')

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Ayarlar</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Settings Sidebar */}
                <div className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <nav className="flex flex-col">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition ${activeTab === 'profile'
                                    ? 'bg-green-50 text-green-600 border-l-4 border-green-600'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                                    }`}
                            >
                                <FiUser className="text-lg" />
                                Profil Bilgileri
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition ${activeTab === 'security'
                                    ? 'bg-green-50 text-green-600 border-l-4 border-green-600'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                                    }`}
                            >
                                <FiLock className="text-lg" />
                                Güvenlik
                            </button>
                            <button
                                onClick={() => setActiveTab('notifications')}
                                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition ${activeTab === 'notifications'
                                    ? 'bg-green-50 text-green-600 border-l-4 border-green-600'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                                    }`}
                            >
                                <FiBell className="text-lg" />
                                Bildirimler
                            </button>
                            <button
                                onClick={() => setActiveTab('payment')}
                                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition ${activeTab === 'payment'
                                    ? 'bg-green-50 text-green-600 border-l-4 border-green-600'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                                    }`}
                            >
                                <FiCreditCard className="text-lg" />
                                Ödeme Bilgileri
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                        {activeTab === 'profile' && <ProfileSettings />}
                        {activeTab === 'security' && <SecuritySettings />}
                        {activeTab === 'notifications' && <NotificationSettings />}
                        {activeTab === 'payment' && <PaymentSettings />}
                    </div>
                </div>
            </div>
        </div>
    )
}

function ProfileSettings() {
    return (
        <form className="space-y-6">
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Mağaza Profili</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mağaza Adı</label>
                        <input
                            type="text"
                            defaultValue="sKorry Ticaret"
                            className="block w-full bg-white border border-gray-300 rounded-lg text-gray-900 py-2.5 px-3 focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
                        <input
                            type="email"
                            defaultValue="satici@skorry.com"
                            className="block w-full bg-white border border-gray-300 rounded-lg text-gray-900 py-2.5 px-3 focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hakkında</label>
                        <textarea
                            rows={4}
                            defaultValue="Teknoloji ürünleri ve aksesuarları satışı yapıyoruz."
                            className="block w-full bg-white border border-gray-300 rounded-lg text-gray-900 py-2.5 px-3 focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none"
                        />
                    </div>
                </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-gray-200">
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium transition flex items-center gap-2 shadow-sm">
                    <FiSave />
                    Kaydet
                </button>
            </div>
        </form>
    )
}

function SecuritySettings() {
    return (
        <form className="space-y-6">
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Şifre Değiştir</h2>
                <div className="space-y-4 max-w-md">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mevcut Şifre</label>
                        <input
                            type="password"
                            className="block w-full bg-white border border-gray-300 rounded-lg text-gray-900 py-2.5 px-3 focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Yeni Şifre</label>
                        <input
                            type="password"
                            className="block w-full bg-white border border-gray-300 rounded-lg text-gray-900 py-2.5 px-3 focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Yeni Şifre (Tekrar)</label>
                        <input
                            type="password"
                            className="block w-full bg-white border border-gray-300 rounded-lg text-gray-900 py-2.5 px-3 focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none"
                        />
                    </div>
                </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-gray-200">
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium transition flex items-center gap-2 shadow-sm">
                    <FiSave />
                    Şifreyi Güncelle
                </button>
            </div>
        </form>
    )
}

function NotificationSettings() {
    return (
        <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Bildirim Tercihleri</h2>
            <div className="space-y-4">
                {[
                    'Yeni sipariş alındığında',
                    'Ürün stok seviyesi azaldığında',
                    'Ürün yorumu yapıldığında',
                    'Kampanya önerileri',
                    'Haftalık performans raporu',
                ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-gray-700 font-medium">{item}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked={i < 3} />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                    </div>
                ))}
            </div>
        </div>
    )
}

function PaymentSettings() {
    return (
        <form className="space-y-6">
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Banka Hesap Bilgileri</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hesap Sahibi</label>
                        <input
                            type="text"
                            placeholder="Ad Soyad veya Şirket Ünvanı"
                            className="block w-full bg-white border border-gray-300 rounded-lg text-gray-900 py-2.5 px-3 focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">IBAN</label>
                        <input
                            type="text"
                            placeholder="TR00 0000 0000 0000 0000 0000 00"
                            className="block w-full bg-white border border-gray-300 rounded-lg text-gray-900 py-2.5 px-3 focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none font-mono"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Banka Adı</label>
                        <input
                            type="text"
                            className="block w-full bg-white border border-gray-300 rounded-lg text-gray-900 py-2.5 px-3 focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none"
                        />
                    </div>
                </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-gray-200">
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium transition flex items-center gap-2 shadow-sm">
                    <FiSave />
                    Hesap Bilgilerini Kaydet
                </button>
            </div>
        </form>
    )
}

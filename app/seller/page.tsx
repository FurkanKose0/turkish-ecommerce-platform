'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { FiTrendingUp, FiShoppingBag, FiUsers, FiDollarSign, FiMessageSquare, FiTag, FiGift } from 'react-icons/fi'

export default function SellerDashboard() {
    const [stats, setStats] = useState({
        total_sales: 0,
        total_orders: 0,
        active_products: 0,
        sales_trend: '0'
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/seller/stats')
            if (res.ok) {
                const data = await res.json()
                setStats(data)
            }
        } catch (error) {
            console.error('Failed to fetch stats', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="text-gray-900">Yükleniyor...</div>

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Panel Özeti</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Toplam Satış"
                    value={`${Number(stats.total_sales).toLocaleString('tr-TR')} ₺`}
                    trend={`${parseFloat(stats.sales_trend) > 0 ? '+' : ''}${stats.sales_trend}%`}
                    trendUp={parseFloat(stats.sales_trend) >= 0}
                    icon={<FiDollarSign />}
                    color="green"
                />
                <StatCard
                    title="Toplam Sipariş"
                    value={stats.total_orders}
                    trend="0%"
                    trendUp={true}
                    icon={<FiShoppingBag />}
                    color="blue"
                />
                <StatCard
                    title="Aktif Ürünler"
                    value={stats.active_products}
                    trend="0%"
                    trendUp={true}
                    icon={<FiTrendingUp />}
                    color="purple"
                />
                <StatCard
                    title="Mağaza Puanı"
                    value="-"
                    trend="-"
                    trendUp={false}
                    icon={<FiUsers />}
                    color="orange"
                />
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Hızlı İşlemler</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    <Link href="/seller/products" className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg text-center transition group border border-gray-200">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
                            <FiShoppingBag className="text-xl" />
                        </div>
                        <h3 className="text-gray-900 font-medium">Ürün Yönetimi</h3>
                        <p className="text-xs text-gray-500 mt-1">Stok ve resim güncelle</p>
                    </Link>
                    <Link href="/seller/orders" className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg text-center transition group border border-gray-200">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
                            <FiShoppingBag className="text-xl" />
                        </div>
                        <h3 className="text-gray-900 font-medium">Siparişler</h3>
                        <p className="text-xs text-gray-500 mt-1">Sipariş durumunu güncelle</p>
                    </Link>
                    <Link href="/seller/campaigns" className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg text-center transition group border border-gray-200">
                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
                            <FiTag className="text-xl" />
                        </div>
                        <h3 className="text-gray-900 font-medium">Kampanyalar</h3>
                        <p className="text-xs text-gray-500 mt-1">İndirim kampanyası oluştur</p>
                    </Link>
                    <Link href="/seller/coupons" className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg text-center transition group border border-gray-200">
                        <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
                            <FiGift className="text-xl" />
                        </div>
                        <h3 className="text-gray-900 font-medium">Kuponlar</h3>
                        <p className="text-xs text-gray-500 mt-1">Kupon kodu oluştur</p>
                    </Link>
                    <Link href="/seller/questions" className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg text-center transition group border border-gray-200">
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
                            <FiMessageSquare className="text-xl" />
                        </div>
                        <h3 className="text-gray-900 font-medium">Müşteri Soruları</h3>
                        <p className="text-xs text-gray-500 mt-1">Gelen soruları cevapla</p>
                    </Link>
                </div>
            </div>
        </div>
    )
}

function StatCard({ title, value, trend, trendUp, icon, color }: any) {
    const colors: any = {
        green: 'text-green-600 bg-green-100',
        blue: 'text-blue-600 bg-blue-100',
        purple: 'text-purple-600 bg-purple-100',
        orange: 'text-orange-600 bg-orange-100',
    }

    return (
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-sm text-gray-500 mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${colors[color]}`}>
                    {icon}
                </div>
            </div>
            <div className="flex items-center text-sm">
                <span className={trendUp ? 'text-green-600' : 'text-red-500'}>{trend}</span>
                <span className="text-gray-400 ml-2">geçen aya göre</span>
            </div>
        </div>
    )
}

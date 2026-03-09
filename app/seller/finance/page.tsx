'use client'

import React, { useEffect, useState } from 'react'

export default function SellerFinancePage() {
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

    if (loading) return <div className="text-gray-900 p-8">Yükleniyor...</div>

    const averageBasket = stats.total_orders > 0 ? stats.total_sales / stats.total_orders : 0

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Finans Yönetimi</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium mb-2">Toplam Kazanç</h3>
                    <p className="text-3xl font-bold text-gray-900">{Number(stats.total_sales).toLocaleString('tr-TR')} ₺</p>
                    <span className={`${parseFloat(stats.sales_trend) >= 0 ? 'text-green-600' : 'text-red-500'} text-sm flex items-center mt-2`}>
                        {parseFloat(stats.sales_trend) > 0 ? '+' : ''}{stats.sales_trend}% <span className="text-gray-400 ml-1">geçen aya göre</span>
                    </span>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium mb-2">Bekleyen Ödemeler</h3>
                    <p className="text-3xl font-bold text-gray-900">0,00 ₺</p>
                    <span className="text-gray-400 text-sm mt-2 block">
                        Henüz hesaplanmadı
                    </span>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium mb-2">Ortalama Sepet Tutarı</h3>
                    <p className="text-3xl font-bold text-gray-900">{averageBasket.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</p>
                    <span className="text-gray-400 text-sm flex items-center mt-2">
                        Sipariş başına
                    </span>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900">Son İşlemler</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-4 text-sm font-medium text-gray-500">İşlem ID</th>
                                <th className="p-4 text-sm font-medium text-gray-500">Tarih</th>
                                <th className="p-4 text-sm font-medium text-gray-500">Açıklama</th>
                                <th className="p-4 text-sm font-medium text-gray-500">Durum</th>
                                <th className="p-4 text-sm font-medium text-gray-500 text-right">Tutar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <tr key={i} className="hover:bg-gray-50 transition">
                                    <td className="p-4 text-gray-900 font-medium">#TRX-{1000 + i}</td>
                                    <td className="p-4 text-gray-500">0{i}.01.2024</td>
                                    <td className="p-4 text-gray-900">Sipariş Ödemesi #{2000 + i}</td>
                                    <td className="p-4">
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                                            Tamamlandı
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-mono text-gray-900">
                                        +{Math.floor(Math.random() * 500) + 100}.00 ₺
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

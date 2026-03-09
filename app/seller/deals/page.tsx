'use client'

import { useState, useEffect } from 'react'
import { FiPlus, FiTrash2, FiClock, FiPercent, FiPackage } from 'react-icons/fi'
import { useRouter } from 'next/navigation'

interface DealProduct {
    product_id: number
    product_name: string
    price: number
    image_url: string
    deal_discount_percent: number
    deal_start_date: string
    deal_end_date: string
    is_active: boolean
}

interface Product {
    product_id: number
    product_name: string
    price: number
    image_url: string
}

export default function SellerDealsPage() {
    const router = useRouter()
    const [deals, setDeals] = useState<DealProduct[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [products, setProducts] = useState<Product[]>([])

    // Form State
    const [selectedProduct, setSelectedProduct] = useState<string>('')
    const [discountPercent, setDiscountPercent] = useState<number>(20)
    const [duration, setDuration] = useState<number>(24)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        fetchDeals()
        fetchProducts()
    }, [])

    const fetchDeals = async () => {
        try {
            const res = await fetch('/api/seller/deals')
            const data = await res.json()
            setDeals(data.deals || [])
        } catch (error) {
            console.error('Fırsatlar yüklenemedi', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/seller/products')
            const data = await res.json()
            setProducts(data.products || [])
        } catch (error) {
            console.error('Ürünler yüklenemedi', error)
        }
    }

    const handleCreateDeal = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedProduct) return

        setSubmitting(true)
        try {
            const res = await fetch(`/api/seller/products/${selectedProduct}/deal`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    discountPercent,
                    durationHours: duration
                })
            })

            if (res.ok) {
                setShowModal(false)
                fetchDeals()
                // Reset form
                setSelectedProduct('')
                setDiscountPercent(20)
                setDiscountPercent(20)
            } else {
                const errorData = await res.json()
                alert(errorData.error || 'Fırsat oluşturulamadı')
            }
        } catch (error) {
            console.error('Hata:', error)
        } finally {
            setSubmitting(false)
        }
    }

    const handleRemoveDeal = async (productId: number) => {
        if (!confirm('Bu ürünü günün fırsatlarından kaldırmak istediğinize emin misiniz?')) return

        try {
            const res = await fetch(`/api/seller/products/${productId}/deal`, {
                method: 'DELETE'
            })

            if (res.ok) {
                fetchDeals()
            } else {
                alert('Kaldırma işlemi başarısız')
            }
        } catch (error) {
            console.error('Hata:', error)
        }
    }

    const calculateDiscountedPrice = (price: number, percent: number) => {
        return price - (price * percent / 100)
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Günün Fırsatları</h1>
                    <p className="text-gray-600">Ürünlerinizi 24 saatliğine öne çıkarın</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700 transition"
                >
                    <FiPlus />
                    Yeni Fırsat Ekle
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12">Yükleniyor...</div>
            ) : deals.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiClock className="text-3xl" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Aktif Fırsat Yok</h3>
                    <p className="text-gray-600 mb-6">Henüz "Günün Fırsatı" olarak işaretlenmiş bir ürününüz bulunmuyor.</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="text-primary-600 font-semibold hover:text-primary-700 hover:underline"
                    >
                        Hemen bir ürün ekleyin
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {deals.map((deal) => (
                        <div key={deal.product_id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative group">
                            <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                                %{deal.deal_discount_percent} İNDİRİM
                            </div>

                            <div className="p-4 flex gap-4">
                                <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0">
                                    {deal.image_url ? (
                                        <img src={deal.image_url} alt={deal.product_name} className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <FiPackage className="text-2xl" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-800 line-clamp-2 mb-1">{deal.product_name}</h3>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-lg font-bold text-red-600">
                                            {calculateDiscountedPrice(deal.price, deal.deal_discount_percent).toLocaleString('tr-TR')} ₺
                                        </span>
                                        <span className="text-sm text-gray-400 line-through">
                                            {deal.price.toLocaleString('tr-TR')} ₺
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-orange-600 font-medium">
                                        <FiClock />
                                        Bitiş: {new Date(deal.deal_end_date).toLocaleDateString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>

                            <div className="px-4 py-3 bg-gray-50 flex justify-end">
                                <button
                                    onClick={() => handleRemoveDeal(deal.product_id)}
                                    className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1 hover:bg-red-50 px-3 py-1 rounded transition"
                                >
                                    <FiTrash2 />
                                    Fırsatı Kaldır
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Yeni Fırsat Ekle</h2>

                            <form onSubmit={handleCreateDeal} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Seçin</label>
                                    <select
                                        value={selectedProduct}
                                        onChange={(e) => setSelectedProduct(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                        required
                                    >
                                        <option value="">Bir ürün seçin...</option>
                                        {products.map(p => (
                                            <option key={p.product_id} value={p.product_id}>
                                                {p.product_name} - {p.price} ₺
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">İndirim Oranı (%)</label>
                                    <div className="relative">
                                        <FiPercent className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="number"
                                            min="1"
                                            max="90"
                                            value={discountPercent}
                                            onChange={(e) => setDiscountPercent(parseInt(e.target.value))}
                                            className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Süre (Saat)</label>
                                    <div className="relative">
                                        <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <select
                                            value={duration}
                                            onChange={(e) => setDuration(parseInt(e.target.value))}
                                            className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                        >
                                            <option value="6">6 Saat</option>
                                            <option value="12">12 Saat</option>
                                            <option value="24">24 Saat (1 Gün)</option>
                                            <option value="48">48 Saat (2 Gün)</option>
                                            <option value="72">72 Saat (3 Gün)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
                                    >
                                        {submitting ? 'Ekleniyor...' : 'Fırsatı Başlat'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

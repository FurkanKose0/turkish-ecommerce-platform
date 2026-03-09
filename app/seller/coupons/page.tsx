'use client'

import React, { useEffect, useState } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiTag, FiPercent, FiCalendar, FiPackage, FiSearch, FiEye, FiEyeOff, FiCopy, FiUsers, FiCheck, FiGift, FiHeart } from 'react-icons/fi'

interface Product {
    product_id: number
    product_name: string
    image_url: string
}

interface Coupon {
    coupon_id: number
    coupon_code: string
    coupon_name: string
    description: string
    discount_type: 'percentage' | 'fixed'
    discount_value: number
    min_order_amount: number
    max_discount_amount: number | null
    usage_limit: number | null
    usage_count: number
    per_user_limit: number
    is_followers_only: boolean
    start_date: string
    end_date: string
    is_active: boolean
    created_at: string
    products: Product[]
    follower_count: number
}

export default function SellerCouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
    const [products, setProducts] = useState<Product[]>([])
    const [copiedCode, setCopiedCode] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        coupon_code: '',
        coupon_name: '',
        description: '',
        discount_type: 'percentage' as 'percentage' | 'fixed',
        discount_value: '',
        min_order_amount: '',
        max_discount_amount: '',
        usage_limit: '',
        per_user_limit: '1',
        is_followers_only: false,
        start_date: '',
        end_date: '',
        product_ids: [] as number[],
        apply_to_all: true // Tüm ürünlerde geçerli mi
    })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        fetchCoupons()
        fetchProducts()
    }, [])

    const fetchCoupons = async () => {
        try {
            const res = await fetch('/api/seller/coupons')
            if (res.ok) {
                const data = await res.json()
                setCoupons(data.coupons || [])
            }
        } catch (error) {
            console.error('Failed to fetch coupons', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/seller/products')
            if (res.ok) {
                const data = await res.json()
                setProducts(data.products || [])
            }
        } catch (error) {
            console.error('Failed to fetch products', error)
        }
    }

    const generateCouponCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let code = ''
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        setFormData({ ...formData, coupon_code: code })
    }

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code)
        setCopiedCode(code)
        setTimeout(() => setCopiedCode(null), 2000)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setSubmitting(true)

        try {
            const url = editingCoupon
                ? `/api/seller/coupons/${editingCoupon.coupon_id}`
                : '/api/seller/coupons'

            const res = await fetch(url, {
                method: editingCoupon ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    discount_value: parseFloat(formData.discount_value),
                    min_order_amount: formData.min_order_amount ? parseFloat(formData.min_order_amount) : 0,
                    max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null,
                    usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
                    per_user_limit: parseInt(formData.per_user_limit) || 1,
                    product_ids: formData.apply_to_all ? [] : formData.product_ids
                })
            })

            const data = await res.json()

            if (res.ok) {
                setSuccess(editingCoupon ? 'Kupon güncellendi!' : 'Kupon oluşturuldu!')
                setShowModal(false)
                resetForm()
                fetchCoupons()
            } else {
                setError(data.error || 'Bir hata oluştu')
            }
        } catch (error) {
            setError('Bir hata oluştu')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (couponId: number) => {
        if (!confirm('Bu kuponu silmek istediğinizden emin misiniz?')) return

        try {
            const res = await fetch(`/api/seller/coupons/${couponId}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                setSuccess('Kupon silindi!')
                fetchCoupons()
            } else {
                const data = await res.json()
                setError(data.error || 'Silinemedi')
            }
        } catch (error) {
            setError('Bir hata oluştu')
        }
    }

    const handleToggleActive = async (coupon: Coupon) => {
        try {
            const res = await fetch(`/api/seller/coupons/${coupon.coupon_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: !coupon.is_active })
            })

            if (res.ok) {
                fetchCoupons()
            }
        } catch (error) {
            console.error('Toggle failed', error)
        }
    }

    const openEditModal = (coupon: Coupon) => {
        setEditingCoupon(coupon)
        setFormData({
            coupon_code: coupon.coupon_code,
            coupon_name: coupon.coupon_name,
            description: coupon.description || '',
            discount_type: coupon.discount_type,
            discount_value: String(coupon.discount_value),
            min_order_amount: coupon.min_order_amount ? String(coupon.min_order_amount) : '',
            max_discount_amount: coupon.max_discount_amount ? String(coupon.max_discount_amount) : '',
            usage_limit: coupon.usage_limit ? String(coupon.usage_limit) : '',
            per_user_limit: String(coupon.per_user_limit),
            is_followers_only: coupon.is_followers_only,
            start_date: coupon.start_date.slice(0, 16),
            end_date: coupon.end_date.slice(0, 16),
            product_ids: coupon.products.map(p => p.product_id),
            apply_to_all: coupon.products.length === 0
        })
        setShowModal(true)
    }

    const resetForm = () => {
        setEditingCoupon(null)
        setFormData({
            coupon_code: '',
            coupon_name: '',
            description: '',
            discount_type: 'percentage',
            discount_value: '',
            min_order_amount: '',
            max_discount_amount: '',
            usage_limit: '',
            per_user_limit: '1',
            is_followers_only: false,
            start_date: '',
            end_date: '',
            product_ids: [],
            apply_to_all: true
        })
    }

    const toggleProduct = (productId: number) => {
        setFormData(prev => ({
            ...prev,
            product_ids: prev.product_ids.includes(productId)
                ? prev.product_ids.filter(id => id !== productId)
                : [...prev.product_ids, productId]
        }))
    }

    const filteredCoupons = coupons.filter(c =>
        c.coupon_name.toLowerCase().includes(search.toLowerCase()) ||
        c.coupon_code.toLowerCase().includes(search.toLowerCase())
    )

    const isActive = (coupon: Coupon) => {
        const now = new Date()
        const start = new Date(coupon.start_date)
        const end = new Date(coupon.end_date)
        return coupon.is_active && now >= start && now <= end
    }

    if (loading) return <div className="text-gray-900 p-8">Yükleniyor...</div>

    return (
        <div>
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Kuponlar</h1>
                    <p className="text-gray-500 text-sm mt-1">Müşterileriniz için indirim kuponları oluşturun</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <input
                            type="text"
                            placeholder="Kupon ara..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                        />
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowModal(true) }}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 whitespace-nowrap shadow-sm"
                    >
                        <FiPlus />
                        Yeni Kupon
                    </button>
                </div>
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                    {success}
                </div>
            )}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            {/* Coupons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCoupons.map(coupon => (
                    <div key={coupon.coupon_id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition relative">
                        {/* Followers Only Badge */}
                        {coupon.is_followers_only && (
                            <div className="absolute top-3 right-3 z-10">
                                <span className="bg-pink-100 text-pink-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                    <FiHeart className="w-3 h-3" />
                                    Takipçilere Özel
                                </span>
                            </div>
                        )}

                        <div className={`p-4 ${isActive(coupon) ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-gray-100'}`}>
                            <div className="flex items-center justify-between">
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${isActive(coupon) ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                    {isActive(coupon) ? 'AKTİF' : coupon.is_active ? 'ZAMANLANMIŞ' : 'PASİF'}
                                </span>
                                <div className={`text-2xl font-black ${isActive(coupon) ? 'text-white' : 'text-gray-700'}`}>
                                    {coupon.discount_type === 'percentage' ? `%${coupon.discount_value}` : `${coupon.discount_value}₺`}
                                </div>
                            </div>

                            {/* Coupon Code */}
                            <div className="mt-3">
                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${isActive(coupon) ? 'bg-white/20' : 'bg-gray-200'}`}>
                                    <span className={`font-mono font-bold tracking-wider ${isActive(coupon) ? 'text-white' : 'text-gray-700'}`}>
                                        {coupon.coupon_code}
                                    </span>
                                    <button
                                        onClick={() => copyToClipboard(coupon.coupon_code)}
                                        className={`p-1 rounded transition ${isActive(coupon) ? 'hover:bg-white/20 text-white' : 'hover:bg-gray-300 text-gray-600'}`}
                                    >
                                        {copiedCode === coupon.coupon_code ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <h3 className={`text-lg font-bold mt-2 ${isActive(coupon) ? 'text-white' : 'text-gray-900'}`}>
                                {coupon.coupon_name}
                            </h3>
                        </div>

                        <div className="p-4">
                            {coupon.description && (
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{coupon.description}</p>
                            )}

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <FiCalendar className="text-purple-500" />
                                    <span>
                                        {new Date(coupon.start_date).toLocaleDateString('tr-TR')} - {new Date(coupon.end_date).toLocaleDateString('tr-TR')}
                                    </span>
                                </div>
                                {coupon.min_order_amount > 0 && (
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <FiTag className="text-blue-500" />
                                        <span>Min. sipariş: {coupon.min_order_amount}₺</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-gray-500">
                                    <FiUsers className="text-green-500" />
                                    <span>
                                        {coupon.usage_count}{coupon.usage_limit ? `/${coupon.usage_limit}` : ''} kullanım
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500">
                                    <FiPackage className="text-orange-500" />
                                    <span>{coupon.products.length === 0 ? 'Tüm ürünlerde' : `${coupon.products.length} üründe`} geçerli</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => handleToggleActive(coupon)}
                                    className={`p-2 rounded-lg transition ${coupon.is_active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                                    title={coupon.is_active ? 'Pasife Al' : 'Aktifleştir'}
                                >
                                    {coupon.is_active ? <FiEye /> : <FiEyeOff />}
                                </button>
                                <button
                                    onClick={() => openEditModal(coupon)}
                                    className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                                    title="Düzenle"
                                >
                                    <FiEdit2 />
                                </button>
                                <button
                                    onClick={() => handleDelete(coupon.coupon_id)}
                                    className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                                    title="Sil"
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredCoupons.length === 0 && (
                    <div className="col-span-full text-center py-12">
                        <FiGift className="mx-auto text-4xl text-gray-300 mb-4" />
                        <h3 className="text-gray-500 font-medium">Henüz kupon yok</h3>
                        <p className="text-gray-400 text-sm mt-1">İlk kuponunuzu oluşturun</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingCoupon ? 'Kuponu Düzenle' : 'Yeni Kupon'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Kupon Kodu ve Adı */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Kupon Kodu *
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            required
                                            value={formData.coupon_code}
                                            onChange={e => setFormData({ ...formData, coupon_code: e.target.value.toUpperCase() })}
                                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 font-mono uppercase"
                                            placeholder="INDIRIM10"
                                        />
                                        <button
                                            type="button"
                                            onClick={generateCouponCode}
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition"
                                            title="Rastgele oluştur"
                                        >
                                            <FiGift />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Kupon Adı *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.coupon_name}
                                        onChange={e => setFormData({ ...formData, coupon_name: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                        placeholder="Hoş Geldin İndirimi"
                                    />
                                </div>
                            </div>

                            {/* Açıklama */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Açıklama
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-none"
                                    rows={2}
                                    placeholder="Kupon açıklaması..."
                                />
                            </div>

                            {/* Takipçilere Özel */}
                            <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-100">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_followers_only}
                                        onChange={e => setFormData({ ...formData, is_followers_only: e.target.checked })}
                                        className="w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                                    />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <FiHeart className="text-pink-500" />
                                            <span className="font-medium text-gray-900">Takipçilere Özel Kupon</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-0.5">
                                            Bu kuponu sadece mağazanızı takip eden müşteriler kullanabilir
                                        </p>
                                    </div>
                                </label>
                            </div>

                            {/* İndirim Tipi ve Değeri */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        İndirim Tipi *
                                    </label>
                                    <select
                                        value={formData.discount_type}
                                        onChange={e => setFormData({ ...formData, discount_type: e.target.value as 'percentage' | 'fixed' })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                    >
                                        <option value="percentage">Yüzde (%)</option>
                                        <option value="fixed">Sabit Tutar (₺)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        İndirim Değeri *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={formData.discount_value}
                                            onChange={e => setFormData({ ...formData, discount_value: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                            placeholder="10"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            {formData.discount_type === 'percentage' ? '%' : '₺'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Min/Max ve Kullanım Limitleri */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Min. Sipariş Tutarı
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.min_order_amount}
                                            onChange={e => setFormData({ ...formData, min_order_amount: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                            placeholder="0"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">₺</span>
                                    </div>
                                </div>
                                {formData.discount_type === 'percentage' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Max. İndirim Tutarı
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={formData.max_discount_amount}
                                                onChange={e => setFormData({ ...formData, max_discount_amount: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                                placeholder="Sınırsız"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">₺</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Kullanım Limitleri */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Toplam Kullanım Limiti
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.usage_limit}
                                        onChange={e => setFormData({ ...formData, usage_limit: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                        placeholder="Sınırsız"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Kişi Başı Kullanım Limiti
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.per_user_limit}
                                        onChange={e => setFormData({ ...formData, per_user_limit: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                        placeholder="1"
                                    />
                                </div>
                            </div>

                            {/* Tarihler */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Başlangıç Tarihi *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={formData.start_date}
                                        onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Bitiş Tarihi *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={formData.end_date}
                                        onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                    />
                                </div>
                            </div>

                            {/* Ürün Seçimi */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Geçerli Ürünler
                                </label>

                                <div className="flex gap-4 mb-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={formData.apply_to_all}
                                            onChange={() => setFormData({ ...formData, apply_to_all: true })}
                                            className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                                        />
                                        <span className="text-gray-700">Tüm ürünlerimde geçerli</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={!formData.apply_to_all}
                                            onChange={() => setFormData({ ...formData, apply_to_all: false })}
                                            className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                                        />
                                        <span className="text-gray-700">Belirli ürünlerde geçerli</span>
                                    </label>
                                </div>

                                {!formData.apply_to_all && (
                                    <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                                        {products.length === 0 ? (
                                            <div className="p-4 text-center text-gray-500">Henüz ürününüz yok</div>
                                        ) : (
                                            products.map(product => (
                                                <label
                                                    key={product.product_id}
                                                    className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-0 transition ${formData.product_ids.includes(product.product_id) ? 'bg-green-50' : ''}`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.product_ids.includes(product.product_id)}
                                                        onChange={() => toggleProduct(product.product_id)}
                                                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                                    />
                                                    <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                        {product.image_url ? (
                                                            <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                <FiPackage />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-gray-900 text-sm font-medium line-clamp-1">{product.product_name}</span>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); resetForm() }}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || (!formData.apply_to_all && formData.product_ids.length === 0)}
                                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'Kaydediliyor...' : editingCoupon ? 'Güncelle' : 'Oluştur'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

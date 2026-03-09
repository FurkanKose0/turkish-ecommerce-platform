'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { FiPlus, FiEdit2, FiTrash2, FiTag, FiPercent, FiCalendar, FiPackage, FiSearch, FiEye, FiEyeOff } from 'react-icons/fi'

interface Product {
    product_id: number
    product_name: string
    image_url: string
}

interface Campaign {
    campaign_id: number
    campaign_name: string
    description: string
    discount_type: 'percentage' | 'fixed'
    discount_value: number
    min_order_amount: number
    max_discount_amount: number | null
    start_date: string
    end_date: string
    is_active: boolean
    created_at: string
    products: Product[]
}

export default function SellerCampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
    const [products, setProducts] = useState<Product[]>([])
    const [formData, setFormData] = useState({
        campaign_name: '',
        description: '',
        discount_type: 'percentage' as 'percentage' | 'fixed',
        discount_value: '',
        min_order_amount: '',
        max_discount_amount: '',
        start_date: '',
        end_date: '',
        product_ids: [] as number[]
    })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        fetchCampaigns()
        fetchProducts()
    }, [])

    const fetchCampaigns = async () => {
        try {
            const res = await fetch('/api/seller/campaigns')
            if (res.ok) {
                const data = await res.json()
                setCampaigns(data.campaigns || [])
            }
        } catch (error) {
            console.error('Failed to fetch campaigns', error)
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setSubmitting(true)

        try {
            const url = editingCampaign
                ? `/api/seller/campaigns/${editingCampaign.campaign_id}`
                : '/api/seller/campaigns'

            const res = await fetch(url, {
                method: editingCampaign ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    discount_value: parseFloat(formData.discount_value),
                    min_order_amount: formData.min_order_amount ? parseFloat(formData.min_order_amount) : 0,
                    max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null
                })
            })

            const data = await res.json()

            if (res.ok) {
                setSuccess(editingCampaign ? 'Kampanya güncellendi!' : 'Kampanya oluşturuldu!')
                setShowModal(false)
                resetForm()
                fetchCampaigns()
            } else {
                setError(data.error || 'Bir hata oluştu')
            }
        } catch (error) {
            setError('Bir hata oluştu')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (campaignId: number) => {
        if (!confirm('Bu kampanyayı silmek istediğinizden emin misiniz?')) return

        try {
            const res = await fetch(`/api/seller/campaigns/${campaignId}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                setSuccess('Kampanya silindi!')
                fetchCampaigns()
            } else {
                const data = await res.json()
                setError(data.error || 'Silinemedi')
            }
        } catch (error) {
            setError('Bir hata oluştu')
        }
    }

    const handleToggleActive = async (campaign: Campaign) => {
        try {
            const res = await fetch(`/api/seller/campaigns/${campaign.campaign_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: !campaign.is_active })
            })

            if (res.ok) {
                fetchCampaigns()
            }
        } catch (error) {
            console.error('Toggle failed', error)
        }
    }

    const openEditModal = (campaign: Campaign) => {
        setEditingCampaign(campaign)
        setFormData({
            campaign_name: campaign.campaign_name,
            description: campaign.description || '',
            discount_type: campaign.discount_type,
            discount_value: String(campaign.discount_value),
            min_order_amount: campaign.min_order_amount ? String(campaign.min_order_amount) : '',
            max_discount_amount: campaign.max_discount_amount ? String(campaign.max_discount_amount) : '',
            start_date: campaign.start_date.slice(0, 16),
            end_date: campaign.end_date.slice(0, 16),
            product_ids: campaign.products.map(p => p.product_id)
        })
        setShowModal(true)
    }

    const resetForm = () => {
        setEditingCampaign(null)
        setFormData({
            campaign_name: '',
            description: '',
            discount_type: 'percentage',
            discount_value: '',
            min_order_amount: '',
            max_discount_amount: '',
            start_date: '',
            end_date: '',
            product_ids: []
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

    const filteredCampaigns = campaigns.filter(c =>
        c.campaign_name.toLowerCase().includes(search.toLowerCase())
    )

    const isActive = (campaign: Campaign) => {
        const now = new Date()
        const start = new Date(campaign.start_date)
        const end = new Date(campaign.end_date)
        return campaign.is_active && now >= start && now <= end
    }

    if (loading) return <div className="text-gray-900 p-8">Yükleniyor...</div>

    return (
        <div>
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Kampanyalar</h1>
                    <p className="text-gray-500 text-sm mt-1">Ürünlerinizde indirim kampanyaları oluşturun</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <input
                            type="text"
                            placeholder="Kampanya ara..."
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
                        Yeni Kampanya
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

            {/* Campaigns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCampaigns.map(campaign => (
                    <div key={campaign.campaign_id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition">
                        <div className={`p-4 ${isActive(campaign) ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-100'}`}>
                            <div className="flex items-center justify-between">
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${isActive(campaign) ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                    {isActive(campaign) ? 'AKTİF' : campaign.is_active ? 'ZAMANLANMIŞ' : 'PASİF'}
                                </span>
                                <div className={`text-2xl font-black ${isActive(campaign) ? 'text-white' : 'text-gray-700'}`}>
                                    {campaign.discount_type === 'percentage' ? `%${campaign.discount_value}` : `${campaign.discount_value}₺`}
                                </div>
                            </div>
                            <h3 className={`text-lg font-bold mt-2 ${isActive(campaign) ? 'text-white' : 'text-gray-900'}`}>
                                {campaign.campaign_name}
                            </h3>
                        </div>

                        <div className="p-4">
                            {campaign.description && (
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{campaign.description}</p>
                            )}

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <FiCalendar className="text-green-500" />
                                    <span>
                                        {new Date(campaign.start_date).toLocaleDateString('tr-TR')} - {new Date(campaign.end_date).toLocaleDateString('tr-TR')}
                                    </span>
                                </div>
                                {campaign.min_order_amount > 0 && (
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <FiTag className="text-blue-500" />
                                        <span>Min. sipariş: {campaign.min_order_amount}₺</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-gray-500">
                                    <FiPackage className="text-purple-500" />
                                    <span>{campaign.products.length} ürün</span>
                                </div>
                            </div>

                            {/* Product Thumbnails */}
                            {campaign.products.length > 0 && (
                                <div className="flex -space-x-2 mt-4">
                                    {campaign.products.slice(0, 4).map(product => (
                                        <div key={product.product_id} className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 overflow-hidden">
                                            {product.image_url ? (
                                                <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <FiPackage />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {campaign.products.length > 4 && (
                                        <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                            +{campaign.products.length - 4}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => handleToggleActive(campaign)}
                                    className={`p-2 rounded-lg transition ${campaign.is_active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                                    title={campaign.is_active ? 'Pasife Al' : 'Aktifleştir'}
                                >
                                    {campaign.is_active ? <FiEye /> : <FiEyeOff />}
                                </button>
                                <button
                                    onClick={() => openEditModal(campaign)}
                                    className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                                    title="Düzenle"
                                >
                                    <FiEdit2 />
                                </button>
                                <button
                                    onClick={() => handleDelete(campaign.campaign_id)}
                                    className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                                    title="Sil"
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredCampaigns.length === 0 && (
                    <div className="col-span-full text-center py-12">
                        <FiTag className="mx-auto text-4xl text-gray-300 mb-4" />
                        <h3 className="text-gray-500 font-medium">Henüz kampanya yok</h3>
                        <p className="text-gray-400 text-sm mt-1">İlk kampanyanızı oluşturun</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingCampaign ? 'Kampanyayı Düzenle' : 'Yeni Kampanya'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Kampanya Adı */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Kampanya Adı *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.campaign_name}
                                    onChange={e => setFormData({ ...formData, campaign_name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                    placeholder="Örn: Yaz İndirimi"
                                />
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
                                    placeholder="Kampanya açıklaması..."
                                />
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

                            {/* Min ve Max */}
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
                                    Kampanya Ürünleri * <span className="text-gray-400 font-normal">({formData.product_ids.length} seçili)</span>
                                </label>
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
                                    disabled={submitting || formData.product_ids.length === 0}
                                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'Kaydediliyor...' : editingCampaign ? 'Güncelle' : 'Oluştur'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

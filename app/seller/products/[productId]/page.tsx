'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiSave, FiPackage, FiImage, FiUpload } from 'react-icons/fi'

export default function EditProductPage() {
    const router = useRouter()
    const params = useParams()
    const productId = params.productId as string

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [product, setProduct] = useState<any>(null)

    // Form State
    const [stock, setStock] = useState('')
    const [price, setPrice] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const [imagePreview, setImagePreview] = useState('')
    const [imageSourceType, setImageSourceType] = useState<'url' | 'upload'>('url')

    // Beden ve Stok yönetimi
    const [sizeStocks, setSizeStocks] = useState<{ [key: string]: number }>({
        'S': 0, 'M': 0, 'L': 0, 'XL': 0
    })
    const [showSizes, setShowSizes] = useState(false)

    useEffect(() => {
        fetchProduct()
    }, [])

    useEffect(() => {
        if (product) {
            const clothingCategoryIds = [4, 5, 6]
            if (clothingCategoryIds.includes(parseInt(product.category_id))) {
                setShowSizes(true)
            }
        }
    }, [product])

    // Toplam stok hesapla (bedenler girilmişse)
    useEffect(() => {
        if (showSizes && !loading) {
            const total = Object.values(sizeStocks).reduce((a, b) => a + b, 0)
            setStock(total.toString())
        }
    }, [sizeStocks, showSizes, loading])

    const fetchProduct = async () => {
        try {
            const res = await fetch(`/api/seller/products/${productId}`)
            if (res.ok) {
                const data = await res.json()
                setProduct(data.product)
                setStock(data.product.stock_quantity.toString())
                setPrice(data.product.price.toString())
                setImageUrl(data.product.image_url || '')
                setImagePreview(data.product.image_url || '')

                if (data.product.size_stocks) {
                    setSizeStocks(data.product.size_stocks)
                }
            } else {
                alert('Ürün bulunamadı')
                router.push('/seller/products')
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleSizeStockChange = (size: string, val: string) => {
        // Başındaki sıfırları temizle ve sayıya çevir
        const cleaned = val.replace(/^0+/, '')
        const num = cleaned === '' ? 0 : parseInt(cleaned)
        setSizeStocks(prev => ({ ...prev, [size]: num }))
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const activeSizes = Object.keys(sizeStocks).filter(s => sizeStocks[s] > 0).join(',')

            const res = await fetch(`/api/seller/products/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    stock_quantity: parseInt(stock),
                    price: parseFloat(price),
                    image_url: imageUrl,
                    sizes: showSizes ? activeSizes : null,
                    size_stocks: showSizes ? sizeStocks : null
                })
            })

            if (res.ok) {
                alert('Ürün güncellendi!')
                router.push('/seller/products')
            } else {
                alert('Güncelleme başarısız oldu.')
            }
        } catch (error) {
            console.error(error)
            alert('Hata oluştu')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="text-white p-8">Yükleniyor...</div>
    if (!product) return null

    return (
        <div className="max-w-4xl mx-auto">
            <Link href="/seller/products" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6">
                <FiArrowLeft className="mr-2" />
                Ürün Listesine Dön
            </Link>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Info */}
                <div className="flex-1">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
                        <h1 className="text-xl font-bold text-gray-900 mb-6">Ürün Düzenle: {product.product_name}</h1>

                        <form onSubmit={handleSave} className="space-y-6">
                            {/* Stock & Sizes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {showSizes ? 'Toplam Stok (Bedenlere Göre Hesaplanır)' : 'Stok Adedi'}
                                </label>
                                <div className="relative mb-4">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiPackage className="text-gray-400" />
                                    </div>
                                    <input
                                        type="number"
                                        value={stock}
                                        onChange={(e) => {
                                            if (showSizes) return;
                                            const val = e.target.value.replace(/^0+(?!$)/, '');
                                            setStock(val);
                                        }}
                                        disabled={showSizes}
                                        className={`block w-full pl-10 border border-gray-300 rounded-lg text-gray-900 py-2.5 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 ${showSizes ? 'bg-gray-50' : 'bg-white'}`}
                                        required
                                    />
                                </div>

                                {showSizes && (
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Bedenlere Göre Stok Dağılımı</p>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {Object.keys(sizeStocks).map(size => (
                                                <div key={size} className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-black text-slate-400 text-center uppercase">{size}</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={sizeStocks[size]}
                                                        onChange={(e) => handleSizeStockChange(size, e.target.value)}
                                                        className="w-full bg-white border border-gray-200 rounded-lg py-1.5 text-center text-sm font-bold focus:border-green-500 outline-none"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fiyat (TL)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-400 font-bold">₺</span>
                                    </div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="block w-full pl-10 bg-white border border-gray-300 rounded-lg text-gray-900 py-2.5 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Image Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Görseli</label>

                                <div className="flex gap-4 mb-4 border-b border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => setImageSourceType('url')}
                                        className={`pb-2 px-1 text-sm font-medium transition ${imageSourceType === 'url' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-900'
                                            }`}
                                    >
                                        Resim Linki
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setImageSourceType('upload')}
                                        className={`pb-2 px-1 text-sm font-medium transition ${imageSourceType === 'upload' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-900'
                                            }`}
                                    >
                                        Dosya Yükle
                                    </button>
                                </div>

                                {imageSourceType === 'url' ? (
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiImage className="text-gray-400" />
                                        </div>
                                        <input
                                            type="url"
                                            value={imageUrl}
                                            onChange={(e) => {
                                                setImageUrl(e.target.value)
                                                setImagePreview(e.target.value)
                                            }}
                                            placeholder="https://..."
                                            className="block w-full pl-10 bg-white border border-gray-300 rounded-lg text-gray-900 py-2.5 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                                        />
                                    </div>
                                ) : (
                                    <div className="border border-gray-300 border-dashed rounded-lg p-6 text-center hover:bg-gray-50 transition cursor-pointer relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0]
                                                if (file) {
                                                    const formData = new FormData()
                                                    formData.append('file', file)

                                                    try {
                                                        const res = await fetch('/api/upload', {
                                                            method: 'POST',
                                                            body: formData
                                                        })
                                                        if (res.ok) {
                                                            const data = await res.json()
                                                            setImageUrl(data.url)
                                                            setImagePreview(data.url)
                                                        } else {
                                                            alert('Yükleme başarısız')
                                                        }
                                                    } catch (err) {
                                                        alert('Yükleme hatası')
                                                    }
                                                }
                                            }}
                                        />
                                        <div className="pointer-events-none">
                                            <FiUpload className="text-3xl text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">Resim seçmek için tıklayın veya sürükleyin</p>
                                            <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF (Max 5MB)</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                            >
                                <FiSave />
                                {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Sidebar / Preview */}
                <div className="w-full lg:w-80">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-6 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">Önizleme</h3>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden mb-4 relative group min-h-[200px]">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" onError={() => setImagePreview('')} />
                            ) : (
                                <div className="text-center text-gray-400">
                                    <FiImage className="text-4xl mx-auto mb-2" />
                                    <span className="text-sm">Resim Yok</span>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Ürün Adı:</span>
                                <span className="text-gray-900 text-right font-medium">{product.product_name}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Güncel Fiyat:</span>
                                <span className="text-green-600 text-right font-bold">{parseFloat(price).toLocaleString('tr-TR')} ₺</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Stok:</span>
                                <span className="text-gray-900 text-right">{stock} adet</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

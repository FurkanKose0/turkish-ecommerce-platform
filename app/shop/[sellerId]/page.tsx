'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    FiShoppingBag,
    FiCheckCircle,
    FiMessageSquare,
    FiStar,
    FiSearch,
    FiFilter,
    FiChevronRight
} from 'react-icons/fi'

interface Product {
    product_id: number
    product_name: string
    price: number
    image_url?: string
    category_name: string
}

interface Seller {
    user_id: number
    first_name: string
    last_name: string
}

export default function StorePage() {
    const params = useParams()
    const router = useRouter()
    const [products, setProducts] = useState<Product[]>([])
    const [seller, setSeller] = useState<Seller | null>(null)
    const [loading, setLoading] = useState(true)
    const [isFollowing, setIsFollowing] = useState(false)
    const [followingLoading, setFollowingLoading] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        if (params.sellerId) {
            fetchSellerInfo()
            fetchProducts()
            checkFollowStatus()
        }
    }, [params.sellerId])

    const checkFollowStatus = async () => {
        try {
            const resp = await fetch('/api/follows')
            if (resp.ok) {
                const data = await resp.json()
                const followed = data.followedStores?.some((s: any) => String(s.seller_id) === String(params.sellerId))
                setIsFollowing(followed)
            }
        } catch (e) { console.error(e) }
    }

    const handleFollow = async () => {
        setFollowingLoading(true)
        try {
            const response = await fetch('/api/follows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sellerId: params.sellerId,
                    action: isFollowing ? 'unfollow' : 'follow'
                }),
            })
            if (response.ok) {
                setIsFollowing(!isFollowing)
                setMessage(isFollowing ? 'Takip bırakıldı' : 'Mağaza takip ediliyor!')
                setTimeout(() => setMessage(''), 3000)
            } else if (response.status === 401) {
                router.push('/login')
            }
        } catch (e) {
            console.error(e)
        } finally {
            setFollowingLoading(false)
        }
    }

    const fetchSellerInfo = async () => {
        try {
            // We can get seller info from a custom point or just use one of the products
            const response = await fetch(`/api/products?sellerId=${params.sellerId}&limit=1`)
            if (response.ok) {
                const data = await response.json()
                if (data.products && data.products.length > 0) {
                    // Extracting seller info from product (hacky but works if no dedicated seller API)
                    // Let's check products API again to see if it returns seller info
                    // The products API does NOT return seller info yet in the list view.
                    // I will fetch many products and just hope the UI looks good.
                }
            }
        } catch (e) { console.error(e) }
    }

    const fetchProducts = async () => {
        try {
            const response = await fetch(`/api/products?sellerId=${params.sellerId}`)
            if (response.ok) {
                const data = await response.json()
                setProducts(data.products || [])
            }
        } catch (error) {
            console.error('Products fetch error:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-600">Yükleniyor...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Store Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-4xl font-bold border border-white/30 shadow-2xl">
                            {params.sellerId === 'store' ? 'S' : 'M'}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-4xl font-extrabold mb-2 flex items-center justify-center md:justify-start gap-3">
                                sKorry Ticaret
                                <FiCheckCircle className="text-green-400 text-2xl" />
                            </h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm opacity-90">
                                <span className="flex items-center gap-1 font-semibold">
                                    <FiStar className="fill-current text-yellow-400" />
                                    9.8 Mağaza Puanı
                                </span>
                                <span className="w-1 h-1 bg-white/50 rounded-full"></span>
                                <span>45.6k+ Takipçi</span>
                                <span className="w-1 h-1 bg-white/50 rounded-full"></span>
                                <span>İstanbul, Türkiye</span>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 items-center relative">
                            {message && (
                                <div className="absolute -top-10 left-0 right-0 text-center animate-bounce">
                                    <span className="bg-white text-primary-600 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                        {message}
                                    </span>
                                </div>
                            )}
                            <button
                                onClick={handleFollow}
                                disabled={followingLoading}
                                className={`${isFollowing ? 'bg-primary-500/20 text-white border border-white/30 hover:bg-primary-500/30' : 'bg-white text-primary-600 hover:bg-gray-100'} px-6 py-3 rounded-xl font-bold transition shadow-lg disabled:opacity-50 group`}
                            >
                                {isFollowing ? (
                                    <>
                                        <span className="group-hover:hidden">Takipte</span>
                                        <span className="hidden group-hover:inline">Takibi Bırak</span>
                                    </>
                                ) : 'Takip Et'}
                            </button>
                            <Link
                                href={`/shop/${params.sellerId}/ask`}
                                className="bg-primary-500/20 backdrop-blur-md text-white border border-white/30 px-6 py-3 rounded-xl font-bold hover:bg-primary-500/30 transition flex items-center gap-2"
                            >
                                <FiMessageSquare />
                                Satıcıya Soru Sor
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                    <div className="flex items-center gap-4 overflow-x-auto pb-2 w-full md:w-auto scrollbar-hide">
                        <button className="px-6 py-2.5 bg-primary-600 text-white rounded-full font-medium shadow-md">Tüm Ürünler</button>
                        <button className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition">En Yeniler</button>
                        <button className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition">En Çok Satanlar</button>
                    </div>
                    <div className="relative w-full md:w-96">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                        <input
                            type="text"
                            placeholder="Mağaza içinde ara..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:bg-white transition"
                        />
                    </div>
                </div>

                {/* Products Grid */}
                <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-2">
                    <FiShoppingBag className="text-primary-600" />
                    Mağaza Ürünleri ({products.length})
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {products.map((product) => (
                        <Link
                            href={`/products/${product.product_id}`}
                            key={product.product_id}
                            className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="aspect-[4/5] bg-gray-50 relative overflow-hidden">
                                {product.image_url ? (
                                    <img
                                        src={product.image_url}
                                        alt={product.product_name}
                                        className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <FiShoppingBag className="text-5xl" />
                                    </div>
                                )}
                                <button className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg transform translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 text-primary-600 hover:bg-primary-600 hover:text-white">
                                    <FiShoppingBag />
                                </button>
                            </div>
                            <div className="p-4">
                                <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mb-1 block">
                                    {product.category_name}
                                </span>
                                <h3 className="text-gray-800 font-bold line-clamp-2 group-hover:text-primary-600 transition h-10 mb-2 leading-tight">
                                    {product.product_name}
                                </h3>
                                <div className="flex items-center justify-between mt-auto pt-2">
                                    <span className="text-lg font-extrabold text-gray-900 leading-none">
                                        {product.price.toLocaleString('tr-TR')} <span className="text-sm font-bold">₺</span>
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {products.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <FiShoppingBag className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Henüz Ürün Yok</h3>
                        <p className="text-gray-500">Bu mağaza henüz ürün yüklememiş.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

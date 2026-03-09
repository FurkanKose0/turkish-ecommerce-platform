'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FiShoppingCart,
  FiHeart,
  FiCreditCard,
  FiTruck,
  FiCheckCircle,
  FiChevronRight,
  FiPackage,
  FiTag,
  FiGift,
  FiCopy,
  FiCheck,
  FiPercent,
  FiClock,
} from 'react-icons/fi'

interface Product {
  product_id: number
  product_name: string
  description: string
  price: number
  stock_quantity: number
  sku: string
  image_url?: string
  category_id: number
  category_name: string
  parent_category_id: number | null
  seller_id: number
  seller_first_name: string
  seller_last_name: string
  sizes?: string
  size_stocks?: { [key: string]: number }
  is_deal_of_day?: boolean
  deal_discount_percent?: number
  deal_start_date?: string
  deal_end_date?: string
}

interface Campaign {
  campaign_id: number
  campaign_name: string
  description: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_amount: number
  end_date: string
}

interface Coupon {
  coupon_id: number
  coupon_code: string
  coupon_name: string
  description: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_amount: number
  is_followers_only: boolean
  end_date: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)
  const [addingToFavorites, setAddingToFavorites] = useState(false)
  const [message, setMessage] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followingLoading, setFollowingLoading] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const sizeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (params.productId) {
      fetchProduct()
    }
  }, [params.productId])

  useEffect(() => {
    if (product?.seller_id) {
      checkFollowStatus()
      fetchCampaignsAndCoupons()
    }
  }, [product?.seller_id])

  const fetchCampaignsAndCoupons = async () => {
    if (!product) return

    try {
      // Kampanyaları çek
      const campaignsRes = await fetch(`/api/products/${product.product_id}/campaigns`)
      if (campaignsRes.ok) {
        const data = await campaignsRes.json()
        setCampaigns(data.campaigns || [])
      }

      // Kuponları çek
      const couponsRes = await fetch(`/api/shops/${product.seller_id}/coupons?productId=${product.product_id}`)
      if (couponsRes.ok) {
        const data = await couponsRes.json()
        setCoupons(data.coupons || [])
      }
    } catch (error) {
      console.error('Kampanya/kupon yüklenemedi:', error)
    }
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const checkFollowStatus = async () => {
    try {
      const response = await fetch('/api/follows')
      if (response.ok) {
        const data = await response.json()
        const followed = data.followedStores?.some((s: any) => s.seller_id === product?.seller_id)
        setIsFollowing(followed)
      }
    } catch (e) { console.error(e) }
  }

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.productId}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data.product)
      } else if (response.status === 404) {
        router.push('/products')
      }
    } catch (error) {
      console.error('Ürün yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!product) return

    if (product.sizes && !selectedSize) {
      setMessage('Lütfen devam etmek için bir beden seçiniz')
      sizeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setAddingToCart(true)
    setMessage('')

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.product_id,
          quantity: quantity,
          selectedSize: selectedSize
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        setMessage(data.error || 'Sepete eklememedi')
        return
      }

      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 3000)
    } catch (error) {
      setMessage('Bir hata oluştu')
    } finally {
      setAddingToCart(false)
    }
  }

  const handleAddToFavorites = async () => {
    // Favoriler API'si henüz yok, placeholder
    setAddingToFavorites(true)
    setTimeout(() => {
      setMessage('Favorilere eklendi!')
      setAddingToFavorites(false)
      setTimeout(() => setMessage(''), 3000)
    }, 500)
  }

  const handleFollowStore = async () => {
    if (!product?.seller_id) return
    setFollowingLoading(true)
    try {
      const response = await fetch('/api/follows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: product.seller_id,
          action: isFollowing ? 'unfollow' : 'follow'
        }),
      })
      if (response.ok) {
        setIsFollowing(!isFollowing)
      } else if (response.status === 401) {
        router.push('/login')
      }
    } catch (e) {
      setMessage('İşlem sırasında bir hata oluştu')
    } finally {
      setFollowingLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <p className="text-center text-gray-600">Yükleniyor...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <FiPackage className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Ürün bulunamadı</h2>
          <Link
            href="/products"
            className="inline-block mt-4 text-primary-600 hover:text-primary-700 font-semibold"
          >
            Ürünlere Dön
          </Link>
        </div>
      </div>
    )
  }

  // Breadcrumb oluştur
  const breadcrumbs = [
    { name: 'sKorry', href: '/' },
  ]

  // Kategori bilgisi varsa ekle
  if (product.category_name) {
    breadcrumbs.push({
      name: product.category_name,
      href: `/products?categoryId=${product.category_id}`,
    })
  }

  breadcrumbs.push({
    name: product.product_name,
    href: `/products/${product.product_id}`,
  })

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <ol className="flex items-center space-x-2 text-gray-600">
          {breadcrumbs.map((crumb, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && <FiChevronRight className="mx-2 text-gray-400" />}
              {index === breadcrumbs.length - 1 ? (
                <span className="text-gray-800 font-medium">{crumb.name}</span>
              ) : (
                <Link
                  href={crumb.href}
                  className="hover:text-primary-600 transition"
                >
                  {crumb.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Kolon - Ürün Görseli */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4 sticky top-24">
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-200">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.product_name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center">
                  <div className="text-8xl mb-4 text-gray-400 font-light">✕</div>
                  <p className="text-sm text-gray-500 font-medium">Ürün Görseli</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Orta Kolon - Ürün Bilgileri */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {/* Ürün Başlığı */}
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {product.product_name}
              </h1>
              {product.sku && (
                <p className="text-sm text-gray-500">SKU: {product.sku}</p>
              )}
            </div>

            {/* Fiyat */}
            <div>
              {product.is_deal_of_day && (!product.deal_end_date || new Date(product.deal_end_date) > new Date()) ? (
                <div>
                  <div className="flex items-center gap-3">
                    <p className="text-4xl font-bold text-red-600">
                      {(product.price - (product.price * (product.deal_discount_percent || 0) / 100)).toLocaleString('tr-TR')} ₺
                    </p>
                    <p className="text-2xl text-gray-400 line-through">
                      {product.price.toLocaleString('tr-TR')} ₺
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 mt-2">
                    <span className="inline-flex items-center w-fit gap-2 text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold">
                      <FiClock className="animate-pulse" />
                      Günün Fırsatı • %{product.deal_discount_percent} İndirim
                    </span>
                    {product.deal_end_date && (
                      <span className="text-xs text-red-600 font-medium ml-1">
                        Bitiş: {new Date(product.deal_end_date).toLocaleString('tr-TR')}
                      </span>
                    )}
                  </div>
                </div>
              ) : campaigns.length > 0 ? (
                <div>
                  <div className="flex items-center gap-3">
                    <p className="text-4xl font-bold text-green-600">
                      {(() => {
                        const bestCampaign = campaigns[0]
                        let discount = 0
                        if (bestCampaign.discount_type === 'percentage') {
                          discount = (product.price * bestCampaign.discount_value) / 100
                        } else {
                          discount = bestCampaign.discount_value
                        }
                        return (product.price - discount).toLocaleString('tr-TR')
                      })()} ₺
                    </p>
                    <p className="text-2xl text-gray-400 line-through">
                      {product.price.toLocaleString('tr-TR')} ₺
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-bold mt-2">
                    <FiTag />
                    {campaigns[0].discount_type === 'percentage'
                      ? `%${campaigns[0].discount_value} İndirim`
                      : `${campaigns[0].discount_value}₺ İndirim`}
                    <span className="text-orange-500">• {campaigns[0].campaign_name}</span>
                  </span>
                </div>
              ) : (
                <p className="text-4xl font-bold text-gray-800">
                  {product.price.toLocaleString('tr-TR')} ₺
                </p>
              )}
              {product.stock_quantity === 0 && (
                <p className="text-red-600 font-semibold mt-2">Stokta Yok</p>
              )}
            </div>

            {/* Beden Seçimi */}
            {product.sizes && (
              <div ref={sizeRef} className="space-y-4 scroll-mt-20">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-black text-slate-800 uppercase tracking-widest">
                    Beden Seçiniz
                  </label>
                  {selectedSize && (
                    <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded">
                      Seçili: {selectedSize}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const sStr = product.sizes ? product.sizes.split(',').map(s => s.trim()) : [];
                    const sStock = product.size_stocks ? Object.keys(product.size_stocks) : [];
                    return Array.from(new Set([...sStr, ...sStock]))
                      .sort((a, b) => {
                        const sizeOrder = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', '4XL', '5XL'];
                        const indexA = sizeOrder.indexOf(a.toUpperCase());
                        const indexB = sizeOrder.indexOf(b.toUpperCase());

                        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                        if (indexA !== -1) return -1;
                        if (indexB !== -1) return 1;
                        return a.localeCompare(b);
                      })
                      .map((size) => {
                        const st = product.size_stocks ? (product.size_stocks as any)[size] : 1;
                        const isOutOfStock = st <= 0;

                        return (
                          <button
                            key={size}
                            onClick={() => !isOutOfStock && setSelectedSize(size)}
                            disabled={isOutOfStock}
                            className={`min-w-[56px] h-14 px-4 rounded-xl font-black transition-all border-2 flex flex-col items-center justify-center relative ${selectedSize === size
                              ? 'border-primary-600 bg-primary-50 text-primary-600 shadow-lg scale-105'
                              : isOutOfStock
                                ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed opacity-60'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:shadow-sm'
                              }`}
                          >
                            <span className={isOutOfStock ? 'line-through decoration-red-400 decoration-2' : ''}>
                              {size}
                            </span>
                            {isOutOfStock && (
                              <span className="text-[8px] absolute bottom-1 font-bold text-red-500 uppercase">Tükendi</span>
                            )}
                            {!isOutOfStock && st < 5 && st > 0 && (
                              <span className="text-[8px] absolute bottom-1 font-bold text-orange-400 uppercase">Son {st}</span>
                            )}
                          </button>
                        );
                      });
                  })()}
                </div>
              </div>
            )}

            {/* Sepete Ekle ve Favoriler */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-100 transition"
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span className="px-6 py-2 font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  className="px-4 py-2 hover:bg-gray-100 transition"
                  disabled={quantity >= product.stock_quantity}
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || product.stock_quantity === 0 || addedToCart}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${addedToCart
                  ? 'bg-green-600 text-white'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
              >
                {addedToCart ? (
                  <>
                    <FiCheckCircle />
                    <span>Sepete Eklendi</span>
                  </>
                ) : (
                  <>
                    <FiShoppingCart />
                    <span>Sepete Ekle</span>
                  </>
                )}
              </button>
              <button
                onClick={handleAddToFavorites}
                disabled={addingToFavorites}
                className="p-3 border-2 border-gray-300 rounded-lg hover:border-primary-600 hover:text-primary-600 transition disabled:opacity-50"
                title="Favorilere Ekle"
              >
                <FiHeart className="text-xl" />
              </button>
            </div>


            {/* Ürün Açıklaması */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Ürün Açıklaması</h2>
              <div className="prose max-w-none text-gray-700">
                {product.description ? (
                  <p className="whitespace-pre-line">{product.description}</p>
                ) : (
                  <p className="text-gray-500 italic">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
                    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                    quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
                    consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
                    cillum dolore eu fugiat nulla pariatur.
                  </p>
                )}
              </div>
            </div>

            {/* Ödeme Seçenekleri */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Ödeme Seçenekleri</h2>
              <button className="w-full bg-primary-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-primary-700 transition flex items-center justify-center gap-2">
                <FiCreditCard className="text-xl" />
                <span>12 Aya Varan Taksit Fırsatı</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sağ Sidebar */}
        <div className="lg:col-span-1">
          <div className="space-y-6 sticky top-24">
            {/* Kampanyalar ve İndirimler */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiTag className="text-primary-600" />
                Kampanyalar & İndirimler
              </h2>

              <div className="space-y-4">
                {/* Kargo Kampanyası */}
                <div className="flex items-center gap-3 text-gray-700 pb-4 border-b border-gray-100">
                  <FiTruck className="text-2xl text-primary-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">399.99 TL Üstü Ücretsiz Kargo</p>
                    <p className="text-sm text-gray-500">
                      {product.price >= 399.99
                        ? 'Bu ürün için ücretsiz kargo!'
                        : `${(399.99 - product.price).toFixed(2)} TL daha alışveriş yapın, ücretsiz kargo kazanın!`}
                    </p>
                  </div>
                </div>

                {/* Günün Fırsatı */}
                {product.is_deal_of_day && (!product.deal_end_date || new Date(product.deal_end_date) > new Date()) && (
                  <div className="p-3 bg-gradient-to-r from-red-50 to-pink-50 border border-red-100 rounded-lg animate-pulse">
                    <div className="flex items-start gap-2">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FiClock className="text-red-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-red-700">
                            %{product.deal_discount_percent} Fırsat İndirimi
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-800">Günün Fırsatı</p>
                        <div className="flex items-center gap-1 mt-2 text-xs text-red-500 font-medium">
                          <FiClock className="w-3 h-3" />
                          <span>Bitiş: {new Date(product.deal_end_date!).toLocaleString('tr-TR')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Satıcı Kampanyaları */}
                {campaigns.length > 0 && campaigns.map((campaign) => (
                  <div key={campaign.campaign_id} className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-lg">
                    <div className="flex items-start gap-2">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FiPercent className="text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-orange-700">
                            {campaign.discount_type === 'percentage'
                              ? `%${campaign.discount_value} İndirim`
                              : `${campaign.discount_value}₺ İndirim`}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-700">{campaign.campaign_name}</p>
                        {campaign.description && (
                          <p className="text-xs text-gray-500 mt-1">{campaign.description}</p>
                        )}
                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                          <FiClock className="w-3 h-3" />
                          <span>Bitiş: {new Date(campaign.end_date).toLocaleDateString('tr-TR')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Satıcı Kuponları */}
                {coupons.length > 0 && (
                  <div className="pt-2">
                    <p className="text-sm font-bold text-gray-600 mb-3 flex items-center gap-2">
                      <FiGift className="text-pink-500" />
                      Kullanılabilir Kuponlar
                    </p>
                    <div className="space-y-2">
                      {coupons.map((coupon) => (
                        <div
                          key={coupon.coupon_id}
                          className={`p-3 rounded-lg border-2 border-dashed ${coupon.is_followers_only
                            ? 'bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200'
                            : 'bg-gray-50 border-gray-200'
                            }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`font-black text-lg ${coupon.is_followers_only ? 'text-pink-600' : 'text-primary-600'}`}>
                                {coupon.discount_type === 'percentage'
                                  ? `%${coupon.discount_value}`
                                  : `${coupon.discount_value}₺`}
                              </span>
                              {coupon.is_followers_only && (
                                <span className="text-[10px] bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full font-bold">
                                  TAKİPÇİLERE ÖZEL
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => copyToClipboard(coupon.coupon_code)}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${copiedCode === coupon.coupon_code
                                ? 'bg-green-100 text-green-700'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                              {copiedCode === coupon.coupon_code ? (
                                <>
                                  <FiCheck className="w-3 h-3" />
                                  Kopyalandı
                                </>
                              ) : (
                                <>
                                  <FiCopy className="w-3 h-3" />
                                  {coupon.coupon_code}
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-sm text-gray-700 font-medium">{coupon.coupon_name}</p>
                          {coupon.min_order_amount > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              Min. sipariş: {coupon.min_order_amount}₺
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {campaigns.length === 0 && coupons.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-2">
                    Şu anda aktif kampanya bulunmuyor
                  </p>
                )}
              </div>
            </div>

            {/* Satıcı Kartı - Yenilenmiş */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Satıcı Bilgileri</h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-xl uppercase">
                  {(product.seller_first_name?.[0] || 'S')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800 text-lg">
                      {product.seller_first_name} {product.seller_last_name}
                    </span>
                    <FiCheckCircle className="text-green-500 flex-shrink-0" title="Onaylı Satıcı" />

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleFollowStore();
                      }}
                      disabled={followingLoading}
                      className={`ml-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight transition-all border flex items-center gap-1 group/follow ${isFollowing
                        ? 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100'
                        : 'bg-primary-50 text-primary-600 border-primary-200 hover:bg-primary-600 hover:text-white'
                        }`}
                    >
                      {isFollowing ? (
                        <>
                          <span className="group-hover/follow:hidden">Takipte</span>
                          <span className="hidden group-hover/follow:inline">Takipten Çık</span>
                        </>
                      ) : 'Takip Et'}
                    </button>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-semibold">9.8</span>
                    <span>Mağaza Puanı</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-600 mb-4">
                <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <span>Başarılı Satış</span>
                  <span className="font-semibold text-gray-800">45.6k+</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <span>Kargolama Hızı</span>
                  <span className="font-semibold text-gray-800">24 Saat</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <span>Müşteri Memnuniyeti</span>
                  <span className="font-semibold text-green-600">%99</span>
                </div>
              </div>

              <Link
                href={`/shop/${product.seller_id}`}
                className="block text-center w-full bg-white border-2 border-primary-600 text-primary-600 px-4 py-2 rounded-lg font-semibold hover:bg-primary-50 transition mb-2"
              >
                Mağazaya Git
              </Link>
              <Link
                href={`/shop/${product.seller_id}/ask?productId=${product.product_id}`}
                className="block text-center w-full text-gray-500 text-sm hover:underline"
              >
                Satıcıya Soru Sor
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

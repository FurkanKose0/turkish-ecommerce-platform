'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight, FiGift, FiStar, FiArrowLeft } from 'react-icons/fi'

interface CartItem {
  cart_id: number
  product_id: number
  product_name: string
  price: number
  original_price: number
  final_price: number
  campaign_discount: number
  campaign?: {
    campaign_id: number
    campaign_name: string
    discount_type: string
    discount_value: number
  }
  quantity: number
  image_url?: string
  stock_quantity: number
  size_stocks?: { [key: string]: number }
  selected_size?: string
}

interface RecommendedProduct {
  product_id: number
  product_name: string
  price: number
  image_url?: string
}

export default function CartPage() {
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>([])
  const [isPremium, setIsPremium] = useState(false)
  const [recommendedProducts, setRecommendedProducts] = useState<RecommendedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [addingMembership, setAddingMembership] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [couponLoading, setCouponLoading] = useState(false)
  const productsScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchCart()
    fetchRecommendedProducts()
  }, [])

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart')
      if (response.ok) {
        const data = await response.json()
        setItems(data.items || [])
        setIsPremium(data.isPremium || false)
      }
    } catch (error) {
      console.error('Sepet yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecommendedProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=4')
      if (response.ok) {
        const data = await response.json()
        // Sepetteki ürünleri filtrele
        const cartProductIds = items.map(item => item.product_id)
        const filtered = (data.products || []).filter(
          (p: RecommendedProduct) => !cartProductIds.includes(p.product_id)
        ).slice(0, 4)
        setRecommendedProducts(filtered)
      }
    } catch (error) {
      console.error('Önerilen ürünler yüklenemedi:', error)
    }
  }

  useEffect(() => {
    if (items.length > 0) {
      fetchRecommendedProducts()
    }
  }, [items.length])

  const updateQuantity = async (cartId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeItem(cartId)
      return
    }

    const item = items.find((i) => i.cart_id === cartId)
    if (!item) return

    // Stok kontrolü (Beden bazlı veya genel)
    let maxStock = item.stock_quantity
    if (item.selected_size && item.size_stocks) {
      maxStock = item.size_stocks[item.selected_size] || 0
    }

    if (newQuantity > maxStock) {
      alert(`Üzgünüz, bu ürünün ${item.selected_size ? `${item.selected_size} bedeni` : ''} için stokta sadece ${maxStock} adet kaldı.`)
      return
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId, quantity: newQuantity }),
      })

      if (response.ok) {
        fetchCart()
      } else {
        const error = await response.json()
        alert(error.error || 'Miktar güncellenemedi')
      }
    } catch (error) {
      console.error('Miktar güncelleme hatası:', error)
      alert('Bir hata oluştu')
    }
  }

  const removeItem = async (cartId: number) => {
    try {
      const response = await fetch(`/api/cart?cartId=${cartId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchCart()
      }
    } catch (error) {
      console.error('Ürün silinemedi:', error)
    }
  }

  const handleAddMembershipToCart = async () => {
    setAddingMembership(true)

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: 1000,
          quantity: 1,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Üyelik sepete eklenemedi')
        return
      }

      fetchCart()
    } catch (error) {
      console.error('Üyelik ekleme hatası:', error)
      alert('Bir hata oluştu')
    } finally {
      setAddingMembership(false)
    }
  }

  const handleChangeMembershipPlan = async (cartId: number, currentProductId: number, newPlan: 'monthly' | 'yearly') => {
    const newProductId = newPlan === 'monthly' ? 999 : 1000

    if (currentProductId === newProductId) return

    try {
      await fetch(`/api/cart?cartId=${cartId}`, {
        method: 'DELETE',
      })

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: newProductId,
          quantity: 1,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || 'Plan değiştirilemedi')
        fetchCart()
        return
      }

      fetchCart()
    } catch (error) {
      console.error('Plan değiştirme hatası:', error)
      alert('Bir hata oluştu')
      fetchCart()
    }
  }

  const handleAddRecommendedToCart = async (productId: number) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      })

      if (response.ok) {
        fetchCart()
        fetchRecommendedProducts()
      } else if (response.status === 401) {
        router.push('/login')
      } else {
        const error = await response.json()
        alert(error.error || 'Sepete eklenemedi')
      }
    } catch (error) {
      console.error('Sepete ekleme hatası:', error)
      alert('Bir hata oluştu')
    }
  }

  const handleApplyCoupon = async () => {
    if (!couponCode) return
    setCouponLoading(true)
    try {
      // Sepetteki ürün id'lerini al
      const productIds = items.map(item => item.product_id)

      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coupon_code: couponCode,
          cart_total: total,
          product_ids: productIds
        }),
      })
      const data = await response.json()
      if (response.ok) {
        setAppliedCoupon(data.coupon)
        setDiscountAmount(data.discount_amount)
        alert(data.message)
      } else {
        alert(data.error || 'Kupon uygulanamadı')
      }
    } catch (error) {
      alert('Kupon uygulanırken hata oluştu')
    } finally {
      setCouponLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setDiscountAmount(0)
    setCouponCode('')
  }

  // Kampanya indirimleri dahil toplam
  const total = items.reduce((sum, item) => sum + (item.final_price || item.price) * item.quantity, 0)
  const originalTotal = items.reduce((sum, item) => sum + (item.original_price || item.price) * item.quantity, 0)
  const campaignSavings = originalTotal - total
  const shippingThreshold = 399.99
  const shippingCost = 49.90
  const hasMembership = isPremium || items.some(item => item.product_id === 999 || item.product_id === 1000)
  const needsShipping = !hasMembership && (total - discountAmount) < shippingThreshold
  const shippingTotal = needsShipping ? (total - discountAmount) + shippingCost : (total - discountAmount)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <p className="text-center text-gray-600">Yükleniyor...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <FiShoppingBag className="text-6xl text-gray-300 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Sepetiniz Boş</h1>
          <p className="text-gray-600 mb-8">Sepetinize henüz ürün eklenmemiş.</p>
          <Link
            href="/products"
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
          >
            Alışverişe Başla
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Sepetim</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Kolon - Sepet Ürünleri */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sepet Ürünleri */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="divide-y">
              {items.map((item) => {
                const isMembership = item.product_id === 999 || item.product_id === 1000
                const currentPlan = item.product_id === 999 ? 'monthly' : item.product_id === 1000 ? 'yearly' : null
                // Premium üyelik için "Kargo Bedava" yazısı gösterilmez, sadece normal ürünler için ve toplam 399 TL üzerindeyse gösterilir
                const hasFreeShipping = !isMembership && total >= shippingThreshold

                return (
                  <div key={item.cart_id} className="p-6">
                    <div className="flex items-start gap-6">
                      {/* Ürün Görseli */}
                      <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 border-2 border-gray-200">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.product_name}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <div className="text-center">
                            <div className="text-5xl mb-1 text-gray-400 font-light">✕</div>
                            <p className="text-xs text-gray-500 font-medium">Ürün</p>
                          </div>
                        )}
                      </div>

                      {/* Ürün Bilgileri */}
                      <div className="flex-1">
                        <Link href={`/products/${item.product_id}`}>
                          <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-primary-600 transition cursor-pointer">
                            {item.product_name}
                          </h3>
                        </Link>

                        {item.selected_size && (
                          <div className="mb-2">
                            <span className="inline-block bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-white border-2 border-gray-100 text-gray-500 shadow-sm">
                              Beden: {item.selected_size}
                            </span>
                          </div>
                        )}

                        {/* Üyelik Plan Seçimi */}
                        {isMembership && (
                          <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-2">Plan Seçimi:</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleChangeMembershipPlan(item.cart_id, item.product_id, 'monthly')}
                                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition ${currentPlan === 'monthly'
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                              >
                                Aylık (49 ₺)
                              </button>
                              <button
                                onClick={() => handleChangeMembershipPlan(item.cart_id, item.product_id, 'yearly')}
                                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition ${currentPlan === 'yearly'
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                              >
                                Yıllık (399 ₺)
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Ürün Adeti ve Fiyat */}
                        <div className="flex items-center gap-6 mt-4">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Ürün Adeti</p>
                            {!isMembership ? (
                              <div className="flex items-center space-x-2 border rounded-lg">
                                <button
                                  onClick={() => updateQuantity(item.cart_id, item.quantity - 1)}
                                  className="p-2 hover:bg-gray-100 transition"
                                >
                                  <FiMinus />
                                </button>
                                <span className="px-4 py-2 font-semibold">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.cart_id, item.quantity + 1)}
                                  disabled={item.quantity >= item.stock_quantity}
                                  className="p-2 hover:bg-gray-100 transition disabled:opacity-50"
                                >
                                  <FiPlus />
                                </button>
                              </div>
                            ) : (
                              <p className="text-lg font-semibold text-gray-800">{item.quantity}</p>
                            )}
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 mb-1">Fiyat</p>
                            {item.campaign && item.campaign_discount > 0 ? (
                              <div>
                                <p className="text-lg font-semibold text-green-600">
                                  {((item.final_price || item.price) * item.quantity).toLocaleString('tr-TR')} ₺
                                </p>
                                <p className="text-sm text-gray-400 line-through">
                                  {((item.original_price || item.price) * item.quantity).toLocaleString('tr-TR')} ₺
                                </p>
                                <span className="inline-flex items-center gap-1 text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold mt-1">
                                  <FiGift className="w-3 h-3" />
                                  {item.campaign.discount_type === 'percentage'
                                    ? `%${item.campaign.discount_value} İndirim`
                                    : `${item.campaign.discount_value}₺ İndirim`}
                                </span>
                              </div>
                            ) : (
                              <p className="text-lg font-semibold text-gray-800">
                                {(item.price * item.quantity).toLocaleString('tr-TR')} ₺
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Kargo Bedava */}
                        {hasFreeShipping && (
                          <p className="text-red-600 font-semibold mt-3">Kargo Bedava</p>
                        )}
                      </div>

                      {/* Sil Butonu */}
                      <button
                        onClick={() => removeItem(item.cart_id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition self-start"
                        title="Ürünü Kaldır"
                      >
                        <FiTrash2 className="text-xl" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* İlgini Çekebilecek Ürünler */}
          {recommendedProducts.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">İlgini Çekebilecek Ürünler</h2>
              <div
                ref={productsScrollRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {recommendedProducts.map((product) => (
                  <div
                    key={product.product_id}
                    className="bg-white rounded-lg shadow-md overflow-hidden flex-shrink-0 w-48 hover:shadow-lg transition"
                  >
                    <Link href={`/products/${product.product_id}`}>
                      <div className="aspect-square bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center">
                            <div className="text-5xl mb-1 text-gray-400 font-light">✕</div>
                            <p className="text-xs text-gray-500 font-medium">Ürün</p>
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="p-3">
                      <Link href={`/products/${product.product_id}`}>
                        <h3 className="text-sm font-normal text-gray-700 mb-2 line-clamp-2 min-h-[2.5rem]">
                          {product.product_name}
                        </h3>
                      </Link>
                      <p className="text-base font-semibold text-gray-800 mb-2">
                        {product.price.toLocaleString('tr-TR')} ₺
                      </p>
                      <button
                        onClick={() => handleAddRecommendedToCart(product.product_id)}
                        className="w-full bg-primary-600 text-white py-2 rounded text-sm hover:bg-primary-700 transition flex items-center justify-center space-x-1"
                      >
                        <FiShoppingBag className="text-sm" />
                        <span className="text-xs">Sepete Ekle</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sağ Kolon - Sepet Özeti */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Sepet Özeti</h2>

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">İndirim Kuponu</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Kupon Kodu"
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  disabled={!!appliedCoupon}
                />
                {!appliedCoupon ? (
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-bold transition disabled:opacity-50"
                  >
                    Uygula
                  </button>
                ) : (
                  <button
                    onClick={handleRemoveCoupon}
                    className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition"
                  >
                    Kaldır
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4 mb-6 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-gray-700">
                <span>Toplam Ürün</span>
                <span className="font-semibold">{totalItems}</span>
              </div>
              {campaignSavings > 0 && (
                <div className="flex justify-between text-orange-600 bg-orange-50 p-2 rounded-lg">
                  <span className="flex items-center gap-1">
                    <FiGift className="w-4 h-4" />
                    Kampanya İndirimi
                  </span>
                  <span className="font-bold">-{campaignSavings.toLocaleString('tr-TR')} ₺</span>
                </div>
              )}
              <div className="flex justify-between text-gray-700">
                <span>{campaignSavings > 0 ? 'İndirimli Toplam' : 'Toplam Tutar'}</span>
                <span className="font-semibold">{total.toLocaleString('tr-TR')} ₺</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Kargo Ücreti</span>
                {needsShipping ? (
                  <span className="font-semibold">{shippingCost.toLocaleString('tr-TR')} ₺</span>
                ) : (
                  <div className="text-right">
                    <span className="font-semibold text-red-600 line-through mr-2">
                      {shippingCost.toLocaleString('tr-TR')} ₺
                    </span>
                    <span className="font-semibold text-primary-600">Ücretsiz</span>
                    {hasMembership && (
                      <span className="text-xs text-primary-600 block">(Avantajlı Üyelik)</span>
                    )}
                  </div>
                )}
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-green-600 font-bold bg-green-50 p-2 rounded border border-green-100">
                  <div>
                    <span>İndirim ({appliedCoupon.coupon_code})</span>
                    {appliedCoupon.is_followers_only && (
                      <span className="text-xs text-pink-600 ml-1">💕 Takipçi</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span>-{discountAmount.toLocaleString('tr-TR')} ₺</span>
                    <button onClick={handleRemoveCoupon} className="text-red-500 hover:text-red-700">
                      <FiTrash2 className="text-sm" />
                    </button>
                  </div>
                </div>
              )}
              <div className="border-t pt-4 flex justify-between text-xl font-bold text-gray-800">
                <span>Toplam</span>
                <span className="text-primary-600">{shippingTotal.toLocaleString('tr-TR')} ₺</span>
              </div>
            </div>

            {/* Avantajlı Üyelik Durumu / Önerisi */}
            {isPremium ? (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiStar className="text-green-600 text-xl" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-green-800 mb-0.5">
                      Premium Üyeliğiniz Aktif!
                    </p>
                    <p className="text-[11px] text-green-700 leading-relaxed">
                      Ayrıcalıklı dünyadasınız. Tüm siparişlerinizde <strong>kargo bedava</strong> avantajının keyfini çıkarın.
                    </p>
                  </div>
                </div>
              </div>
            ) : (needsShipping && !hasMembership) && (
              <div className="mb-6 bg-primary-50 border border-primary-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiStar className="text-primary-600 text-xl" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-primary-800 mb-0.5">
                      Avantajlı Üyelik ile Ücretsiz Kargo!
                    </p>
                    <p className="text-[11px] text-primary-700 leading-relaxed mb-3">
                      Tüm siparişlerde <strong>ücretsiz kargo</strong> ve özel indirimlerden yararlanmak için hemen katılın.
                    </p>
                    <button
                      onClick={handleAddMembershipToCart}
                      disabled={addingMembership}
                      className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-primary-700 transition shadow-sm active:scale-95 disabled:opacity-50"
                    >
                      {addingMembership ? 'Ekleniyor...' : 'Hemen Premium Ol'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <Link
              href="/checkout"
              className="block w-full bg-primary-600 text-white text-center py-4 rounded-lg font-semibold text-lg hover:bg-primary-700 transition mb-4"
            >
              Sepeti Onayla
            </Link>

            <Link
              href="/products"
              className="block w-full text-center text-primary-600 font-semibold hover:text-primary-700 transition flex items-center justify-center gap-2"
            >
              <FiArrowLeft />
              <span>Alışverişe Devam Et</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

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
  quantity: number
  image_url?: string
  stock_quantity: number
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
  const [recommendedProducts, setRecommendedProducts] = useState<RecommendedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [addingMembership, setAddingMembership] = useState(false)
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

    if (newQuantity > item.stock_quantity) {
      alert(`Maksimum ${item.stock_quantity} adet ekleyebilirsiniz`)
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

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingThreshold = 399.99
  const shippingCost = 49.90
  const hasMembership = items.some(item => item.product_id === 999 || item.product_id === 1000)
  const needsShipping = !hasMembership && total < shippingThreshold
  const shippingTotal = needsShipping ? total + shippingCost : total
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
                        
                        {/* Üyelik Plan Seçimi */}
                        {isMembership && (
                          <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-2">Plan Seçimi:</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleChangeMembershipPlan(item.cart_id, item.product_id, 'monthly')}
                                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition ${
                                  currentPlan === 'monthly'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                Aylık (49 ₺)
                              </button>
                              <button
                                onClick={() => handleChangeMembershipPlan(item.cart_id, item.product_id, 'yearly')}
                                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition ${
                                  currentPlan === 'yearly'
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
                            <p className="text-lg font-semibold text-gray-800">
                              {(item.price * item.quantity).toLocaleString('tr-TR')} ₺
                            </p>
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

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-700">
                <span>Toplam Ürün</span>
                <span className="font-semibold">{totalItems}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Toplam Tutar</span>
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
              <div className="border-t pt-4 flex justify-between text-xl font-bold text-gray-800">
                <span>Toplam</span>
                <span className="text-primary-600">{shippingTotal.toLocaleString('tr-TR')} ₺</span>
              </div>
            </div>

            {/* Avantajlı Üyelik Önerisi */}
            {needsShipping && !hasMembership && (
              <div className="mb-6 bg-primary-50 border border-primary-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FiStar className="text-primary-600 text-xl flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-primary-800 mb-1">
                      Avantajlı Üyelik ile Ücretsiz Kargo!
                    </p>
                    <p className="text-xs text-primary-700 mb-3">
                      Tüm siparişlerde ücretsiz kargo ve özel indirimlerden yararlanın.
                    </p>
                    <button
                      onClick={handleAddMembershipToCart}
                      disabled={addingMembership}
                      className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addingMembership ? 'Ekleniyor...' : 'Avantajlı Üyelik Al'}
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

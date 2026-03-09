'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiShoppingCart, FiPackage, FiHeart, FiTag } from 'react-icons/fi'

interface Product {
  product_id: number
  product_name: string
  description: string
  price: number
  original_price?: number
  final_price?: number
  campaign_discount?: number
  campaign?: {
    campaign_id: number
    campaign_name: string
    discount_type: string
    discount_value: number
  }
  stock_quantity: number
  sku: string
  image_url?: string
  category_name: string
  sizes?: string
  size_stocks?: { [key: string]: number }
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter()
  const [adding, setAdding] = useState(false)
  const [message, setMessage] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriting, setFavoriting] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [showSizeModal, setShowSizeModal] = useState(false)

  useEffect(() => {
    checkFavorite()
  }, [product.product_id])

  const checkFavorite = async () => {
    try {
      const response = await fetch('/api/favorites', {
        credentials: 'include', // Cookie'lerin gönderilmesi için
      })
      if (response.ok) {
        const data = await response.json()
        const favorite = data.favorites?.find((f: any) => f.product_id === product.product_id)
        setIsFavorite(!!favorite)
      }
    } catch (error) {
      // Giriş yapılmamış olabilir, sessizce devam et
    }
  }

  const handleAddToCart = async () => {
    if (product.sizes && !selectedSize) {
      setShowSizeModal(true)
      return
    }

    setAdding(true)
    setMessage('')

    try {
      // Önce session'ı initialize et (eğer yoksa)
      await fetch('/api/guest/init', {
        method: 'POST',
        credentials: 'include',
      })

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Cookie'lerin gönderilmesi için
        body: JSON.stringify({
          productId: product.product_id,
          quantity: 1,
          selectedSize: selectedSize
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || 'Sepete eklenemedi')
        return
      }

      setMessage('Sepete eklendi!')
      setShowSizeModal(false)
      setSelectedSize(null)
      // Trigger cart update event for Header
      window.dispatchEvent(new CustomEvent('cartUpdated'))
      setTimeout(() => setMessage(''), 2000)
    } catch (error) {
      setMessage('Bir hata oluştu')
    } finally {
      setAdding(false)
    }
  }

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Login kontrolü
    try {
      const authResponse = await fetch('/api/auth/me')
      if (!authResponse.ok) {
        // Giriş yapılmamış, login sayfasına yönlendir
        router.push('/login?redirect=favorites')
        return
      }
    } catch (error) {
      // Giriş yapılmamış, login sayfasına yönlendir
      router.push('/login?redirect=favorites')
      return
    }

    setFavoriting(true)

    try {
      if (isFavorite) {
        // Favoriden çıkar
        const response = await fetch(`/api/favorites?productId=${product.product_id}`, {
          method: 'DELETE',
          credentials: 'include', // Cookie'lerin gönderilmesi için
        })

        if (response.ok) {
          setIsFavorite(false)
        } else {
          const error = await response.json()
          alert(error.error || 'Favoriden çıkarılamadı')
        }
      } else {
        // Favoriye ekle
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Cookie'lerin gönderilmesi için
          body: JSON.stringify({ productId: product.product_id }),
        })

        if (response.ok) {
          setIsFavorite(true)
        } else {
          const error = await response.json()
          alert(error.error || 'Favoriye eklenemedi')
        }
      }
    } catch (error) {
      console.error('Favori işlemi hatası:', error)
      alert('Bir hata oluştu')
    } finally {
      setFavoriting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden h-full flex flex-col relative">
      {/* Favori Butonu */}
      <button
        onClick={handleToggleFavorite}
        disabled={favoriting}
        className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow-md hover:bg-red-50 transition disabled:opacity-50"
        title={isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
      >
        <FiHeart className={`text-xl ${isFavorite ? 'text-red-600 fill-red-600' : 'text-gray-400'}`} />
      </button>

      <Link href={`/products/${product.product_id}`} className="flex-shrink-0">
        <div className="aspect-square bg-gray-100 flex items-center justify-center border border-gray-200">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.product_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center">
              <div className="text-6xl mb-2 text-gray-400 font-light">✕</div>
              <p className="text-xs text-gray-500 font-medium">Ürün</p>
            </div>
          )}
        </div>
      </Link>
      <div className="p-3 flex flex-col flex-grow">
        <Link href={`/products/${product.product_id}`} className="flex-grow">
          <h3 className="text-sm font-normal text-gray-700 mb-2 line-clamp-2 min-h-[2.5rem]">
            {product.product_name}
          </h3>
        </Link>
        <div className="mt-auto">
          {product.campaign && product.campaign_discount && product.campaign_discount > 0 ? (
            <div className="mb-2">
              <div className="flex items-center gap-2">
                <p className="text-base font-bold text-green-600">
                  {(product.final_price || product.price).toLocaleString('tr-TR')} ₺
                </p>
                <p className="text-sm text-gray-400 line-through">
                  {(product.original_price || product.price).toLocaleString('tr-TR')} ₺
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">
                <FiTag className="w-3 h-3" />
                {product.campaign.discount_type === 'percentage'
                  ? `%${product.campaign.discount_value}`
                  : `${product.campaign.discount_value}₺`}
              </span>
            </div>
          ) : (
            <p className="text-base font-semibold text-gray-800 mb-2">
              {product.price.toLocaleString('tr-TR')} ₺
            </p>
          )}

          <div className="relative">
            {showSizeModal && product.sizes && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border-2 border-primary-600 rounded-lg shadow-xl p-3 z-50 animate-in slide-in-from-bottom-2 fade-in">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-black text-gray-800 uppercase">Beden Seç</h4>
                  <button
                    onClick={() => setShowSizeModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-xs"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
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
                        const stock = product.size_stocks ? (product.size_stocks as any)[size] : 1;
                        const isOutOfStock = stock <= 0;

                        return (
                          <button
                            key={size}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (!isOutOfStock) {
                                setSelectedSize(size);
                                handleAddToCart();
                              }
                            }}
                            disabled={isOutOfStock}
                            className={`min-w-[32px] h-8 px-2 rounded-lg text-[11px] font-black transition-all border flex items-center justify-center ${isOutOfStock
                              ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed opacity-60'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-primary-600 hover:bg-primary-50 hover:text-primary-600'
                              }`}
                          >
                            <span className={isOutOfStock ? 'line-through decoration-red-400' : ''}>
                              {size}
                            </span>
                          </button>
                        );
                      });
                  })()}
                </div>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock_quantity === 0}
              className="w-full bg-primary-600 text-white py-2 rounded text-sm hover:bg-primary-700 transition flex items-center justify-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiShoppingCart className="text-sm" />
              <span className="text-xs">Sepete Ekle</span>
            </button>
          </div>
          {message && (
            <p className={`text-xs mt-1 text-center ${message.includes('eklendi') ? 'text-green-600' : 'text-red-600'
              }`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

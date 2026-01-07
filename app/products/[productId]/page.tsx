'use client'

import { useEffect, useState } from 'react'
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

  useEffect(() => {
    if (params.productId) {
      fetchProduct()
    }
  }, [params.productId])

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

    setAddingToCart(true)
    setMessage('')

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.product_id,
          quantity: quantity,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        setMessage(data.error || 'Sepete eklenemedi')
        return
      }

      setMessage('Sepete eklendi!')
      setTimeout(() => setMessage(''), 3000)
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
              <p className="text-4xl font-bold text-gray-800">
                {product.price.toLocaleString('tr-TR')} ₺
              </p>
              {product.stock_quantity === 0 && (
                <p className="text-red-600 font-semibold mt-2">Stokta Yok</p>
              )}
            </div>

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
                disabled={addingToCart || product.stock_quantity === 0}
                className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FiShoppingCart />
                <span>Sepete Ekle</span>
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

            {message && (
              <div
                className={`p-3 rounded-lg ${
                  message.includes('eklendi')
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {message}
              </div>
            )}

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
            {/* Kampanyalar */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Kampanyalar</h2>
              <div className="flex items-center gap-3 text-gray-700">
                <FiTruck className="text-2xl text-primary-600" />
                <div>
                  <p className="font-semibold">399.99 TL Üstü Ücretsiz Kargo</p>
                  <p className="text-sm text-gray-500">
                    {product.price >= 399.99
                      ? 'Bu ürün için ücretsiz kargo!'
                      : `${(399.99 - product.price).toFixed(2)} TL daha alışveriş yapın, ücretsiz kargo kazanın!`}
                  </p>
                </div>
              </div>
            </div>

            {/* Satıcı */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Satıcı</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800">sKorry Ticaret</span>
                  <FiCheckCircle className="text-blue-600" title="Doğrulanmış Satıcı" />
                </div>
                <div className="text-sm text-gray-600">
                  <p className="font-medium">45.654 Başarılı Satış</p>
                </div>
                <button className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition">
                  Mağazaya Git
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

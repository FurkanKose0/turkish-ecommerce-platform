'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiShoppingCart, FiPackage, FiHeart } from 'react-icons/fi'

interface Product {
  product_id: number
  product_name: string
  description: string
  price: number
  stock_quantity: number
  sku: string
  image_url?: string
  category_name: string
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
        body: JSON.stringify({ productId: product.product_id, quantity: 1 }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || 'Sepete eklenemedi')
        return
      }

      setMessage('Sepete eklendi!')
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
          <p className="text-base font-semibold text-gray-800 mb-2">
            {product.price.toLocaleString('tr-TR')} ₺
          </p>
          <button
            onClick={handleAddToCart}
            disabled={adding || product.stock_quantity === 0}
            className="w-full bg-primary-600 text-white py-2 rounded text-sm hover:bg-primary-700 transition flex items-center justify-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiShoppingCart className="text-sm" />
            <span className="text-xs">Sepete Ekle</span>
          </button>
          {message && (
            <p className={`text-xs mt-1 text-center ${
              message.includes('eklendi') ? 'text-green-600' : 'text-red-600'
            }`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiHeart, FiShoppingCart, FiTrash2, FiShoppingBag } from 'react-icons/fi'
import ProductCard from '@/components/ProductCard'

interface Favorite {
  favorite_id: number
  product_id: number
  product_name: string
  price: number
  image_url?: string
  stock_quantity: number
  sku: string
  category_name: string
  created_at: string
}

export default function FavoritesPage() {
  const router = useRouter()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<number | null>(null)

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/favorites')
      if (response.ok) {
        const data = await response.json()
        setFavorites(data.favorites || [])
      }
    } catch (error) {
      console.error('Favoriler yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async (favoriteId: number, productId: number) => {
    setRemoving(favoriteId)
    try {
      const response = await fetch(`/api/favorites?favoriteId=${favoriteId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setFavorites(favorites.filter((f) => f.favorite_id !== favoriteId))
      } else {
        const error = await response.json()
        alert(error.error || 'Favoriden çıkarılamadı')
      }
    } catch (error) {
      console.error('Favoriden çıkarma hatası:', error)
      alert('Bir hata oluştu')
    } finally {
      setRemoving(null)
    }
  }

  const handleAddToCart = async (productId: number) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      })

      if (response.ok) {
        alert('Sepete eklendi!')
      } else {
        const error = await response.json()
        alert(error.error || 'Sepete eklenemedi')
      }
    } catch (error) {
      console.error('Sepete ekleme hatası:', error)
      alert('Bir hata oluştu')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <p className="text-center text-gray-600">Yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <FiHeart className="text-primary-600" />
          Favorilerim
        </h1>
        {favorites.length > 0 && (
          <p className="text-gray-600">
            {favorites.length} ürün
          </p>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="max-w-2xl mx-auto text-center py-16">
          <FiHeart className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Favorileriniz Boş</h2>
          <p className="text-gray-600 mb-8">
            Beğendiğiniz ürünleri favorilerinize ekleyerek daha sonra kolayca bulabilirsiniz.
          </p>
          <Link
            href="/products"
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
          >
            Alışverişe Başla
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((favorite) => (
            <div
              key={favorite.favorite_id}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden h-full flex flex-col relative"
            >
              {/* Favoriden Çıkar Butonu */}
              <button
                onClick={() => handleRemoveFavorite(favorite.favorite_id, favorite.product_id)}
                disabled={removing === favorite.favorite_id}
                className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow-md hover:bg-red-50 transition disabled:opacity-50"
                title="Favorilerden Çıkar"
              >
                <FiHeart className={`text-xl ${removing === favorite.favorite_id ? 'text-gray-400' : 'text-red-600 fill-red-600'}`} />
              </button>

              {/* Ürün Görseli */}
              <Link href={`/products/${favorite.product_id}`} className="flex-shrink-0">
                <div className="aspect-square bg-gray-100 flex items-center justify-center border border-gray-200">
                  {favorite.image_url ? (
                    <img
                      src={favorite.image_url}
                      alt={favorite.product_name}
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

              {/* Ürün Bilgileri */}
              <div className="p-4 flex flex-col flex-grow">
                <Link href={`/products/${favorite.product_id}`} className="flex-grow">
                  <h3 className="text-sm font-normal text-gray-700 mb-2 line-clamp-2 min-h-[2.5rem] hover:text-primary-600 transition">
                    {favorite.product_name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">{favorite.category_name}</p>
                </Link>

                <div className="mt-auto">
                  <p className="text-base font-semibold text-gray-800 mb-3">
                    {favorite.price.toLocaleString('tr-TR')} ₺
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(favorite.product_id)}
                      disabled={favorite.stock_quantity === 0}
                      className="flex-1 bg-primary-600 text-white py-2 rounded text-sm hover:bg-primary-700 transition flex items-center justify-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiShoppingCart className="text-sm" />
                      <span className="text-xs">Sepete Ekle</span>
                    </button>
                  </div>

                  {favorite.stock_quantity === 0 && (
                    <p className="text-xs text-red-600 mt-2 text-center">Stokta Yok</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

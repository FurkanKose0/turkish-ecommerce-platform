'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiClock, FiPercent, FiShoppingCart } from 'react-icons/fi'
import ProductCard from '@/components/ProductCard'

interface Product {
  product_id: number
  product_name: string
  description: string
  price: number
  discount_percentage?: number
  image_url?: string
  stock_quantity: number
  sku: string
  category_name: string
}

export default function DealsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 })

  useEffect(() => {
    fetchDeals()
    
    // Geri sayım
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        } else {
          return { hours: 23, minutes: 59, seconds: 59 }
        }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const fetchDeals = async () => {
    try {
      const response = await fetch('/api/products?deals=true')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Fırsatlar yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Başlık ve Geri Sayım */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Günün Fırsatı</h1>
              <p className="text-primary-100">Özel indirimli ürünleri kaçırma!</p>
            </div>
            <div className="flex items-center gap-4">
              <FiClock className="text-2xl" />
              <div className="text-center">
                <p className="text-sm text-primary-100 mb-1">Kalan Süre</p>
                <div className="flex gap-2 text-2xl font-bold">
                  <span>{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span>:</span>
                  <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span>:</span>
                  <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ürünler */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Yükleniyor...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <FiPercent className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Şu an fırsat ürünü yok</h2>
            <p className="text-gray-500 mb-6">Yakında harika fırsatlar gelecek!</p>
            <Link
              href="/"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
            >
              Ana Sayfaya Dön
            </Link>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((product) => (
                <ProductCard key={product.product_id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

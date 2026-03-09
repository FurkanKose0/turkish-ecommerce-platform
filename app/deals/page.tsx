'use client'

import { useEffect, useState } from 'react'
import ProductCard from '@/components/ProductCard'
import { FiClock, FiTag, FiShoppingBag } from 'react-icons/fi'

interface Product {
  product_id: number
  product_name: string
  description: string
  price: number
  original_price: number
  final_price: number
  campaign_discount: number
  campaign?: {
    campaign_id: number
    campaign_name: string
    discount_type: string
    discount_value: number
    is_deal?: boolean
    end_date?: string
  }
  stock_quantity: number
  sku: string
  image_url?: string
  deal_end_date?: string
  category_name: string
}

export default function DealsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDeals()
  }, [])

  const fetchDeals = async () => {
    try {
      // Sadece fırsat ürünlerini getiren API çağrısı
      const response = await fetch('/api/products?showDeals=true')
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Fırsatlar yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  // Geri sayım hesaplama fonksiyonu
  const calculateTimeLeft = (endDate: string) => {
    const difference = +new Date(endDate) - +new Date()
    if (difference > 0) {
      return {
        hours: Math.floor((difference / (1000 * 60 * 60))),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      }
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/20 rounded-full blur-3xl animate-pulse"></div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full mb-4 animate-bounce">
            <FiClock />
            <span className="font-bold">Sınırlı Süre</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 drop-shadow-lg">Günün Fırsatları</h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto font-light">
            Sadece bugüne özel, seçili ürünlerde kaçırılmayacak indirimleri keşfedin.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Fırsatlar yükleniyor...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiShoppingBag className="text-4xl text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Şu an aktif fırsat yok</h2>
            <p className="text-gray-600 mb-6">
              Yeni fırsatlar için lütfen daha sonra tekrar kontrol edin veya bildirimleri açın.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.product_id} className="relative group">
                {/* Süre Sayacı Badge */}
                {product.campaign?.end_date && (
                  <div className="absolute top-2 left-2 right-2 z-10 bg-orange-600 text-white text-xs font-bold py-1 px-2 rounded flex items-center justify-center gap-1 shadow-lg transform -translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition duration-300">
                    <FiClock />
                    <span>Bitmesine az kaldı!</span>
                  </div>
                )}

                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

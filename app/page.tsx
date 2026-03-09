'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import {
  FiArrowRight,
  FiShoppingBag,
  FiTruck,
  FiShield,
  FiCreditCard,
  FiPercent,
  FiStar,
  FiChevronLeft,
  FiChevronRight,
  FiTag,
  FiGift,
  FiZap
} from 'react-icons/fi'
import ProductCard from '@/components/ProductCard'

interface Product {
  product_id: number
  product_name: string
  description: string
  price: number
  original_price?: number
  final_price?: number
  campaign_discount?: number
  campaign?: any
  stock_quantity: number
  sku: string
  image_url?: string
  category_name: string
}

interface Category {
  category_id: number
  category_name: string
  parent_category_id: number | null
  image_url?: string | null
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const productsScrollRef = useRef<HTMLDivElement>(null)
  const categoriesScrollRef = useRef<HTMLDivElement>(null)

  // Hero slider otomatik geçiş
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Ürünler yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Kategoriler yüklenemedi:', error)
    }
  }

  const scrollProducts = (direction: 'left' | 'right') => {
    if (productsScrollRef.current) {
      const scrollAmount = 300
      productsScrollRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  // Kampanyalı ürünleri bul
  const campaignProducts = products.filter(p => p.campaign && p.campaign_discount && p.campaign_discount > 0)

  // Hero slider içerikleri
  const heroSlides = [
    {
      title: "Kış İndirimleri Başladı!",
      subtitle: "Seçili ürünlerde %50'ye varan indirimler",
      gradient: "from-violet-600 via-purple-600 to-indigo-700",
      icon: <FiPercent className="w-16 h-16" />,
      cta: "Fırsatları Keşfet",
      link: "/deals"
    },
    {
      title: "Yeni Sezon Ürünleri",
      subtitle: "2025 koleksiyonu şimdi mağazamızda",
      gradient: "from-emerald-500 via-teal-500 to-cyan-600",
      icon: <FiStar className="w-16 h-16" />,
      cta: "Alışverişe Başla",
      link: "/products"
    },
    {
      title: "Premium Üyelik",
      subtitle: "Ücretsiz kargo ve özel fırsatlar için katıl",
      gradient: "from-amber-500 via-orange-500 to-red-500",
      icon: <FiGift className="w-16 h-16" />,
      cta: "Hemen Katıl",
      link: "/membership"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section - Animated Slider */}
      <section className="relative overflow-hidden">
        <div className="relative h-[400px] md:h-[500px]">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${currentSlide === index
                  ? 'opacity-100 translate-x-0'
                  : currentSlide > index
                    ? 'opacity-0 -translate-x-full'
                    : 'opacity-0 translate-x-full'
                }`}
            >
              <div className={`h-full bg-gradient-to-r ${slide.gradient} relative overflow-hidden`}>
                {/* Animated background shapes */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
                  <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-500" />
                </div>

                <div className="container mx-auto px-4 h-full flex items-center relative z-10">
                  <div className="max-w-2xl text-white">
                    <div className="mb-6 p-4 bg-white/10 backdrop-blur-sm rounded-2xl w-fit animate-bounce">
                      {slide.icon}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight drop-shadow-lg">
                      {slide.title}
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 opacity-90 font-light">
                      {slide.subtitle}
                    </p>
                    <Link
                      href={slide.link}
                      className="inline-flex items-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-white/25"
                    >
                      {slide.cta}
                      <FiArrowRight className="animate-pulse" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Slider Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-300 rounded-full ${currentSlide === index
                  ? 'w-8 h-3 bg-white'
                  : 'w-3 h-3 bg-white/50 hover:bg-white/75'
                }`}
            />
          ))}
        </div>

        {/* Slider Arrows */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + 3) % 3)}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition z-20"
        >
          <FiChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % 3)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition z-20"
        >
          <FiChevronRight className="w-6 h-6" />
        </button>
      </section>

      {/* Avantajlar Bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <FiTruck className="w-6 h-6" />, title: "Ücretsiz Kargo", desc: "399₺ üzeri siparişlerde" },
              { icon: <FiShield className="w-6 h-6" />, title: "Güvenli Ödeme", desc: "256-bit SSL şifreleme" },
              { icon: <FiCreditCard className="w-6 h-6" />, title: "Taksit İmkanı", desc: "9 aya varan taksit" },
              { icon: <FiZap className="w-6 h-6" />, title: "Hızlı Teslimat", desc: "Aynı gün kargo" }
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition group">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 group-hover:bg-primary-100 transition">
                  {item.icon}
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kampanyalı Ürünler - Özel Bölüm */}
      {campaignProducts.length > 0 && (
        <section className="py-12 bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/30 animate-pulse">
                  <FiTag className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-gray-800">
                    🔥 Kampanyalı Ürünler
                  </h2>
                  <p className="text-gray-600">Kaçırmayın, stoklar sınırlı!</p>
                </div>
              </div>
              <Link
                href="/deals"
                className="hidden md:flex items-center gap-2 bg-white px-6 py-3 rounded-full font-bold text-orange-600 hover:bg-orange-100 transition shadow-md"
              >
                Tüm Kampanyalar
                <FiArrowRight />
              </Link>
            </div>

            <div className="relative">
              <button
                onClick={() => scrollProducts('left')}
                className="absolute -left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center z-10 hover:bg-gray-50 transition"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>

              <div
                ref={productsScrollRef}
                className="overflow-x-auto scrollbar-hide scroll-smooth px-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <div className="flex gap-5 pb-4" style={{ width: 'max-content' }}>
                  {campaignProducts.slice(0, 10).map((product) => (
                    <div key={product.product_id} className="flex-shrink-0 w-[220px]">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => scrollProducts('right')}
                className="absolute -right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center z-10 hover:bg-gray-50 transition"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Kategoriler - Modern Grid */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-gray-800 mb-3">
              Kategorileri Keşfet
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Aradığınız her şey tek bir tıkla erişiminizde
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 12).map((category, index) => (
              <Link
                key={category.category_id}
                href={`/products?categoryId=${category.category_id}`}
                className="group relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-square flex items-center justify-center p-6 relative">
                  {/* Background glow on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-primary-600/0 group-hover:from-primary-500/10 group-hover:to-primary-600/20 transition-all duration-300" />

                  {category.image_url ? (
                    <img
                      src={category.image_url}
                      alt={category.category_name}
                      className="w-full h-full object-contain transform group-hover:scale-110 transition duration-500"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center group-hover:bg-primary-100 transition">
                      <FiShoppingBag className="w-8 h-8 text-gray-400 group-hover:text-primary-600 transition" />
                    </div>
                  )}
                </div>
                <div className="p-3 text-center bg-white/80 backdrop-blur-sm">
                  <h3 className="font-bold text-gray-700 text-sm group-hover:text-primary-600 transition line-clamp-1">
                    {category.category_name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popüler Ürünler */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-gray-800">
                Popüler Ürünler
              </h2>
              <p className="text-gray-600">En çok tercih edilenler</p>
            </div>
            <Link
              href="/products"
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-bold transition"
            >
              Tümünü Gör
              <FiArrowRight />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-t-xl" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl">
              <FiShoppingBag className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Henüz ürün bulunmuyor</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.slice(0, 10).map((product) => (
                <ProductCard key={product.product_id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <FiStar className="w-5 h-5" />
              <span className="font-bold">Premium Üyelik</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              Avantajlı Dünyaya Katıl!
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Tüm siparişlerinde ücretsiz kargo, özel indirimler ve çok daha fazlası seni bekliyor.
            </p>
            <Link
              href="/membership"
              className="inline-flex items-center gap-3 bg-white text-primary-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition shadow-2xl"
            >
              <FiGift className="w-5 h-5" />
              Hemen Üye Ol
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

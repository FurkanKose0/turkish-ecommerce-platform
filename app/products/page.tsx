'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import {
  FiSearch,
  FiFilter,
  FiGrid,
  FiList,
  FiX,
  FiChevronDown,
  FiTag,
  FiPercent,
  FiStar,
  FiSliders,
  FiPackage
} from 'react-icons/fi'

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
}

function ProductsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialSearch = searchParams.get('search') || ''
  const initialCategory = searchParams.get('categoryId') || ''

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(initialSearch)
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory)
  const [sortBy, setSortBy] = useState<string>('default')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' })
  const [showOnlyCampaign, setShowOnlyCampaign] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    const searchParam = searchParams.get('search') || ''
    const categoryParam = searchParams.get('categoryId') || ''

    if (searchParam !== search) setSearch(searchParam)
    if (categoryParam !== selectedCategory) setSelectedCategory(categoryParam)

    fetchProducts(searchParam, categoryParam)
  }, [searchParams])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Kategoriler yüklenemedi:', error)
    }
  }

  const fetchProducts = async (searchParam?: string, categoryParam?: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()

      const categoryIdToUse = categoryParam !== undefined ? categoryParam : selectedCategory
      const searchToUse = searchParam !== undefined ? searchParam : search

      if (categoryIdToUse) params.append('categoryId', categoryIdToUse)
      if (searchToUse) params.append('search', searchToUse)

      const response = await fetch(`/api/products?${params.toString()}`)
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Ürünler yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtreleme ve sıralama
  const filteredProducts = products
    .filter(p => {
      // Fiyat filtresi
      const price = p.final_price || p.price
      if (priceRange.min && price < parseFloat(priceRange.min)) return false
      if (priceRange.max && price > parseFloat(priceRange.max)) return false
      // Kampanya filtresi
      if (showOnlyCampaign && (!p.campaign || !p.campaign_discount || p.campaign_discount <= 0)) return false
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return (a.final_price || a.price) - (b.final_price || b.price)
        case 'price-desc':
          return (b.final_price || b.price) - (a.final_price || a.price)
        case 'name-asc':
          return a.product_name.localeCompare(b.product_name)
        case 'name-desc':
          return b.product_name.localeCompare(a.product_name)
        default:
          return 0
      }
    })

  const clearFilters = () => {
    setSearch('')
    setSelectedCategory('')
    setPriceRange({ min: '', max: '' })
    setShowOnlyCampaign(false)
    setSortBy('default')
    router.push('/products')
  }

  const activeFiltersCount = [
    search,
    selectedCategory,
    priceRange.min,
    priceRange.max,
    showOnlyCampaign
  ].filter(Boolean).length

  const campaignCount = products.filter(p => p.campaign && p.campaign_discount && p.campaign_discount > 0).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white py-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              {selectedCategory
                ? categories.find(c => c.category_id.toString() === selectedCategory)?.category_name || 'Ürünler'
                : search
                  ? `"${search}" için sonuçlar`
                  : 'Tüm Ürünler'
              }
            </h1>
            <p className="text-lg opacity-90">
              {filteredProducts.length} ürün listeleniyor
              {campaignCount > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-sm">
                  <FiPercent className="w-4 h-4" />
                  {campaignCount} kampanyalı ürün
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sol Sidebar - Filtreler */}
          <aside className={`lg:w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <FiSliders className="text-primary-600" />
                  Filtreler
                </h2>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                  >
                    <FiX className="w-4 h-4" />
                    Temizle
                  </button>
                )}
              </div>

              {/* Arama */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Arama</label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Ürün ara..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        fetchProducts(search, selectedCategory)
                      }
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                  />
                </div>
              </div>

              {/* Kategori */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Kategori</label>
                <div className="relative">
                  <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      const newValue = e.target.value
                      setSelectedCategory(newValue)
                      fetchProducts(search, newValue)
                    }}
                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition appearance-none bg-white"
                  >
                    <option value="">Tüm Kategoriler</option>
                    {categories.map((cat) => (
                      <option key={cat.category_id} value={cat.category_id.toString()}>
                        {cat.category_name}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Fiyat Aralığı */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Fiyat Aralığı</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    className="w-1/2 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                  <span className="flex items-center text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    className="w-1/2 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Kampanyalı Ürünler */}
              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={showOnlyCampaign}
                    onChange={(e) => setShowOnlyCampaign(e.target.checked)}
                    className="w-5 h-5 rounded-lg border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="flex items-center gap-2 text-sm font-medium text-gray-700 group-hover:text-primary-600 transition">
                    <FiTag className="text-orange-500" />
                    Sadece Kampanyalı Ürünler
                  </span>
                </label>
              </div>

              {/* Aktif filtre sayısı */}
              {activeFiltersCount > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    {activeFiltersCount} filtre uygulandı
                  </p>
                </div>
              )}
            </div>
          </aside>

          {/* Ana İçerik */}
          <main className="flex-1">
            {/* Üst Bar - Sıralama ve Görünüm */}
            <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Mobil Filtre Butonu */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl font-medium text-gray-700 hover:bg-gray-200 transition"
                >
                  <FiSliders />
                  Filtreler
                  {activeFiltersCount > 0 && (
                    <span className="w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {/* Görünüm */}
                <div className="hidden sm:flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <FiGrid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <FiList className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Sıralama */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 hidden sm:inline">Sırala:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 bg-gray-100 border-0 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="default">Varsayılan</option>
                  <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
                  <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
                  <option value="name-asc">İsim: A-Z</option>
                  <option value="name-desc">İsim: Z-A</option>
                </select>
              </div>
            </div>

            {/* Ürün Listesi */}
            {loading ? (
              <div className={viewMode === 'grid'
                ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
                : "space-y-4"
              }>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl animate-pulse overflow-hidden">
                    <div className="aspect-square bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl">
                <FiPackage className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">Ürün Bulunamadı</h3>
                <p className="text-gray-500 mb-6">Arama kriterlerinize uygun ürün bulunamadı.</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition"
                >
                  Filtreleri Temizle
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid'
                ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
                : "space-y-4"
              }>
                {filteredProducts.map((product) => (
                  <ProductCard key={product.product_id} product={product} />
                ))}
              </div>
            )}

            {/* Alt Bilgi */}
            {!loading && filteredProducts.length > 0 && (
              <div className="mt-8 text-center text-gray-500 text-sm">
                {filteredProducts.length} ürün gösteriliyor
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  )
}

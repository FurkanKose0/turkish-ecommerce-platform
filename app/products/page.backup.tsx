'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import { FiSearch, FiFilter } from 'react-icons/fi'

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

interface Category {
  category_id: number
  category_name: string
  parent_category_id: number | null
}

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get('search') || ''
  const initialCategory = searchParams.get('categoryId') || ''

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(initialSearch)
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    // URL parametreleri değiştiğinde state'i güncelle
    const searchParam = searchParams.get('search') || ''
    const categoryParam = searchParams.get('categoryId') || ''

    if (searchParam !== search) setSearch(searchParam)
    if (categoryParam !== selectedCategory) setSelectedCategory(categoryParam)

    // Doğrudan fetchProducts'ı çağır
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Ürünler</h1>

      {/* Filtreler */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Ürün ara..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                // Debounce eklenebilir ama şimdilik manuel tetikleme veya useEffect ile çalışacak
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  fetchProducts(search, selectedCategory)
                }
              }}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiFilter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                const newValue = e.target.value
                setSelectedCategory(newValue)
                fetchProducts(search, newValue)
              }}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map((cat) => (
                <option key={cat.category_id} value={cat.category_id.toString()}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Ürün Listesi */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Ürün bulunamadı</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.product_id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

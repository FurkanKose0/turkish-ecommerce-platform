'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { FiArrowRight, FiShoppingBag } from 'react-icons/fi'
import ProductCard from '@/components/ProductCard'

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
  image_url?: string | null
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const productsScrollRef = useRef<HTMLDivElement>(null)
  const categoriesScrollRef = useRef<HTMLDivElement>(null)

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
      const scrollAmount = 200
      productsScrollRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesScrollRef.current) {
      const scrollAmount = 200
      categoriesScrollRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Popüler Ürünler Bölümü */}
      <section className="py-6 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Popüler Ürünler</h2>
            <Link
              href="/products"
              className="text-primary-600 hover:text-primary-700 font-semibold flex items-center space-x-1 text-sm"
            >
              <span>Tümünü Gör</span>
              <FiArrowRight className="text-sm" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Yükleniyor...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <FiShoppingBag className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Henüz ürün bulunmuyor</p>
            </div>
          ) : (
            <div className="relative">
              <div
                ref={productsScrollRef}
                className="overflow-x-auto scrollbar-hide scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <div className="flex space-x-4 pb-2" style={{ width: 'max-content' }}>
                  {products.slice(0, 8).map((product) => (
                    <div key={product.product_id} className="flex-shrink-0" style={{ width: '180px' }}>
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>
              {/* Sağ ok ikonu - scroll butonu */}
              {products.length > 8 && (
                <button
                  onClick={() => scrollProducts('right')}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition z-10"
                  aria-label="Sağa kaydır"
                >
                  <FiArrowRight className="text-xl text-gray-700" />
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Kategorilerdeki İndirimleri Keşfet Bölümü */}
      <section className="py-6 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Kategorilerdeki İndirimleri Keşfet</h2>
          </div>

          <div className="relative">
            <div
              ref={categoriesScrollRef}
              className="overflow-x-auto scrollbar-hide scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="flex space-x-4 pb-2" style={{ width: 'max-content' }}>
                {categories.slice(0, 8).map((category) => (
                  <Link
                    key={category.category_id}
                    href={`/products?categoryId=${category.category_id}`}
                    className="flex-shrink-0 bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden"
                    style={{ width: '180px' }}
                  >
                    <div className="aspect-square bg-gray-100 flex items-center justify-center border border-gray-200 relative">
                      {category.image_url ? (
                        <div className="w-full h-full p-8 flex items-center justify-center">
                          <img
                            src={category.image_url}
                            alt={category.category_name}
                            className="w-full h-full object-contain transform hover:scale-110 transition duration-300"
                          />
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="text-4xl mb-2 text-gray-300">
                            <FiShoppingBag />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-normal text-gray-700 text-center text-sm line-clamp-2 min-h-[2.5rem]">
                        {category.category_name}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            {/* Sağ ok ikonu - scroll butonu */}
            {categories.length > 8 && (
              <button
                onClick={() => scrollCategories('right')}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition z-10"
                aria-label="Sağa kaydır"
              >
                <FiArrowRight className="text-xl text-gray-700" />
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

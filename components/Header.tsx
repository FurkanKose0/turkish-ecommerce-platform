'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiShoppingCart, FiMenu, FiX, FiUser, FiLogOut, FiHeart, FiMapPin, FiSearch, FiChevronDown, FiGlobe } from 'react-icons/fi'
import { iller, type Il } from '@/lib/turkiye-iller-ilceler'
import { setCookie, getCookie } from '@/lib/cookies'

interface Category {
  category_id: number
  category_name: string
  parent_category_id: number | null
  level: number
}

export default function Header() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [cartCount, setCartCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  
  // Adres state'leri
  const [ilInput, setIlInput] = useState('')
  const [selectedIlId, setSelectedIlId] = useState<number | null>(null)
  const [ilSuggestions, setIlSuggestions] = useState<Il[]>([])
  const [showIlSuggestions, setShowIlSuggestions] = useState(false)
  const ilInputRef = useRef<HTMLInputElement>(null)
  const ilSuggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    checkAuth()
    fetchCartCount()
    loadAddressFromCookies()
    
    // Sayfa odağa geldiğinde auth durumunu kontrol et (login sonrası için)
    const handleFocus = () => {
      checkAuth()
      fetchCartCount()
    }
    
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  useEffect(() => {
    // İl değiştiğinde cookie'ye kaydet
    if (selectedIlId) {
      saveAddressToCookies(selectedIlId)
    }
  }, [selectedIlId])

  // Dışarı tıklama kontrolü
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ilSuggestionsRef.current && !ilSuggestionsRef.current.contains(event.target as Node) && 
          ilInputRef.current && !ilInputRef.current.contains(event.target as Node)) {
        setShowIlSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadAddressFromCookies = () => {
    if (typeof window === 'undefined') return
    
    const savedIl = getCookie('user_il')
    
    if (savedIl) {
      const ilId = parseInt(savedIl)
      const il = iller.find(i => i.id === ilId)
      if (il) {
        setSelectedIlId(ilId)
        setIlInput(il.name)
      }
    }
  }

  const saveAddressToCookies = (ilId: number | null) => {
    if (typeof window === 'undefined') return
    
    if (ilId) {
      setCookie('user_il', ilId.toString())
    } else {
      setCookie('user_il', '')
    }
  }

  const handleIlInputChange = (value: string) => {
    setIlInput(value)
    setSelectedIlId(null)
    
    if (value.length > 0) {
      const filtered = iller.filter(il => 
        il.name.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 10)
      setIlSuggestions(filtered)
      setShowIlSuggestions(true)
    } else {
      setIlSuggestions([])
      setShowIlSuggestions(false)
    }
  }

  const handleIlSelect = (il: Il) => {
    setIlInput(il.name)
    setSelectedIlId(il.id)
    setIlSuggestions([])
    setShowIlSuggestions(false)
  }

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setIsLoggedIn(true)
      }
    } catch (error) {
      setIsLoggedIn(false)
    }
  }

  const fetchCartCount = async () => {
    try {
      const response = await fetch('/api/cart')
      if (response.ok) {
        const data = await response.json()
        setCartCount(data.items?.length || 0)
      }
    } catch (error) {
      // Giriş yapılmamış olabilir
    }
  }

  const fetchCategories = async () => {
    if (categories.length > 0) return // Zaten yüklü
    
    setLoadingCategories(true)
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Kategoriler yüklenemedi:', error)
    } finally {
      setLoadingCategories(false)
    }
  }

  const handleCategoriesClick = () => {
    if (!isCategoriesOpen) {
      fetchCategories()
    }
    setIsCategoriesOpen(!isCategoriesOpen)
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setIsLoggedIn(false)
      setUser(null)
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Çıkış hatası:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  // Kategorileri hiyerarşik olarak organize et
  const organizeCategories = (cats: Category[]) => {
    const parentCategories = cats.filter(cat => cat.parent_category_id === null)
    const childCategories = cats.filter(cat => cat.parent_category_id !== null)
    
    return parentCategories.map(parent => ({
      ...parent,
      children: childCategories.filter(child => child.parent_category_id === parent.category_id)
    }))
  }

  const organizedCategories = organizeCategories(categories)

  return (
    <header className="bg-white">
      {/* Üst Header - Logo, Adres, Arama, Butonlar */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="text-2xl font-bold text-gray-900">sKorry</span>
          </Link>

          {/* Orta Kısım - Adres ve Arama */}
          <div className="hidden md:flex items-center gap-4 flex-1 max-w-3xl">
            {/* Adres Input */}
            <div className="relative flex-shrink-0">
              <div className="relative">
                <FiGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  ref={ilInputRef}
                  type="text"
                  placeholder="İl"
                  value={ilInput}
                  onChange={(e) => handleIlInputChange(e.target.value)}
                  onFocus={() => {
                    if (ilInput.length > 0) {
                      const filtered = iller.filter(il => 
                        il.name.toLowerCase().includes(ilInput.toLowerCase())
                      ).slice(0, 10)
                      setIlSuggestions(filtered)
                      setShowIlSuggestions(true)
                    }
                  }}
                  className="w-40 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>
              {showIlSuggestions && ilSuggestions.length > 0 && (
                <div
                  ref={ilSuggestionsRef}
                  className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 w-48 max-h-[300px] overflow-y-auto"
                >
                  {ilSuggestions.map((il) => (
                    <button
                      key={il.id}
                      type="button"
                      onClick={() => handleIlSelect(il)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                    >
                      {il.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Arama Çubuğu */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="İstediğin ürün kapına gelsin"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </form>
          </div>

          {/* Sağ Butonlar */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Giriş Yap / Kullanıcı */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  <FiUser className="text-lg" />
                  <span className="hidden lg:inline text-sm">Hesabım</span>
                </button>
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                      <Link
                        href="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Profilim
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Siparişlerim
                      </Link>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false)
                          handleLogout()
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <FiLogOut />
                        <span>Çıkış Yap</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                <FiUser className="text-lg" />
                <span className="hidden lg:inline text-sm">Giriş Yap</span>
              </Link>
            )}

            {/* Favoriler */}
            <Link
              href="/favorites"
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              title="Favoriler"
            >
              <FiHeart className="text-lg" />
              <span className="hidden lg:inline text-sm">Favoriler</span>
            </Link>

            {/* Sepetim */}
            <Link
              href="/cart"
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition relative"
              title="Sepetim"
            >
              <FiShoppingCart className="text-lg" />
              <span className="hidden lg:inline text-sm">Sepetim</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobil Menü Butonu */}
            <button
              className="md:hidden p-2 text-gray-700"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
            </button>
          </div>
        </div>

        {/* Mobil Arama ve Adres */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-3">
            {/* Mobil İl Input */}
            <div className="relative">
              <div className="relative">
                <FiGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="İl"
                  value={ilInput}
                  onChange={(e) => handleIlInputChange(e.target.value)}
                  onFocus={() => {
                    if (ilInput.length > 0) {
                      const filtered = iller.filter(il => 
                        il.name.toLowerCase().includes(ilInput.toLowerCase())
                      ).slice(0, 10)
                      setIlSuggestions(filtered)
                      setShowIlSuggestions(true)
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>
              {showIlSuggestions && ilSuggestions.length > 0 && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-40 max-h-[300px] overflow-y-auto">
                  {ilSuggestions.map((il) => (
                    <button
                      key={il.id}
                      type="button"
                      onClick={() => handleIlSelect(il)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                    >
                      {il.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <form onSubmit={handleSearch} className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="İstediğin ürün kapına gelsin"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </form>
          </div>
        )}
      </div>

      {/* Yeşil Çizgi */}
      <div className="border-b-2 border-primary-600"></div>

      {/* Alt Navigasyon Bar - Kategoriler */}
      <div className="bg-white border-b border-gray-200 relative">
        <div className="container mx-auto px-4">
          <nav className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
            {/* Tüm Kategoriler - Dropdown */}
            <div className="relative">
              <button
                onClick={handleCategoriesClick}
                className="flex items-center space-x-2 px-4 py-3 hover:bg-gray-50 transition whitespace-nowrap flex-shrink-0 text-gray-700 hover:text-primary-600"
              >
                <FiMenu />
                <span>Tüm Kategoriler</span>
                <FiChevronDown className={`text-sm transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Kategoriler Dropdown */}
              {isCategoriesOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsCategoriesOpen(false)}
                  />
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[300px] max-h-[600px] overflow-y-auto">
                    {loadingCategories ? (
                      <div className="p-8 text-center text-gray-500">
                        <p>Yükleniyor...</p>
                      </div>
                    ) : organizedCategories.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <p>Kategori bulunamadı</p>
                      </div>
                    ) : (
                      <div className="p-2">
                        {organizedCategories.map((category) => (
                          <div key={category.category_id} className="mb-1">
                            <Link
                              href={`/products?categoryId=${category.category_id}`}
                              onClick={() => setIsCategoriesOpen(false)}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition font-medium"
                            >
                              {category.category_name}
                            </Link>
                            {category.children && category.children.length > 0 && (
                              <div className="ml-4 mt-1 space-y-1">
                                {category.children.map((child) => (
                                  <Link
                                    key={child.category_id}
                                    href={`/products?categoryId=${child.category_id}`}
                                    onClick={() => setIsCategoriesOpen(false)}
                                    className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded transition"
                                  >
                                    {child.category_name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <Link
              href="/deals"
              className="px-4 py-3 hover:bg-gray-50 transition whitespace-nowrap flex-shrink-0 text-gray-700 hover:text-primary-600"
            >
              Günün Fırsatı
            </Link>
            <Link
              href="/membership"
              className="px-4 py-3 hover:bg-gray-50 transition whitespace-nowrap flex-shrink-0 text-gray-700 hover:text-primary-600"
            >
              Avantajlı Üyelik
            </Link>
            <Link
              href="/gift-card"
              className="px-4 py-3 hover:bg-gray-50 transition whitespace-nowrap flex-shrink-0 text-gray-700 hover:text-primary-600"
            >
              Hediye Kartı
            </Link>
            <Link
              href="/sell"
              className="px-4 py-3 hover:bg-gray-50 transition whitespace-nowrap flex-shrink-0 text-gray-700 hover:text-primary-600"
            >
              Satış Yap
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

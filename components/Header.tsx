'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiShoppingCart, FiMenu, FiX, FiUser, FiLogOut, FiHeart, FiMapPin, FiSearch, FiChevronDown, FiGlobe, FiStar } from 'react-icons/fi'
import { iller, type Il } from '@/lib/turkiye-iller-ilceler'
import { setCookie, getCookie } from '@/lib/cookies'

interface Category {
  category_id: number
  category_name: string
  parent_category_id: number | null
  image_url?: string | null
  level?: number
  children?: Category[]
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
  const [isCartPreviewOpen, setIsCartPreviewOpen] = useState(false)
  const [cartItems, setCartItems] = useState<any[]>([])
  const cartPreviewTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Adres state'leri
  const [ilInput, setIlInput] = useState('')
  const [selectedIlId, setSelectedIlId] = useState<number | null>(null)
  const [ilSuggestions, setIlSuggestions] = useState<Il[]>([])
  const [showIlSuggestions, setShowIlSuggestions] = useState(false)
  const ilInputRef = useRef<HTMLInputElement>(null)
  const ilSuggestionsRef = useRef<HTMLDivElement>(null)

  // Arama öneri state'leri
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([])
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchSuggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    checkAuth()
    fetchCartCount()
    loadAddressFromCookies()

    // Sayfa odağa geldiğinde auth durumunu kontrol et (login sonrası için)
    const handleFocus = () => {
      checkAuth()
      fetchCartCount()
      if (isLoggedIn) {
        loadDefaultAddress()
      }
    }

    // Sepet güncellendiğinde yeniden yükle
    const handleCartUpdate = () => {
      fetchCartCount()
    }

    window.addEventListener('focus', handleFocus)
    window.addEventListener('cartUpdated', handleCartUpdate)

    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('cartUpdated', handleCartUpdate)
    }
  }, [isLoggedIn]) // Re-run effect when login status changes

  // Load default address when user logs in
  useEffect(() => {
    if (isLoggedIn) {
      loadDefaultAddress()
    } else {
      loadAddressFromCookies()
    }
  }, [isLoggedIn])


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

      if (searchSuggestionsRef.current && !searchSuggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSearchSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadDefaultAddress = async () => {
    try {
      const response = await fetch('/api/addresses')
      if (response.ok) {
        const data = await response.json()
        const addresses = data.addresses || []
        if (addresses.length > 0) {
          // Find default address or take the first one
          const defaultAddress = addresses.find((a: any) => a.is_default) || addresses[0]
          if (defaultAddress && defaultAddress.city) {
            setIlInput(defaultAddress.city)
            // Also update selectedIlId based on the name if possible, to keep consistency
            const matchedIl = iller.find(i => i.name.toLowerCase() === defaultAddress.city.toLowerCase())
            if (matchedIl) {
              setSelectedIlId(matchedIl.id)
            }
          }
        }
      }
    } catch (error) {
      console.error('Varsayılan adres yüklenemedi', error)
    }
  }

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
        setCartItems(data.items || [])
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
      console.log('Fetching categories...')
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        console.log('Categories fetched:', data.categories)
        setCategories(data.categories || [])
      } else {
        console.error('Categories fetch failed:', response.status)
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
      setCartItems([])
      setCartCount(0)
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Çıkış hatası:', error)
    }
  }

  const handleCartMouseEnter = () => {
    if (cartPreviewTimeoutRef.current) clearTimeout(cartPreviewTimeoutRef.current)
    setIsCartPreviewOpen(true)
  }

  const handleCartMouseLeave = () => {
    cartPreviewTimeoutRef.current = setTimeout(() => {
      setIsCartPreviewOpen(false)
    }, 300)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setShowSearchSuggestions(false)
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const fetchSearchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSearchSuggestions([])
      setShowSearchSuggestions(false)
      return
    }

    try {
      const response = await fetch(`/api/products?search=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchSuggestions(data.products?.slice(0, 5) || []) // En fazla 5 öneri göster
        setShowSearchSuggestions(true)
      }
    } catch (error) {
      console.error('Arama önerileri yüklenemedi:', error)
    }
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    fetchSearchSuggestions(value)
  }

  // Kategorileri hiyerarşik olarak organize et
  const organizeCategories = (cats: Category[]) => {
    const parentCategories = cats.filter(cat => !cat.parent_category_id)
    const childCategories = cats.filter(cat => cat.parent_category_id)

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
            {/* Adres Gösterimi */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <FiMapPin className="text-primary-600" />
                <span className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                  {ilInput || 'Adres Yok'}
                </span>
              </div>
            </div>

            {/* Arama Çubuğu */}
            <form onSubmit={handleSearch} className="flex-1 relative">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="İstediğin ürün kapına gelsin"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={() => {
                    if (searchQuery.length >= 2 && searchSuggestions.length > 0) {
                      setShowSearchSuggestions(true)
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Arama Önerileri Dropdown */}
              {showSearchSuggestions && searchSuggestions.length > 0 && (
                <div
                  ref={searchSuggestionsRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-[400px] overflow-y-auto"
                >
                  {searchSuggestions.map((product) => (
                    <Link
                      key={product.product_id}
                      href={`/products/${product.product_id}`}
                      onClick={() => setShowSearchSuggestions(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition border-b border-gray-100 last:border-0"
                    >
                      <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.product_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <FiShoppingCart />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{product.product_name}</h4>
                        <p className="text-xs text-primary-600 font-semibold">{Number(product.price).toLocaleString('tr-TR')} ₺</p>
                      </div>
                    </Link>
                  ))}
                  <button
                    type="submit"
                    className="w-full text-center px-4 py-2 text-sm text-primary-600 font-medium hover:bg-gray-50 transition"
                  >
                    Tüm sonuçları gör ({searchQuery})
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Sağ Butonlar */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Giriş Yap / Kullanıcı */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition ${user?.isPremium
                    ? 'border-yellow-400 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 shadow-sm'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {user?.isPremium && <FiStar className="text-yellow-500 fill-yellow-500" />}
                  <FiUser className="text-lg" />
                  <span className="hidden lg:inline text-sm font-semibold">
                    {user?.isPremium ? 'Premium Hesabım' : 'Hesabım'}
                  </span>
                </button>
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                      <Link
                        href="/profile?tab=orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Siparişlerim
                      </Link>
                      <Link
                        href="/profile?tab=user-info"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Profil Ayarları
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
            <div
              className="relative group"
              onMouseEnter={handleCartMouseEnter}
              onMouseLeave={handleCartMouseLeave}
            >
              <Link
                href="/cart"
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition relative"
                title="Sepetim"
              >
                <FiShoppingCart className="text-lg" />
                <span className="hidden lg:inline text-sm font-semibold">Sepetim</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Sepet Önizleme Dropdown */}
              {isCartPreviewOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h3 className="font-bold text-gray-800 text-sm italic">Sepetim ({cartCount})</h3>
                    <Link href="/cart" className="text-xs text-primary-600 font-bold hover:underline">Sepete Git</Link>
                  </div>

                  <div className="max-h-80 overflow-y-auto scrollbar-hide">
                    {cartItems.length > 0 ? (
                      <div className="divide-y divide-gray-50">
                        {cartItems.map((item) => (
                          <div key={item.cart_id} className="p-3 flex gap-3 hover:bg-gray-50 transition">
                            <div className="w-12 h-12 bg-gray-100 rounded border border-gray-100 flex-shrink-0 overflow-hidden">
                              {item.image_url ? (
                                <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">✕</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-gray-800 truncate">{item.product_name}</h4>
                              <p className="text-[10px] text-gray-500 mt-0.5">Adet: {item.quantity} {item.selected_size && `• Beden: ${item.selected_size}`}</p>
                              <p className="text-xs font-black text-primary-600 mt-1">{(item.price * item.quantity).toLocaleString('tr-TR')} ₺</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <FiShoppingCart className="mx-auto text-3xl text-gray-200 mb-2" />
                        <p className="text-sm text-gray-500">Sepetiniz henüz boş.</p>
                      </div>
                    )}
                  </div>

                  {cartItems.length > 0 && (
                    <div className="p-4 bg-gray-50 border-t border-gray-100">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Toplam</span>
                        <span className="text-sm font-black text-gray-900">
                          {cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0).toLocaleString('tr-TR')} ₺
                        </span>
                      </div>
                      <Link
                        href="/checkout"
                        className="block w-full text-center bg-primary-600 text-white py-2.5 rounded-lg text-xs font-black uppercase hover:bg-primary-700 transition shadow-md"
                      >
                        Sepeti Onayla
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

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
                onChange={handleSearchInputChange}
                onFocus={() => {
                  if (searchQuery.length >= 2 && searchSuggestions.length > 0) {
                    setShowSearchSuggestions(true)
                  }
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {/* Mobil Arama Önerileri - Basitleştirilmiş */}
              {showSearchSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-[300px] overflow-y-auto">
                  {searchSuggestions.map((product) => (
                    <Link
                      key={product.product_id}
                      href={`/products/${product.product_id}`}
                      onClick={() => setShowSearchSuggestions(false)}
                      className="block px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50"
                    >
                      <div className="text-sm font-medium text-gray-900 truncate">{product.product_name}</div>
                      <div className="text-xs text-primary-600 font-semibold">{Number(product.price).toLocaleString('tr-TR')} ₺</div>
                    </Link>
                  ))}
                </div>
              )}
            </form>
          </div>
        )}
      </div>

      {/* Yeşil Çizgi */}
      <div className="border-b-2 border-primary-600"></div>

      {/* Alt Navigasyon Bar - Kategoriler */}
      <div className="bg-white border-b border-gray-200 relative">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2">
            {/* Tüm Kategoriler - Dropdown (Scroll container dışında) */}
            <div className="relative flex-shrink-0">
              <button
                onClick={handleCategoriesClick}
                className="flex items-center space-x-2 px-4 py-3 hover:bg-gray-50 transition whitespace-nowrap text-gray-700 hover:text-primary-600 rounded-lg"
              >
                <FiMenu />
                <span>Tüm Kategoriler</span>
              </button>

              {/* Kategoriler Dropdown */}
              {isCategoriesOpen && (
                <>
                  <div
                    className="fixed inset-0 z-[60]"
                    onClick={() => setIsCategoriesOpen(false)}
                  />
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-[70] min-w-[300px] max-h-[600px] overflow-y-auto">
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
                              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition font-medium"
                            >
                              {category.image_url ? (
                                <img src={category.image_url} alt="" className="w-5 h-5 object-contain" />
                              ) : (
                                <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-[10px]">
                                  <FiMenu />
                                </div>
                              )}
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

            <nav className="flex items-center space-x-1 overflow-x-auto scrollbar-hide flex-1">
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
      </div>
    </header>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiPackage,
  FiCreditCard,
  FiMessageSquare,
  FiRefreshCw,
  FiHeart,
  FiClock,
  FiGrid,
  FiCheckCircle,
  FiXCircle,
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiBox,
  FiTruck,
  FiStar,
  FiPlus,
  FiTrash2,
  FiShoppingCart
} from 'react-icons/fi'
import AddressForm from '@/components/AddressForm'

// --- Interfaces ---

interface User {
  userId: number
  email: string
  firstName: string
  lastName: string
  phone?: string
}

interface Membership {
  isActive: boolean
  planType?: 'monthly' | 'yearly'
  expiryDate?: string
}

interface Address {
  address_id: number
  address_line1: string
  address_line2?: string
  city: string
  postal_code: string
  is_default: boolean
}

interface Order {
  order_id: number
  order_date: string
  total_amount: number
  status_name: string
  tracking_code?: string
  item_count: number
  items?: any[]
  guest_first_name?: string
  guest_last_name?: string
}

interface Favorite {
  favorite_id: number
  product_id: number
  product_name: string
  price: number
  stock_quantity: number
  image_url?: string
  category_name: string
}

interface Question {
  question_id: number
  product_id: number
  product_name: string
  image_url?: string
  question_text: string
  answer_text?: string
  is_answered: boolean
  created_at: string
  seller_first_name: string
  seller_last_name: string
}

interface Coupon {
  coupon_id: number
  code: string
  discount_value: number
  discount_type: 'PERCENT' | 'AMOUNT'
  min_purchase: number
  expiry_date: string
  is_active: boolean
  is_assigned: boolean
  is_used: boolean
}

interface FollowedStore {
  seller_id: number
  seller_first_name: string
  seller_last_name: string
  seller_email: string
  followed_at: string
  product_count: number
}

// --- Mock Data Helpers ---
const ORDER_STATUS_TABS = [
  { id: 'all', label: 'Tümü' },
  { id: 'continuing', label: 'Devam Eden' },
  { id: 'cancelled', label: 'İptal Edilen' },
  { id: 'returned', label: 'İade Edilen' }
]

export default function ProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // -- State --
  const [user, setUser] = useState<User | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [membership, setMembership] = useState<Membership | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [followedStores, setFollowedStores] = useState<FollowedStore[]>([])

  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('orders')
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [orderFilter, setOrderFilter] = useState('all')

  // -- Effects --
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam) setActiveTab(tabParam)
  }, [searchParams])

  useEffect(() => {
    // Parallel Fetching
    Promise.all([
      fetchUserData(),
      fetchAddresses(),
      fetchMembership(),
      fetchOrders(),
      fetchFavorites(),
      fetchQuestions(),
      fetchCoupons(),
      fetchFollowedStores()
    ]).finally(() => setLoading(false))
  }, [])

  // -- Fetch Functions --
  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else if (response.status === 401) {
        // Eğer tab=orders ise yönlendirme yapma, misafir siparişlerini görsün
        const tab = new URLSearchParams(window.location.search).get('tab')
        if (tab !== 'orders') {
          router.push('/login')
        }
      }
    } catch (e) { console.error(e) }
  }

  const fetchAddresses = async () => {
    try {
      const resp = await fetch('/api/addresses')
      if (resp.ok) setAddresses((await resp.json()).addresses || [])
    } catch (e) { console.error(e) }
  }

  const fetchMembership = async () => {
    try {
      const resp = await fetch('/api/membership')
      if (resp.ok) setMembership((await resp.json()).membership)
    } catch (e) {
      setMembership({ isActive: false })
    }
  }

  const fetchOrders = async () => {
    try {
      const resp = await fetch('/api/orders')
      if (resp.ok) setOrders((await resp.json()).orders || [])
    } catch (e) { console.error(e) }
  }

  const fetchFavorites = async () => {
    try {
      const resp = await fetch('/api/favorites')
      if (resp.ok) setFavorites((await resp.json()).favorites || [])
    } catch (e) { console.error(e) }
  }

  const fetchQuestions = async () => {
    try {
      const resp = await fetch('/api/questions')
      if (resp.ok) setQuestions((await resp.json()).questions || [])
    } catch (e) { console.error(e) }
  }

  const fetchCoupons = async () => {
    try {
      const resp = await fetch('/api/coupons')
      if (resp.ok) setCoupons((await resp.json()).coupons || [])
    } catch (e) { console.error(e) }
  }

  const fetchFollowedStores = async () => {
    try {
      const resp = await fetch('/api/follows')
      if (resp.ok) setFollowedStores((await resp.json()).followedStores || [])
    } catch (e) { console.error(e) }
  }

  const handleRemoveFavorite = async (favoriteId: number) => {
    try {
      const response = await fetch(`/api/favorites?favoriteId=${favoriteId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setFavorites(favorites.filter(f => f.favorite_id !== favoriteId))
      }
    } catch (error) {
      console.error('Hata:', error)
    }
  }

  const handleBuyAgain = async (orderItems: any[]) => {
    if (!orderItems || orderItems.length === 0) {
      alert('Sipariş içeriği bulunamadı.')
      return
    }

    setLoading(true)
    try {
      for (const item of orderItems) {
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: item.product_id,
            quantity: item.quantity || 1,
            selectedSize: item.selected_size
          }),
        })
      }
      router.push('/cart')
    } catch (e) {
      console.error(e)
      alert('Ürünler sepete eklenirken bir hata oluştu.')
      setLoading(false)
    }
  }

  const handleAddToCart = async (productId: number) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      })
      if (response.ok) alert('Sepete eklendi!')
      else alert('Sepete eklenemedi')
    } catch (error) { alert('Hata oluştu') }
  }


  const handleUnfollowStore = async (sellerId: number) => {
    if (!confirm('Bu mağazayı takibi bırakmak istediğinize emin misiniz?')) return
    try {
      const response = await fetch('/api/follows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId, action: 'unfollow' }),
      })
      if (response.ok) {
        setFollowedStores(followedStores.filter(s => s.seller_id !== sellerId))
      }
    } catch (error) {
      console.error('Hata:', error)
    }
  }

  const handleDeleteAddress = async (id: number) => {
    if (!confirm('Bu adresi silmek istediğinize emin misiniz?')) return
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: 'DELETE' })
      if (res.ok) fetchAddresses()
    } catch (e) { alert('Hata oluştu') }
  }

  const handleCancelMembership = async () => {
    if (!confirm('Premium üyeliğinizi iptal etmek istediğinize emin misiniz?\n\nNot: Üyeliğinizin kalan süresi olsa bile iptal edildiğinde ayrıcalıklarınız hemen sona erebilir.')) return

    try {
      const res = await fetch('/api/membership', { method: 'DELETE' })
      if (res.ok) {
        alert('Üyeliğiniz iptal edildi.')
        fetchMembership()
      } else {
        alert('İptal işlemi başarısız.')
      }
    } catch (error) {
      alert('Hata oluştu')
    }
  }

  // -- Helpers --
  const getStatusColor = (status: string) => {
    const s = status.toLowerCase()
    if (s.includes('teslim') || s.includes('tamam')) return 'text-green-600'
    if (s.includes('iptal') || s.includes('iade')) return 'text-red-600'
    if (s.includes('kargo') || s.includes('yol')) return 'text-blue-600'
    return 'text-green-600'
  }

  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'all') return true
    const s = o.status_name.toLowerCase()
    if (orderFilter === 'continuing') return !s.includes('teslim') && !s.includes('iptal') && !s.includes('iade')
    if (orderFilter === 'cancelled') return s.includes('iptal')
    if (orderFilter === 'returned') return s.includes('iade')
    return true
  })

  // -- Render Components --

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-600">Yükleniyor...</div>

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 pb-20">
      <div className="container mx-auto px-4 py-8">

        <div className="flex flex-col lg:flex-row gap-6">

          {/* --- SIDEBAR --- */}
          <div className="w-full lg:w-64 flex-shrink-0 space-y-4">

            {/* User Card */}
            <div className="rounded-lg p-4 bg-gradient-to-r from-green-600 to-green-800 text-white shadow-lg border border-green-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold backdrop-blur-sm">
                  {user ? (user.firstName?.charAt(0) || 'U') : 'M'}
                </div>
                <div className="overflow-hidden">
                  <h2 className="font-bold truncate">{user ? `${user.firstName} ${user.lastName}` : 'Misafir Kullanıcı'}</h2>
                  <p className="text-xs opacity-90 truncate">{user ? user.email : 'Giriş yapılmadı'}</p>
                </div>
              </div>
              {membership?.isActive ? (
                <div className="mt-3 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-xs font-semibold inline-flex items-center gap-1">
                  <FiStar className="fill-current" /> Premium Üye
                </div>
              ) : (
                <Link href="/membership" className="mt-3 bg-white text-green-800 rounded-full px-3 py-1 text-xs font-bold inline-flex items-center gap-1 hover:bg-gray-100 transition">
                  <FiPlus /> Üye Ol
                </Link>
              )}
            </div>

            {/* Menu Sections */}
            <nav className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Siparişlerim</h3>
                <SideButton
                  active={activeTab === 'orders'}
                  icon={<FiBox />}
                  label="Tüm Siparişlerim"
                  onClick={() => setActiveTab('orders')}
                />

                <SideButton
                  active={activeTab === 'buy-again'}
                  icon={<FiRefreshCw />}
                  label="Tekrar Satın Al"
                  onClick={() => setActiveTab('buy-again')}
                />
              </div>

              <div className="border-t border-gray-100 p-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Sana Özel</h3>
                <SideButton
                  active={activeTab === 'premium'}
                  icon={<FiStar />}
                  label="Premium Üyelik"
                  onClick={() => setActiveTab('premium')}
                />
                <SideButton
                  active={activeTab === 'coupons'}
                  icon={<FiCreditCard />}
                  label="İndirim Kuponlarım"
                  onClick={() => setActiveTab('coupons')}
                />
                <SideButton
                  active={activeTab === 'favorites'}
                  icon={<FiHeart />}
                  label="Önceden Gezdiklerim"
                  onClick={() => setActiveTab('favorites')}
                />
                <SideButton
                  active={activeTab === 'stores'}
                  icon={<FiGrid />}
                  label="Takip Ettiğim Mağazalar"
                  onClick={() => setActiveTab('stores')}
                />
              </div>

              <div className="border-t border-gray-100 p-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Hizmetlerim</h3>
                <SideButton
                  active={activeTab === 'addresses'}
                  icon={<FiMapPin />}
                  label="Adres Bilgilerim"
                  onClick={() => setActiveTab('addresses')}
                />
                <SideButton
                  active={activeTab === 'user-info'}
                  icon={<FiUser />}
                  label="Kullanıcı Bilgilerim"
                  onClick={() => setActiveTab('user-info')}
                />
                <SideButton
                  active={activeTab === 'questions'}
                  icon={<FiMessageSquare />}
                  label="Sorularım"
                  onClick={() => setActiveTab('questions')}
                />
              </div>
            </nav>
          </div>

          {/* --- MAIN CONTENT --- */}
          <div className="flex-1">

            {/* ORDERS VIEW */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {/* Header & Search */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <h1 className="text-2xl font-bold text-gray-800">Siparişlerim</h1>
                  <div className="relative w-full md:w-96">
                    <input
                      type="text"
                      placeholder="Ürün veya marka adına göre ara"
                      className="w-full bg-white border border-gray-300 text-gray-800 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition shadow-sm"
                    />
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {ORDER_STATUS_TABS.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setOrderFilter(tab.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${orderFilter === tab.id
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}

                  <div className="ml-auto w-px h-6 bg-gray-300 mx-2 hidden md:block"></div>
                  <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 shadow-sm">
                    <span>Tüm Tarihler</span>
                    <FiChevronDown />
                  </button>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                  {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-lg p-12 text-center border border-gray-200 shadow-sm">
                      <FiBox className="text-6xl text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Sipariş Bulunamadı</h3>
                      <p className="text-gray-500">Bu filtreye uygun siparişiniz bulunmamaktadır.</p>
                    </div>
                  ) : (
                    filteredOrders.map((order) => (
                      <div key={order.order_id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        {/* Order Header */}
                        <div className="bg-gray-50 p-4 flex flex-wrap items-center justify-between gap-y-4 text-sm border-b border-gray-100">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-2 flex-1">
                            <div>
                              <span className="block text-gray-500 text-xs mb-0.5">Sipariş Tarihi</span>
                              <span className="text-gray-700 font-medium">
                                {new Date(order.order_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </span>
                            </div>
                            <div>
                              <span className="block text-gray-500 text-xs mb-0.5">Sipariş Özeti</span>
                              <span className="text-gray-700 font-medium">1 Teslimat, {order.item_count} Ürün</span>
                            </div>
                            <div>
                              <span className="block text-gray-500 text-xs mb-0.5">Alıcı</span>
                              <span className="text-gray-700 font-medium">
                                {order.guest_first_name
                                  ? `${order.guest_first_name} ${order.guest_last_name}`
                                  : user ? `${user.firstName} ${user.lastName}` : 'Misafir'}
                              </span>
                            </div>
                            <div>
                              <span className="block text-gray-500 text-xs mb-0.5">Toplam</span>
                              <span className="text-green-600 font-bold">{order.total_amount.toLocaleString('tr-TR')} TL</span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleBuyAgain(order.items || [])}
                              disabled={loading}
                              className="bg-white border-2 border-green-600 text-green-600 hover:bg-green-50 px-4 py-2 rounded-md font-bold text-sm transition shadow-sm flex items-center gap-2 group"
                            >
                              <FiRefreshCw className={`transition-transform duration-500 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                              Tekrar Satın Al
                            </button>
                            <Link
                              href={`/orders/${order.order_id}`}
                              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-bold text-sm transition shadow-sm flex items-center"
                            >
                              Detaylar
                            </Link>
                          </div>
                        </div>

                        {/* Order Body */}
                        <div className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="border border-gray-200 bg-white rounded-lg p-4 flex-1 shadow-sm">
                              <div className="flex items-center gap-3 mb-4">
                                {order.status_name.includes('Teslim') ? (
                                  <FiCheckCircle className="text-green-600 text-xl" />
                                ) : order.status_name.includes('İptal') ? (
                                  <FiXCircle className="text-red-600 text-xl" />
                                ) : (
                                  <FiClock className="text-green-600 text-xl" />
                                )}
                                <div>
                                  <span className={`font-bold ${getStatusColor(order.status_name)}`}>
                                    {order.status_name}
                                  </span>
                                  <p className="text-gray-500 text-xs mt-0.5">
                                    {order.item_count} ürün {order.status_name.toLowerCase()}
                                  </p>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                {order.items?.slice(0, 3).map((item: any, idx: number) => (
                                  <div key={idx} className="w-12 h-16 bg-white rounded border border-gray-200 flex items-center justify-center overflow-hidden shadow-sm">
                                    {item.image_url ? (
                                      <img src={item.image_url} alt="Ürün" className="w-full h-full object-cover" />
                                    ) : (
                                      <FiPackage className="text-gray-400 text-xl" />
                                    )}
                                  </div>
                                ))}
                                {order.item_count > 3 && (
                                  <div className="w-12 h-16 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">
                                    +{order.item_count - 3}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ADDRESSES VIEW */}
            {activeTab === 'addresses' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Adres Bilgilerim</h2>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition shadow-sm"
                  >
                    <FiPlus /> Yeni Adres Ekle
                  </button>
                </div>

                {showAddressForm ? (
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <AddressForm
                      onSuccess={() => { setShowAddressForm(false); fetchAddresses(); }}
                      onCancel={() => setShowAddressForm(false)}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map(addr => (
                      <div key={addr.address_id} className="bg-white rounded-lg border border-gray-200 p-6 relative group shadow-sm hover:shadow-md transition">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="bg-gray-100 p-2 rounded-full">
                              <FiMapPin className="text-green-600" />
                            </div>
                            <span className="font-bold text-gray-800">Ev Adresi</span>
                          </div>
                          {addr.is_default && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded border border-green-200">Varsayılan</span>}
                        </div>
                        <p className="text-gray-600 text-sm mb-1">{addr.address_line1}</p>
                        <p className="text-gray-600 text-sm mb-4">{addr.city} / {addr.postal_code}</p>
                        <button
                          onClick={() => handleDeleteAddress(addr.address_id)}
                          className="text-red-500 text-sm hover:text-red-600 flex items-center gap-1 transition"
                        >
                          <FiTrash2 /> Sil
                        </button>
                      </div>
                    ))}
                    {addresses.length === 0 && (
                      <div className="col-span-full py-12 text-center text-gray-500">
                        Henüz kayıtlı adresiniz yok.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* FAVORITES VIEW (Previously Visited) */}
            {activeTab === 'favorites' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Önceden Gezdiklerim (Favoriler)</h2>
                </div>

                {favorites.length === 0 ? (
                  <div className="bg-white rounded-lg p-12 text-center border border-gray-200 shadow-sm">
                    <FiHeart className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Listeniz Boş</h3>
                    <p className="text-gray-500">Henüz favorilere eklediğiniz bir ürün yok.</p>
                    <Link href="/products" className="inline-block mt-4 text-green-600 hover:text-green-700 font-medium">
                      Alışverişe Başla
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favorites.map((fav) => (
                      <div key={fav.favorite_id} className="bg-white border border-gray-200 rounded-lg overflow-hidden group shadow-sm hover:shadow-md transition">
                        <div className="relative aspect-square bg-gray-100">
                          {fav.image_url ? (
                            <img src={fav.image_url} alt={fav.product_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <FiPackage className="text-4xl" />
                            </div>
                          )}
                          <button
                            onClick={() => handleRemoveFavorite(fav.favorite_id)}
                            className="absolute top-2 right-2 bg-white/80 hover:bg-red-50 text-gray-500 hover:text-red-600 p-2 rounded-full transition shadow-sm"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                        <div className="p-4">
                          <h3 className="text-gray-800 font-medium truncate mb-1" title={fav.product_name}>{fav.product_name}</h3>
                          <p className="text-gray-500 text-xs mb-3">{fav.category_name}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-green-600 font-bold">{fav.price.toLocaleString('tr-TR')} TL</span>
                            <button
                              onClick={() => handleAddToCart(fav.product_id)}
                              className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition shadow-sm"
                            >
                              <FiShoppingCart />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* USER INFO VIEW */}
            {activeTab === 'user-info' && (
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Kullanıcı Bilgilerim</h2>

                <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6 shadow-sm">
                  <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                      {user?.firstName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{user?.firstName} {user?.lastName}</h3>
                      <p className="text-gray-500">{user?.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Ad</label>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800">
                        {user?.firstName}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Soyad</label>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800">
                        {user?.lastName}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">E-posta</label>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800 flex items-center gap-2">
                        <FiMail className="text-gray-400" />
                        {user?.email}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Telefon</label>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800 flex items-center gap-2">
                        <FiPhone className="text-gray-400" />
                        {user?.phone || 'Belirtilmemiş'}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
                    <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition shadow-sm">
                      Bilgileri Güncelle
                    </button>
                    <button className="bg-white text-gray-600 border border-gray-300 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition shadow-sm">
                      Şifre Değiştir
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* QUESTIONS VIEW */}
            {activeTab === 'questions' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">Sorularım</h2>

                <div className="space-y-4">
                  {questions.length === 0 ? (
                    <div className="bg-white rounded-lg p-12 text-center border border-gray-200 shadow-sm">
                      <FiMessageSquare className="text-6xl text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Henüz Soru Sormadınız</h3>
                      <p className="text-gray-500">Ürünler hakkında merak ettiklerinizi satıcılara sorabilirsiniz.</p>
                      <Link href="/products" className="inline-block mt-4 text-green-600 hover:text-green-700 font-medium">
                        Ürünleri İncele
                      </Link>
                    </div>
                  ) : (
                    questions.map((q) => (
                      <div key={q.question_id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition">
                        <div className="p-6">
                          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-50">
                            <div className="w-12 h-16 bg-gray-50 rounded overflow-hidden flex-shrink-0">
                              {q.image_url ? (
                                <img src={q.image_url} alt={q.product_name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                  <FiPackage />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-800 line-clamp-1">{q.product_name}</h4>
                              <p className="text-xs text-gray-500">
                                {new Date(q.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${q.is_answered ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {q.is_answered ? 'Cevaplandı' : 'Cevap Bekliyor'}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold text-xs uppercase">
                                {user?.firstName?.charAt(0)}
                              </div>
                              <div className="bg-blue-50/50 p-4 rounded-2xl rounded-tl-none flex-1">
                                <p className="text-gray-800 text-sm whitespace-pre-line">{q.question_text}</p>
                              </div>
                            </div>

                            {q.is_answered && (
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 font-bold text-xs uppercase">
                                  {q.seller_first_name?.charAt(0) || 'S'}
                                </div>
                                <div className="bg-green-50/50 p-4 rounded-2xl rounded-tl-none flex-1 border border-green-100">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-green-800 text-xs">
                                      {q.seller_first_name} {q.seller_last_name} (Satıcı)
                                    </span>
                                  </div>
                                  <p className="text-gray-800 text-sm whitespace-pre-line">{q.answer_text}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* PREMIUM MEMBERSHIP VIEW */}
            {activeTab === 'premium' && (
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Premium Üyelik</h2>

                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold ${membership?.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      <FiStar />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {membership?.isActive ? 'Premium Üyesiniz' : 'Premium Üye Değilsiniz'}
                      </h3>
                      <p className="text-gray-500">
                        {membership?.isActive ? 'Ayrıcalıkların keyfini çıkarın.' : 'Ayrıcalıklardan faydalanmak için hemen üye olun.'}
                      </p>
                    </div>
                  </div>

                  {membership?.isActive ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <span className="block text-gray-500 text-sm mb-1">Plan Tipi</span>
                          <span className="font-bold text-gray-800 uppercase">{membership.planType === 'yearly' ? 'Yıllık' : 'Aylık'} Plan</span>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <span className="block text-gray-500 text-sm mb-1">Bitiş Tarihi</span>
                          <span className="font-bold text-gray-800">
                            {membership.expiryDate ? new Date(membership.expiryDate).toLocaleDateString('tr-TR') : '-'}
                          </span>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <span className="block text-gray-500 text-sm mb-1">Yenilenme Tarihi</span>
                          <span className="font-bold text-gray-800">
                            {membership.expiryDate ? new Date(membership.expiryDate).toLocaleDateString('tr-TR') : '-'}
                          </span>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <span className="block text-gray-500 text-sm mb-1">Durum</span>
                          <span className="inline-flex items-center gap-1 text-green-600 font-bold">
                            <FiCheckCircle /> Aktif
                          </span>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-gray-100">
                        <h4 className="font-bold text-gray-800 mb-2">Üyelik Yönetimi</h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Üyeliğinizi iptal ederseniz, mevcut dönem sonuna kadar haklarınızdan yararlanmaya devam edebilirsiniz. (Not: Şu anki sistemde anında iptal edilir).
                        </p>
                        <button
                          onClick={handleCancelMembership}
                          className="text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300 px-6 py-2.5 rounded-lg font-medium transition flex items-center gap-2"
                        >
                          <FiXCircle /> Premium Üyeliği İptal Et
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-600 mb-6">Kargo bedava ve özel indirimlerden yararlanmak için hemen Katıl butonuna tıklayın.</p>
                      <Link href="/cart" onClick={() => handleAddToCart(1000)} className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition">
                        Premium'a Katıl (399 TL / Yıl)
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* BUY AGAIN VIEW */}
            {activeTab === 'buy-again' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h1 className="text-2xl font-black text-gray-800 mb-2 uppercase tracking-tight">Tekrar Satın Al</h1>
                  <p className="text-gray-500 text-sm">Daha önce satın aldığınız ve memnun kaldığınız ürünlere buradan ulaşabilirsiniz.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {(() => {
                    // Unique products from all orders
                    const allOrderedItems = orders.flatMap(o => o.items || []);
                    const uniqueProductIds = Array.from(new Set(allOrderedItems.map(i => i.product_id)));

                    if (uniqueProductIds.length === 0) {
                      return (
                        <div className="col-span-full py-20 text-center bg-white rounded-lg border-2 border-dashed border-gray-200">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiRefreshCw className="text-3xl text-gray-400" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-800 mb-2">Henüz siparişiniz yok</h3>
                          <p className="text-gray-500 mb-6">Satın aldığınız ürünler burada listelenecektir.</p>
                          <Link href="/products" className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition">
                            Alışverişe Başla
                          </Link>
                        </div>
                      );
                    }

                    return uniqueProductIds.map(pid => {
                      const item = allOrderedItems.find(i => i.product_id === pid);
                      if (!item) return null;

                      return (
                        <div key={pid} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition group flex flex-col">
                          <Link href={`/products/${pid}`} className="relative block aspect-[3/4] overflow-hidden bg-gray-50">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <FiPackage className="text-4xl" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                          </Link>

                          <div className="p-3 flex flex-col flex-grow">
                            <Link href={`/products/${pid}`} className="block mb-2">
                              <h3 className="text-xs font-medium text-gray-700 line-clamp-2 min-h-[2rem] group-hover:text-green-600 transition">
                                {item.product_name || 'İsimsiz Ürün'}
                              </h3>
                            </Link>

                            <div className="mt-auto pt-2 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-black text-gray-900">
                                  {Number(item.price || 0).toLocaleString('tr-TR')} TL
                                </span>
                              </div>

                              <button
                                onClick={() => handleBuyAgain([item])}
                                disabled={loading}
                                className="w-full bg-white border-2 border-green-600 text-green-600 text-[10px] font-black uppercase py-2 rounded-lg hover:bg-green-600 hover:text-white transition-all flex items-center justify-center gap-2"
                              >
                                <FiShoppingCart className="text-sm" />
                                Tekrar Al
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
            {/* COUPONS VIEW */}
            {activeTab === 'coupons' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">İndirim Kuponlarım</h1>
                    <p className="text-gray-500 text-sm">Alışverişlerinizde kullanabileceğiniz size özel fırsatlar.</p>
                  </div>
                  <div className="bg-green-100 text-green-700 p-3 rounded-full">
                    <FiCreditCard className="text-2xl" />
                  </div>
                </div>

                {coupons.length === 0 ? (
                  <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiCreditCard className="text-3xl text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Henüz kuponunuz yok</h3>
                    <p className="text-gray-500">Kampanyaları takip ederek indirim kuponları kazanabilirsiniz.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {coupons.map((coupon) => (
                      <div key={coupon.coupon_id} className={`bg-white rounded-xl border-2 p-5 relative overflow-hidden flex items-center transition-all ${coupon.is_used ? 'opacity-60 border-gray-100' : 'border-green-100 hover:border-green-300 hover:shadow-md'}`}>
                        {/* Decorative circle for ticket look */}
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full border-r-2 border-green-100" />
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full border-l-2 border-green-100" />

                        <div className="flex-1 px-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl font-black text-green-600">
                              {coupon.discount_type === 'PERCENT' ? `%${Math.round(coupon.discount_value)}` : `${Math.round(coupon.discount_value)} TL`}
                            </span>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">İndirim</span>
                          </div>
                          <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                            Kupon Kodu: <span className="bg-gray-100 px-2 py-1 rounded font-mono text-green-700">{coupon.code}</span>
                          </h3>
                          <div className="text-xs text-gray-500 space-y-1">
                            <p>• {Number(coupon.min_purchase).toLocaleString('tr-TR')} TL ve üzeri alışverişlerde geçerli</p>
                            <p>• Son Kullanma: {new Date(coupon.expiry_date).toLocaleDateString('tr-TR')}</p>
                          </div>
                        </div>

                        <div className="border-l-2 border-dashed border-gray-100 pl-6 text-center">
                          {coupon.is_used ? (
                            <span className="bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase">Kullanıldı</span>
                          ) : (
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(coupon.code);
                                alert('Kupon kodu kopyalandı: ' + coupon.code);
                              }}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase hover:bg-green-700 transition"
                            >
                              Kodu Kopyala
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STORES VIEW */}
            {activeTab === 'stores' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Takip Ettiğim Mağazalar</h1>
                    <p className="text-gray-500 text-sm">Sevdiğiniz satıcıların yeni ürünlerinden haberdar olun.</p>
                  </div>
                  <div className="bg-blue-100 text-blue-700 p-3 rounded-full">
                    <FiGrid className="text-2xl" />
                  </div>
                </div>

                {followedStores.length === 0 ? (
                  <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiGrid className="text-3xl text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Henüz bir mağaza takip etmiyorsunuz</h3>
                    <p className="text-gray-500 mb-6">Mağaza sayfalarından 'Takip Et' butonuna tıklayarak ekleyebilirsiniz.</p>
                    <Link href="/products" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition">
                      Mağazaları Keşfet
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {followedStores.map((store) => (
                      <div key={store.seller_id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition">
                        <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600" />
                        <div className="p-5">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-blue-600 font-black text-xl border-2 border-white shadow-sm -mt-2">
                              {(store.seller_first_name?.[0] || 'S')}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-800 leading-tight">
                                {store.seller_first_name} {store.seller_last_name}
                              </h3>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Öne Çıkan Satıcı</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mb-4">
                            <div className="bg-gray-50 p-2 rounded-lg text-center">
                              <span className="block text-xs font-black text-gray-800">{store.product_count}</span>
                              <span className="text-[10px] text-gray-400 uppercase font-bold">Ürün</span>
                            </div>
                            <div className="bg-gray-50 p-2 rounded-lg text-center">
                              <span className="block text-xs font-black text-gray-800">9.8</span>
                              <span className="text-[10px] text-gray-400 uppercase font-bold">Puan</span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Link
                              href={`/shop/${store.seller_id}`}
                              className="flex-1 bg-white border-2 border-blue-600 text-blue-600 text-[10px] font-black uppercase py-2 rounded-lg text-center hover:bg-blue-50 transition"
                            >
                              Mağazayı Gez
                            </Link>
                            <button
                              onClick={() => handleUnfollowStore(store.seller_id)}
                              className="bg-gray-100 text-gray-500 p-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition"
                              title="Takipten Çık"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* OTHER TABS PLACEHOLDERS */}
            {!['orders', 'addresses', 'favorites', 'user-info', 'premium', 'questions', 'buy-again', 'coupons', 'stores'].includes(activeTab) && (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiCode className="text-4xl text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Hazırlanıyor...</h2>
                <p className="text-gray-500">Bu özellik çok yakında eklenecek!</p>
                <button onClick={() => setActiveTab('orders')} className="mt-6 text-green-600 hover:text-green-700 font-medium">
                  Siparişlerime Dön
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

function SideButton({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${active
        ? 'bg-green-50 text-green-700 border-l-4 border-green-600'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
    >
      <span className="text-lg">{icon}</span>
      {label}
    </button>
  )
}

function FiCode(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )
}

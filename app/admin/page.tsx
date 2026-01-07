'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiBarChart2, FiPackage, FiDollarSign, FiTrendingUp, FiShoppingBag, FiEdit, FiTruck, FiSearch } from 'react-icons/fi'

interface Order {
  order_id: number
  order_date: string
  total_amount: number
  status_id: number
  status_name: string
  tracking_code?: string
  shipped_date?: string
  delivered_date?: string
  item_count: number
  user_email?: string
  user_name?: string
  guest_email?: string
  guest_name?: string
}

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders'>('dashboard')
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [statusId, setStatusId] = useState<number>(1)
  const [trackingCode, setTrackingCode] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
  })
  const [reports, setReports] = useState<any>({
    topProducts: [],
    monthlyRevenue: [],
    categorySales: [],
    lowStock: [],
  })

  useEffect(() => {
    loadAdminData()
  }, [])

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders()
    }
  }, [activeTab, statusFilter, searchQuery])

  const loadAdminData = async () => {
    try {
      const authRes = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store',
      })

      if (!authRes.ok) {
        console.log('[Admin] Auth başarısız, login sayfasına yönlendiriliyor')
        setTimeout(() => {
          window.location.href = '/login?redirect=/admin'
        }, 100)
        return
      }

      const authData = await authRes.json()
      console.log('[Admin] Auth data:', authData)
      
      if (!authData.user) {
        console.log('[Admin] User bulunamadı')
        setTimeout(() => {
          window.location.href = '/login?redirect=/admin'
        }, 100)
        return
      }

      if (authData.user.roleId !== 1) {
        console.log('[Admin] Admin yetkisi yok, roleId:', authData.user.roleId)
        alert('Bu sayfaya erişim yetkiniz yok. Admin yetkisi gereklidir.')
        setTimeout(() => {
          window.location.href = '/'
        }, 100)
        return
      }

      console.log('[Admin] Admin yetkisi onaylandı')
      setUser(authData.user)

      // Raporları çek
      try {
        const [topProductsRes, monthlyRevenueRes, categorySalesRes, lowStockRes] = await Promise.all([
          fetch('/api/admin/reports?type=top-products', { credentials: 'include' }).catch(() => null),
          fetch('/api/admin/reports?type=monthly-revenue', { credentials: 'include' }).catch(() => null),
          fetch('/api/admin/reports?type=category-sales', { credentials: 'include' }).catch(() => null),
          fetch('/api/admin/reports?type=low-stock', { credentials: 'include' }).catch(() => null),
        ])

        if (topProductsRes?.ok) {
          const data = await topProductsRes.json()
          setReports((prev: any) => ({ ...prev, topProducts: data.data || [] }))
        }

        if (monthlyRevenueRes?.ok) {
          const data = await monthlyRevenueRes.json()
          setReports((prev: any) => ({ ...prev, monthlyRevenue: data.data || [] }))
          
          const totalRev = (data.data || []).reduce((sum: number, item: any) => sum + parseFloat(item.total_revenue || 0), 0)
          const totalOrd = (data.data || []).reduce((sum: number, item: any) => sum + parseInt(item.total_orders || 0), 0)
          setStats((prev) => ({ ...prev, totalRevenue: totalRev, totalOrders: totalOrd }))
        }

        if (categorySalesRes?.ok) {
          const data = await categorySalesRes.json()
          setReports((prev: any) => ({ ...prev, categorySales: data.data || [] }))
        }

        if (lowStockRes?.ok) {
          const data = await lowStockRes.json()
          setReports((prev: any) => ({ ...prev, lowStock: data.data || [] }))
        }
      } catch (error) {
        console.error('Raporlar yüklenemedi:', error)
      }

    } catch (error) {
      console.error('Admin data yüklenemedi:', error)
      window.location.href = '/login?redirect=/admin'
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async () => {
    setOrdersLoading(true)
    try {
      let url = '/api/admin/orders?'
      if (statusFilter) url += `statusId=${statusFilter}&`
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`
      
      console.log('[Admin] Siparişler yükleniyor:', url)
      const response = await fetch(url, { credentials: 'include' })
      console.log('[Admin] Siparişler response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('[Admin] Siparişler data:', data)
        setOrders(data.orders || [])
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Bilinmeyen hata' }))
        console.error('[Admin] Siparişler yüklenemedi:', errorData)
        alert('Siparişler yüklenemedi: ' + (errorData.error || 'Bilinmeyen hata'))
      }
    } catch (error) {
      console.error('[Admin] Siparişler yüklenemedi (catch):', error)
      alert('Siparişler yüklenirken bir hata oluştu')
    } finally {
      setOrdersLoading(false)
    }
  }

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order)
    setStatusId(order.status_id)
    setTrackingCode(order.tracking_code || '')
    setShowOrderModal(true)
  }

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return

    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder.order_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          statusId: statusId,
          trackingCode: trackingCode.trim() || null,
        }),
      })

      if (response.ok) {
        alert('Sipariş güncellendi')
        setShowOrderModal(false)
        fetchOrders()
      } else {
        const error = await response.json()
        alert(error.error || 'Sipariş güncellenemedi')
      }
    } catch (error) {
      console.error('Sipariş güncelleme hatası:', error)
      alert('Bir hata oluştu')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Teslim Edildi': return 'bg-green-100 text-green-800'
      case 'Kargoda': return 'bg-blue-100 text-blue-800'
      case 'Onaylandı': return 'bg-yellow-100 text-yellow-800'
      case 'Beklemede': return 'bg-gray-100 text-gray-800'
      case 'İptal': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Yönetim Paneli</h1>
        {user && (
          <p className="text-gray-600">Hoş geldiniz, {user.firstName} {user.lastName}</p>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'dashboard'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'orders'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Siparişler
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <>
          {/* İstatistikler */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Toplam Ciro</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.totalRevenue.toLocaleString('tr-TR')} ₺
                  </p>
                </div>
                <FiDollarSign className="text-4xl text-primary-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Toplam Sipariş</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.totalOrders}
                  </p>
                </div>
                <FiShoppingBag className="text-4xl text-primary-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">En Çok Satan</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {reports.topProducts.length} Ürün
                  </p>
                </div>
                <FiTrendingUp className="text-4xl text-primary-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Düşük Stok</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {reports.lowStock.length} Ürün
                  </p>
                </div>
                <FiPackage className="text-4xl text-red-600" />
              </div>
            </div>
          </div>

          {/* Raporlar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">En Çok Satan Ürünler</h2>
              {reports.topProducts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Ürün</th>
                        <th className="text-right py-2">Satış</th>
                        <th className="text-right py-2">Ciro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.topProducts.slice(0, 5).map((product: any) => (
                        <tr key={product.product_id} className="border-b">
                          <td className="py-2">{product.product_name}</td>
                          <td className="text-right py-2">{product.total_sold || 0}</td>
                          <td className="text-right py-2">
                            {parseFloat(product.total_revenue || 0).toLocaleString('tr-TR')} ₺
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Henüz veri yok</p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Aylık Ciro</h2>
              {reports.monthlyRevenue.length > 0 ? (
                <div className="space-y-3">
                  {reports.monthlyRevenue.slice(0, 6).map((month: any, index: number) => (
                    <div key={index} className="flex justify-between items-center border-b pb-2">
                      <span className="text-gray-600">
                        {month.month ? new Date(month.month).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' }) : 'N/A'}
                      </span>
                      <span className="font-semibold text-gray-800">
                        {parseFloat(month.total_revenue || 0).toLocaleString('tr-TR')} ₺
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Henüz veri yok</p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Kategori Bazlı Satış</h2>
              {reports.categorySales.length > 0 ? (
                <div className="space-y-3">
                  {reports.categorySales.slice(0, 5).map((category: any) => (
                    <div key={category.category_id} className="flex justify-between items-center border-b pb-2">
                      <span className="text-gray-600">{category.category_name}</span>
                      <span className="font-semibold text-gray-800">
                        {parseFloat(category.total_revenue || 0).toLocaleString('tr-TR')} ₺
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Henüz veri yok</p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Düşük Stoklu Ürünler</h2>
              {reports.lowStock.length > 0 ? (
                <div className="space-y-3">
                  {reports.lowStock.slice(0, 5).map((product: any) => (
                    <div key={product.product_id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="text-gray-800">{product.product_name}</p>
                        <p className="text-sm text-gray-500">{product.stock_status || 'Stok düşük'}</p>
                      </div>
                      <span className={`font-semibold ${
                        product.stock_quantity === 0 ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {product.stock_quantity || 0}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Henüz veri yok</p>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Filtreler */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Sipariş ID, Email veya Kargo Kodu ile ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="">Tüm Durumlar</option>
                <option value="1">Beklemede</option>
                <option value="2">Onaylandı</option>
                <option value="3">Kargoda</option>
                <option value="4">Teslim Edildi</option>
                <option value="5">İptal</option>
              </select>
            </div>
          </div>

          {/* Sipariş Listesi */}
          {ordersLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Yükleniyor...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <FiPackage className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">Sipariş bulunamadı</p>
              <p className="text-gray-500 text-sm">
                {searchQuery || statusFilter 
                  ? 'Arama kriterlerinize uygun sipariş bulunamadı.'
                  : 'Henüz hiç sipariş oluşturulmamış.'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sipariş ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Müşteri</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tutar</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kargo Kodu</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.order_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.order_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {order.user_email || order.guest_email || 'N/A'}
                          <br />
                          <span className="text-xs text-gray-500">
                            {order.user_name || order.guest_name || ''}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(order.order_date).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {parseFloat(order.total_amount.toString()).toLocaleString('tr-TR')} ₺
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status_name)}`}>
                            {order.status_name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {order.tracking_code ? (
                            <span className="flex items-center gap-1">
                              <FiTruck className="text-primary-600" />
                              {order.tracking_code}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleEditOrder(order)}
                            className="text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1"
                          >
                            <FiEdit />
                            Düzenle
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sipariş Düzenleme Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Sipariş Düzenle</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sipariş Durumu
                </label>
                <select
                  value={statusId}
                  onChange={(e) => setStatusId(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  <option value={1}>Beklemede</option>
                  <option value={2}>Onaylandı</option>
                  <option value={3}>Kargoda</option>
                  <option value={4}>Teslim Edildi</option>
                  <option value={5}>İptal</option>
                </select>
              </div>

              {statusId === 3 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kargo Takip Kodu
                  </label>
                  <input
                    type="text"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    placeholder="Örn: TR123456789"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Kargoya verildiğinde takip kodu ekleyin</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleUpdateOrder}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition"
                >
                  Kaydet
                </button>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

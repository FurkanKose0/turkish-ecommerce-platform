'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  FiPackage,
  FiCalendar,
  FiMapPin,
  FiArrowLeft,
  FiShoppingBag,
  FiTruck,
  FiCheckCircle,
} from 'react-icons/fi'

interface OrderItem {
  order_item_id: number
  product_id: number
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
  image_url?: string
  sku?: string
  seller_id?: number
  seller_first_name?: string
  seller_last_name?: string
  seller_email?: string
  selected_size?: string
}

interface Order {
  order_id: number
  order_date: string
  total_amount: number
  status_name: string
  status_id: number
  tracking_code?: string
  tracking_number?: string
  cancellation_reason?: string
  cargo_company?: string
  shipped_date?: string
  delivered_date?: string
  address_line1?: string
  address_line2?: string
  city?: string
  postal_code?: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  guest_first_name?: string
  guest_last_name?: string
  guest_email?: string
  guest_phone?: string
  guest_address_line1?: string
  guest_address_line2?: string
  guest_city?: string
  guest_postal_code?: string
}

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (params.orderId) {
      fetchOrderDetails(params.orderId as string)
    }
  }, [params.orderId])

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data.order)
        setItems(data.items || [])
      } else if (response.status === 401) {
        router.push('/login')
      } else if (response.status === 404) {
        setError('Sipariş bulunamadı')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Sipariş detayları yüklenemedi')
      }
    } catch (error) {
      console.error('Sipariş detay hatası:', error)
      setError('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!order) return

    if (!confirm('Siparişi iptal etmek istediğinize emin misiniz?')) return

    const reason = prompt('İptal nedeni (isteğe bağlı):')

    try {
      const response = await fetch(`/api/orders/${order.order_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', reason }),
      })

      const data = await response.json()

      if (response.ok) {
        alert('Siparişiniz iptal edildi.')
        window.location.reload()
      } else {
        alert(data.error || 'İptal işlemi başarısız oldu.')
      }
    } catch (error) {
      console.error('İptal hatası:', error)
      alert('Bir hata oluştu.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Teslim Edildi':
        return 'bg-green-100 text-green-800'
      case 'Kargoda':
        return 'bg-blue-100 text-blue-800'
      case 'Onaylandı':
        return 'bg-yellow-100 text-yellow-800'
      case 'Beklemede':
        return 'bg-gray-100 text-gray-800'
      case 'İptal':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Teslim Edildi':
        return <FiCheckCircle className="text-green-600" />
      case 'Kargoda':
        return <FiTruck className="text-blue-600" />
      case 'Onaylandı':
        return <FiPackage className="text-yellow-600" />
      default:
        return <FiPackage className="text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <p className="text-center text-gray-600">Yükleniyor...</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <FiPackage className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {error || 'Sipariş bulunamadı'}
          </h2>
          <Link
            href="/orders"
            className="inline-block mt-4 text-primary-600 hover:text-primary-700 font-semibold"
          >
            Siparişlerime Dön
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-6">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold mb-4"
        >
          <FiArrowLeft />
          Siparişlerime Dön
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Sipariş Detayları</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Kolon - Sipariş Bilgileri */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sipariş Durumu */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                {getStatusIcon(order.status_name)}
                Sipariş Durumu
              </h2>
              <span
                className={`text-sm px-3 py-1 rounded-full font-semibold ${getStatusColor(
                  order.status_name
                )}`}
              >
                {order.status_name}
              </span>
            </div>

            {/* Cancelled Warning */}
            {order.status_name === 'İptal' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h3 className="text-red-800 font-bold flex items-center gap-2 mb-1">
                  <FiCheckCircle className="text-red-600" />
                  Sipariş İptal Edildi
                </h3>
                {order.cancellation_reason && (
                  <p className="text-red-700 text-sm mb-2">
                    <span className="font-semibold">İptal Nedeni:</span> {order.cancellation_reason}
                  </p>
                )}
                <p className="text-red-600 text-sm">
                  İade işlemi başlatılmıştır. Ücret iadesi bankanıza bağlı olarak 3-7 iş günü içerisinde kartınıza yansıyacaktır.
                </p>
              </div>
            )}

            {/* Cancel Button - Only for Pending/Confirmed */}
            {order.status_id <= 2 && (
              <div className="mb-4">
                <button
                  onClick={handleCancelOrder}
                  className="w-full border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 hover:border-red-300 font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <FiCheckCircle className="rotate-45" /> {/* Use X icon effectively? rotate check circle looks odd. I'll stick to a proper icon or just text if icon not imported. FiXCircle is imported? Wait, no. I'll use FiX if available or similar. Imported: FiCheckCircle is there. FiXCircle IS NOT imported in line 6-14 but I saw it in prior view file output... checking... Line 13: FiCheckCircle. Line 14: } (End of imports).
                   Wait, lines 6-14 do NOT have FiXCircle.
                   BUT I saw `import { ..., FiXCircle, ... } from 'react-icons/fi'` in `app/profile/page.tsx` earlier.
                   In THIS file `app/orders/[orderId]/page.tsx`, let me check imports.
                   Lines 6-14: FiPackage, FiCalendar, FiMapPin, FiArrowLeft, FiShoppingBag, FiTruck, FiCheckCircle.
                   NO FiXCircle.
                   I will use `FiTrash2` or just `FiArrowLeft` rotated? No.
                   I will add `FiXCircle` to imports first?
                   Ah, I cannot edit imports AND body in one non-contiguous `replace_file_content`.
                   I will use `FiCheckCircle` for now and just rely on red color, OR just text.
                   Acually, I will update imports in a separate step or use `multi_replace`.
                   Let's use `multi_replace` to add import AND add button.
                   */}
                  Siparişi İptal Et
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Siparişiniz kargoya verilmeden önce iptal edebilirsiniz.
                </p>
              </div>
            )}

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <FiCalendar />
                <span>
                  Sipariş Tarihi:{' '}
                  {new Date(order.order_date).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              {order.shipped_date && (
                <div className="flex items-center gap-2">
                  <FiTruck />
                  <span>
                    Kargoya Verildi:{' '}
                    {new Date(order.shipped_date).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
              {(order.tracking_number || order.tracking_code) && order.status_id === 3 && (
                <div className="flex flex-col gap-3 mt-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-3">
                    <FiTruck className="text-blue-600 text-xl" />
                    <div>
                      <span className="text-sm font-medium text-blue-800">Kargo Takip No:</span>
                      <p className="text-lg font-bold text-blue-900 font-mono tracking-wider">
                        {order.tracking_number || order.tracking_code}
                      </p>
                      <p className="text-xs text-blue-600 mt-0.5 font-semibold">
                        {order.cargo_company || 'Kargo Firması Belirtilmedi'}
                      </p>
                    </div>
                  </div>
                  <a
                    href={
                      order.cargo_company === 'Yurtiçi Kargo'
                        ? `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${order.tracking_number || order.tracking_code}`
                        : `https://www.google.com/search?q=${encodeURIComponent(order.cargo_company || 'kargo')} takip ${order.tracking_number || order.tracking_code}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition w-full"
                  >
                    <span>Kargom Nerede?</span>
                    <FiMapPin className="text-xs" />
                  </a>
                </div>
              )}
              {order.delivered_date && (
                <div className="flex items-center gap-2">
                  <FiCheckCircle />
                  <span>
                    Teslim Edildi:{' '}
                    {new Date(order.delivered_date).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Ürünler */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FiShoppingBag />
              Sipariş Ürünleri
            </h2>
            <div className="divide-y">
              {items.map((item) => (
                <div key={item.order_item_id} className="py-4 flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <FiShoppingBag className="text-3xl text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800">{item.product_name}</h3>
                    {item.sku && (
                      <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                    )}
                    {item.selected_size && (
                      <p className="text-xs font-bold text-primary-600 mt-1 uppercase">Beden: {item.selected_size}</p>
                    )}
                    <p className="text-sm text-gray-600">
                      Adet: {item.quantity} x {Number(item.unit_price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                    </p>
                    {(item.seller_first_name || item.seller_email) && (
                      <p className="text-xs text-gray-500 mt-1">
                        Satıcı: {item.seller_first_name && item.seller_last_name
                          ? `${item.seller_first_name} ${item.seller_last_name}`
                          : item.seller_email || 'N/A'}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      {Number(item.subtotal).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sağ Kolon - Özet */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24 space-y-6">
            {/* Sipariş Bilgileri */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Sipariş Bilgileri</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Sipariş No:</span>
                  <p className="font-semibold text-gray-800">#{order.order_id}</p>
                </div>
                <div>
                  <span className="text-gray-600">Müşteri:</span>
                  <p className="font-semibold text-gray-800">
                    {order.first_name && order.last_name
                      ? `${order.first_name} ${order.last_name}`
                      : order.guest_first_name && order.guest_last_name
                        ? `${order.guest_first_name} ${order.guest_last_name}`
                        : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">E-posta:</span>
                  <p className="text-gray-800">{order.email || order.guest_email || 'N/A'}</p>
                </div>
                {(order.phone || order.guest_phone) && (
                  <div>
                    <span className="text-gray-600">Telefon:</span>
                    <p className="text-gray-800">{order.phone || order.guest_phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Teslimat Adresi */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiMapPin />
                Teslimat Adresi
              </h2>
              <div className="text-sm text-gray-700 space-y-1">
                <p className="font-semibold">{order.address_line1 || order.guest_address_line1}</p>
                {(order.address_line2 || order.guest_address_line2) && (
                  <p>{order.address_line2 || order.guest_address_line2}</p>
                )}
                <p>
                  {order.city || order.guest_city} / {order.postal_code || order.guest_postal_code}
                </p>
              </div>
            </div>

            {/* Fiyat Özeti */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                Fiyat Özeti
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Ara Toplam</span>
                  <span>{Number(order.total_amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Kargo</span>
                  <span className="text-primary-600 font-semibold">Ücretsiz</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-800 pt-3 border-t border-gray-200">
                  <span>Toplam</span>
                  <span className="text-primary-600">
                    {Number(order.total_amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div >
    </div >
  )
}

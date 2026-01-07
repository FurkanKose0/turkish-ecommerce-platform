'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  FiPackage,
  FiCalendar,
  FiDollarSign,
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
}

interface Order {
  order_id: number
  order_date: string
  total_amount: number
  status_name: string
  status_id: number
  tracking_code?: string
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
              {order.tracking_code && (
                <div className="flex items-center gap-2 mt-3 p-3 bg-blue-50 rounded-lg">
                  <FiTruck className="text-blue-600" />
                  <div>
                    <span className="text-sm font-medium text-blue-800">Kargo Takip Kodu:</span>
                    <p className="text-lg font-bold text-blue-900">{order.tracking_code}</p>
                  </div>
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
                    <p className="text-sm text-gray-600">
                      Adet: {item.quantity} x {item.unit_price.toLocaleString('tr-TR')} ₺
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
                      {item.subtotal.toLocaleString('tr-TR')} ₺
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
                <FiDollarSign />
                Fiyat Özeti
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Ara Toplam</span>
                  <span>{order.total_amount.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Kargo</span>
                  <span className="text-primary-600 font-semibold">Ücretsiz</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-800 pt-3 border-t border-gray-200">
                  <span>Toplam</span>
                  <span className="text-primary-600">
                    {order.total_amount.toLocaleString('tr-TR')} ₺
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

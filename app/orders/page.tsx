'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { FiPackage, FiCalendar, FiDollarSign, FiCheckCircle, FiX, FiTruck } from 'react-icons/fi'

interface Order {
  order_id: number
  order_date: string
  total_amount: number
  status_name: string
  tracking_code?: string
  item_count: number
}

export default function OrdersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successOrderId, setSuccessOrderId] = useState<number | null>(null)

  useEffect(() => {
    const success = searchParams.get('success')
    const orderId = searchParams.get('orderId')
    
    if (success === 'true' && orderId) {
      setShowSuccess(true)
      setSuccessOrderId(Number(orderId))
      // URL'den parametreleri temizle
      router.replace('/orders', { scroll: false })
    }
    
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      } else if (response.status === 401) {
        router.push('/login')
      }
    } catch (error) {
      console.error('Siparişler yüklenemedi:', error)
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <p className="text-center text-gray-600">Yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Siparişlerim</h1>

      {/* Başarı Mesajı */}
      {showSuccess && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-6 flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <FiCheckCircle className="text-3xl text-green-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-green-800 mb-1">Siparişiniz Başarıyla Oluşturuldu!</h3>
              <p className="text-green-700">
                {successOrderId && `Sipariş numaranız: #${successOrderId}`}
              </p>
              <p className="text-sm text-green-600 mt-2">
                Sipariş detaylarınızı aşağıda görebilirsiniz. Sipariş durumunuz e-posta ile bildirilecektir.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSuccess(false)}
            className="text-green-600 hover:text-green-800 transition"
          >
            <FiX className="text-xl" />
          </button>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <FiPackage className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Henüz siparişiniz yok</h2>
          <p className="text-gray-600 mb-8">İlk siparişinizi vermek için ürünleri keşfedin.</p>
          <Link
            href="/products"
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
          >
            Alışverişe Başla
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.order_id}
              href={`/orders/${order.order_id}`}
              className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Sipariş #{order.order_id}
                    </h3>
                    <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(order.status_name)}`}>
                      {order.status_name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <FiCalendar />
                      <span>
                        {new Date(order.order_date).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiPackage />
                      <span>{order.item_count} ürün</span>
                    </div>
                    {order.tracking_code && (
                      <div className="flex items-center space-x-2 text-primary-600">
                        <FiTruck />
                        <span className="font-medium">Kargo: {order.tracking_code}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2 text-primary-600">
                    <span className="text-2xl font-bold">
                      {order.total_amount.toLocaleString('tr-TR')} ₺
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

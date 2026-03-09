'use client'

import React, { useEffect, useState } from 'react'
import { FiBox, FiClock, FiCheckCircle, FiTruck, FiXCircle, FiSearch, FiEye } from 'react-icons/fi'

interface Order {
    order_id: number
    order_date: string
    status_id: number
    status_name: string
    seller_total: string
    item_count: number
    first_name?: string
    last_name?: string
    guest_first_name?: string
    guest_last_name?: string
}

export default function SellerOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState<number | 'all'>('all')
    const [search, setSearch] = useState('')

    // Modal State
    const [modalType, setModalType] = useState<'cancel' | 'ship' | 'details' | null>(null)
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
    const [modalInput, setModalInput] = useState('')
    const [cargoCompany, setCargoCompany] = useState('Yurtiçi Kargo')
    const [modalLoading, setModalLoading] = useState(false)
    const [orderItems, setOrderItems] = useState<any[]>([])

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/seller/orders')
            if (res.ok) {
                const data = await res.json()
                setOrders(data.orders || [])
            }
        } catch (error) {
            console.error('Failed to fetch orders', error)
        } finally {
            setLoading(false)
        }
    }

    const onStatusChange = (orderId: number, newStatusId: number) => {
        if (newStatusId === 5) {
            setSelectedOrderId(orderId)
            setModalType('cancel')
            setModalInput('')
        } else if (newStatusId === 3) {
            setSelectedOrderId(orderId)
            setModalType('ship')
            setModalInput('')
            setCargoCompany('Yurtiçi Kargo')
        } else {
            // Direct update for other statuses
            handleStatusUpdate(orderId, newStatusId)
        }
    }

    const handleStatusUpdate = async (orderId: number, newStatusId: number, extraData: any = {}) => {
        try {
            setModalLoading(true)
            const res = await fetch(`/api/seller/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status_id: newStatusId, ...extraData })
            })

            if (res.ok) {
                setOrders(orders.map(o =>
                    o.order_id === orderId
                        ? { ...o, status_id: newStatusId, status_name: getStatusName(newStatusId) }
                        : o
                ))
                closeModal()
            } else {
                alert('Güncelleme başarısız')
            }
        } catch (error) {
            alert('Hata oluştu')
        } finally {
            setModalLoading(false)
        }
    }

    const closeModal = () => {
        setModalType(null)
        setSelectedOrderId(null)
        setModalInput('')
        setCargoCompany('Yurtiçi Kargo')
        setOrderItems([])
    }

    const submitModal = (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedOrderId) return

        if (modalType === 'cancel') {
            handleStatusUpdate(selectedOrderId, 5, { cancellation_reason: modalInput })
        } else if (modalType === 'ship') {
            handleStatusUpdate(selectedOrderId, 3, { tracking_number: modalInput, cargo_company: cargoCompany })
        }
    }

    const handleViewDetails = async (orderId: number) => {
        setSelectedOrderId(orderId)
        setModalType('details')
        setModalLoading(true)
        try {
            const res = await fetch(`/api/seller/orders/${orderId}/items`)
            if (res.ok) {
                const data = await res.json()
                setOrderItems(data.items || [])
            }
        } catch (error) {
            console.error('Items fetch error', error)
        } finally {
            setModalLoading(false)
        }
    }

    const getStatusName = (id: number) => {
        const statuses: any = {
            1: 'Beklemede',
            2: 'Onaylandı',
            3: 'Kargoda',
            4: 'Teslim Edildi',
            5: 'İptal'
        }
        return statuses[id] || 'Bilinmiyor'
    }

    const getStatusColor = (id: number) => {
        switch (id) {
            case 1: return 'text-orange-600 bg-orange-100'
            case 2: return 'text-blue-600 bg-blue-100'
            case 3: return 'text-purple-600 bg-purple-100'
            case 4: return 'text-green-600 bg-green-100'
            case 5: return 'text-red-600 bg-red-100'
            default: return 'text-gray-600 bg-gray-100'
        }
    }

    const filteredOrders = orders.filter(order => {
        const matchesStatus = filterStatus === 'all' || order.status_id === filterStatus
        const customerName = (order.first_name ? `${order.first_name} ${order.last_name}` : `${order.guest_first_name} ${order.guest_last_name}`).toLowerCase()
        const matchesSearch = customerName.includes(search.toLowerCase()) || order.order_id.toString().includes(search)
        return matchesStatus && matchesSearch
    })

    if (loading) return <div className="text-gray-900 p-8">Yükleniyor...</div>

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Sipariş Yönetimi</h1>

            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${filterStatus === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        Tümü
                    </button>
                    <button
                        onClick={() => setFilterStatus(1)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${filterStatus === 1 ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        Beklemede
                    </button>
                    <button
                        onClick={() => setFilterStatus(3)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${filterStatus === 3 ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        Kargoda
                    </button>
                    <button
                        onClick={() => setFilterStatus(4)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${filterStatus === 4 ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        Tamamlandı
                    </button>
                </div>

                <div className="relative w-full md:w-64">
                    <input
                        type="text"
                        placeholder="Sipariş no veya Müşteri..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none text-gray-900"
                    />
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            {/* Orders List */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-4 text-sm font-medium text-gray-500">Sipariş No</th>
                                <th className="p-4 text-sm font-medium text-gray-500">Müşteri</th>
                                <th className="p-4 text-sm font-medium text-gray-500">Tarih</th>
                                <th className="p-4 text-sm font-medium text-gray-500">Tutar</th>
                                <th className="p-4 text-sm font-medium text-gray-500">Durum</th>
                                <th className="p-4 text-sm font-medium text-gray-500 text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredOrders.map(order => (
                                <tr key={order.order_id} className="hover:bg-gray-50 transition">
                                    <td className="p-4 text-gray-900 font-medium">#{order.order_id}</td>
                                    <td className="p-4 text-gray-700">
                                        {order.first_name
                                            ? `${order.first_name} ${order.last_name}`
                                            : `${order.guest_first_name || ''} ${order.guest_last_name || ''} (Misafir)`}
                                    </td>
                                    <td className="p-4 text-gray-500">
                                        {new Date(order.order_date).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td className="p-4 text-gray-900 font-mono">
                                        {Number(order.seller_total).toLocaleString('tr-TR')} ₺
                                        <span className="text-xs text-gray-400 block">{order.item_count} ürün</span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium ${getStatusColor(order.status_id)}`}>
                                            {order.status_id === 4 && <FiCheckCircle />}
                                            {order.status_id === 3 && <FiTruck />}
                                            {order.status_id === 1 && <FiClock />}
                                            {order.status_id === 5 && <FiXCircle />}
                                            {getStatusName(order.status_id)}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <select
                                            value={order.status_id}
                                            onChange={(e) => onStatusChange(order.order_id, parseInt(e.target.value))}
                                            className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 p-2 outline-none cursor-pointer hover:bg-gray-50"
                                            disabled={order.status_id === 5} // Prevent changing from cancelled for now or make it flexible
                                        >
                                            <option value={1}>Beklemede</option>
                                            <option value={2}>Onaylandı</option>
                                            <option value={3}>Kargola</option>
                                            <option value={4}>Tamamla</option>
                                            <option value={5}>İptal Et</option>
                                        </select>
                                        <button
                                            onClick={() => handleViewDetails(order.order_id)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                            title="Detaylar"
                                        >
                                            <FiEye />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        Sipariş bulunamadı.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Cancel/Ship/Details */}
            {modalType && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className={`bg-white rounded-lg shadow-xl w-full ${modalType === 'details' ? 'max-w-2xl' : 'max-w-md'} p-6 animate-in fade-in zoom-in-95 duration-200`}>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                            {modalType === 'cancel' ? 'Siparişi İptal Et' : modalType === 'ship' ? 'Kargo Bilgisi Gir' : `Sipariş Detayları #${selectedOrderId}`}
                        </h3>

                        {modalType === 'details' ? (
                            <div className="space-y-4">
                                {modalLoading ? (
                                    <div className="py-8 text-center text-gray-500">Yükleniyor...</div>
                                ) : (
                                    <>
                                        <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-2">
                                            {orderItems.map((item: any) => (
                                                <div key={item.order_item_id} className="flex gap-4 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                                                    <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0">
                                                        {item.image_url ? (
                                                            <img src={item.image_url} alt="" className="w-full h-full object-cover rounded" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400"><FiBox /></div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium text-gray-900 truncate">{item.product_name}</h4>
                                                        {item.selected_size && (
                                                            <p className="text-xs font-bold text-green-600 mt-0.5">BEDEN: {item.selected_size}</p>
                                                        )}
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            {item.quantity} adet x {Number(item.unit_price).toLocaleString('tr-TR')} ₺
                                                        </p>
                                                    </div>
                                                    <div className="text-right font-medium text-gray-900">
                                                        {Number(item.subtotal).toLocaleString('tr-TR')} ₺
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-end pt-4 border-t border-gray-100">
                                            <button onClick={closeModal} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition">Kapat</button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <form onSubmit={submitModal}>
                                <div className="mb-4">
                                    {modalType === 'ship' && (
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Kargo Firması
                                            </label>
                                            <select
                                                value={cargoCompany}
                                                onChange={(e) => setCargoCompany(e.target.value)}
                                                className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                            >
                                                <option value="Yurtiçi Kargo">Yurtiçi Kargo</option>
                                                <option value="Aras Kargo">Aras Kargo</option>
                                                <option value="MNG Kargo">MNG Kargo</option>
                                                <option value="PTT Kargo">PTT Kargo</option>
                                                <option value="Sürat Kargo">Sürat Kargo</option>
                                                <option value="UPS Kargo">UPS Kargo</option>
                                            </select>
                                        </div>
                                    )}
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {modalType === 'cancel' ? 'İptal Nedeni' : 'Kargo Takip Numarası'}
                                    </label>
                                    {modalType === 'cancel' ? (
                                        <textarea
                                            value={modalInput}
                                            onChange={(e) => setModalInput(e.target.value)}
                                            className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                            rows={3}
                                            placeholder="Ürün stokta kalmadı vb..."
                                            required
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            value={modalInput}
                                            onChange={(e) => setModalInput(e.target.value)}
                                            className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="TR123456789"
                                            required
                                        />
                                    )}
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                                    >
                                        Vazgeç
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={modalLoading}
                                        className={`px-4 py-2 text-sm font-bold text-white rounded-lg ${modalType === 'cancel' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                                    >
                                        {modalLoading ? 'İşleniyor...' : 'Onayla'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { FiEdit2, FiPackage, FiSearch, FiAlertCircle } from 'react-icons/fi'

interface Product {
    product_id: number
    product_name: string
    price: number
    stock_quantity: number
    image_url: string
    category_name: string
}

export default function SellerProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/seller/products')
            if (res.ok) {
                const data = await res.json()
                setProducts(data.products || [])
            }
        } catch (error) {
            console.error('Failed to fetch products', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredProducts = products.filter(p =>
        p.product_name.toLowerCase().includes(search.toLowerCase())
    )

    if (loading) return <div className="text-gray-900 p-8">Yükleniyor...</div>

    return (
        <div>
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Ürün Yönetimi</h1>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <input
                            type="text"
                            placeholder="Ürün ara..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                        />
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                    <Link
                        href="/seller/products/new"
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 whitespace-nowrap shadow-sm"
                    >
                        <FiPackage />
                        Yeni Ürün
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-4 text-sm font-medium text-gray-500">Ürün</th>
                                <th className="p-4 text-sm font-medium text-gray-500">Kategori</th>
                                <th className="p-4 text-sm font-medium text-gray-500">Fiyat</th>
                                <th className="p-4 text-sm font-medium text-gray-500">Stok Değeri</th>
                                <th className="p-4 text-sm font-medium text-gray-500 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredProducts.map(product => (
                                <tr key={product.product_id} className="hover:bg-gray-50 transition">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-16 h-16 bg-white rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-200 p-1">
                                                {product.image_url ? (
                                                    <img src={product.image_url} alt="" className="w-full h-full object-contain" />
                                                ) : (
                                                    <FiPackage className="text-gray-400 text-xl" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-gray-900 font-medium line-clamp-1">{product.product_name}</p>
                                                <p className="text-xs text-gray-500">ID: {product.product_id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-600">{product.category_name}</td>
                                    <td className="p-4 text-gray-900 font-mono">{Number(product.price).toLocaleString('tr-TR')} ₺</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-medium ${product.stock_quantity < 5 ? 'text-red-500' : 'text-green-600'}`}>
                                                {product.stock_quantity}
                                            </span>
                                            {product.stock_quantity < 5 && (
                                                <FiAlertCircle className="text-red-500 text-xs" title="Stok kritik" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <Link
                                            href={`/seller/products/${product.product_id}`}
                                            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 px-3 py-1.5 rounded-lg text-sm transition font-medium"
                                        >
                                            <FiEdit2 />
                                            Düzenle
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">
                                        Ürün bulunamadı.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
    FiMessageSquare,
    FiArrowLeft,
    FiSend,
    FiCheckCircle,
    FiAlertCircle,
    FiPackage
} from 'react-icons/fi'

interface Product {
    product_id: number
    product_name: string
    image_url?: string
    price: number
}

export default function AskQuestionPage() {
    const params = useParams()
    const router = useRouter()
    const searchParams = useSearchParams()
    const productId = searchParams.get('productId')

    const [product, setProduct] = useState<Product | null>(null)
    const [questionText, setQuestionText] = useState('')
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (productId) {
            fetchProduct()
        }
    }, [productId])

    const fetchProduct = async () => {
        try {
            const response = await fetch(`/api/products/${productId}`)
            if (response.ok) {
                const data = await response.json()
                setProduct(data.product)
            }
        } catch (e) { console.error(e) }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!questionText.trim()) return

        setLoading(true)
        setError('')

        try {
            const response = await fetch('/api/questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: productId,
                    questionText: questionText
                })
            })

            if (response.ok) {
                setSubmitted(true)
            } else {
                const data = await response.json()
                if (response.status === 401) {
                    router.push(`/login?callback=/shop/${params.sellerId}/ask?productId=${productId}`)
                } else {
                    setError(data.error || 'Bir hata oluştu.')
                }
            }
        } catch (e) {
            setError('Bağlantı hatası oluştu.')
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center border border-green-100">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl animate-bounce">
                        <FiCheckCircle />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Teşekkürler!</h1>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        Sorunuz satıcıya iletildi. Satıcı cevapladığında hesabınızdaki
                        <span className="font-bold text-primary-600"> "Sorularım" </span>
                        sekmesinden görebilirsiniz.
                    </p>
                    <div className="space-y-3">
                        <Link
                            href={`/products/${productId}`}
                            className="block w-full bg-primary-600 text-white py-4 rounded-2xl font-bold hover:bg-primary-700 transition shadow-lg"
                        >
                            Ürüne Dön
                        </Link>
                        <Link
                            href={`/shop/${params.sellerId}`}
                            className="block w-full bg-gray-100 text-gray-700 py-4 rounded-2xl font-bold hover:bg-gray-200 transition"
                        >
                            Mağazaya Dön
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition mb-8 font-medium group"
                >
                    <FiArrowLeft className="group-hover:-translate-x-1 transition" />
                    Geri Dön
                </button>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-primary-600 p-8 text-white">
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <FiMessageSquare className="text-primary-200" />
                            Satıcıya Soru Sor
                        </h1>
                        <p className="opacity-80 mt-2">Sorunuz en kısa sürede satıcı tarafından cevaplanacaktır.</p>
                    </div>

                    <div className="p-8">
                        {/* Product Info */}
                        {product && (
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl mb-8 border border-gray-100">
                                <div className="w-16 h-16 bg-white rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                                    {product.image_url ? (
                                        <img src={product.image_url} alt={product.product_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <FiPackage />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-800 line-clamp-1">{product.product_name}</h3>
                                    <p className="text-primary-600 font-bold">{product.price.toLocaleString('tr-TR')} ₺</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">
                                    Sorunuz
                                </label>
                                <textarea
                                    required
                                    rows={6}
                                    value={questionText}
                                    onChange={(e) => setQuestionText(e.target.value)}
                                    placeholder="Ürün hakkında merak ettiklerinizi buraya yazabilirsiniz..."
                                    className="w-full p-6 bg-gray-50 border border-gray-200 rounded-3xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white focus:border-primary-500 transition resize-none text-gray-800"
                                ></textarea>
                                <p className="text-xs text-info-500 mt-3 flex items-center gap-1">
                                    <FiAlertCircle />
                                    Lütfen kişisel bilgilerinizi (telefon, adres vb.) paylaşmayınız.
                                </p>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-3">
                                    <FiAlertCircle />
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary-600 text-white py-5 rounded-3xl font-bold hover:bg-primary-700 transition-all shadow-xl hover:shadow-primary-600/20 flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {loading ? 'Gönderiliyor...' : (
                                    <>
                                        <span>Soruyu Gönder</span>
                                        <FiSend className="animate-pulse" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

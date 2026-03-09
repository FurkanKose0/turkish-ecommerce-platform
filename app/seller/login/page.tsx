'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiLock, FiMail, FiShoppingBag, FiArrowRight } from 'react-icons/fi'

export default function SellerLoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })

            if (response.ok) {
                // Redirect to seller dashboard on success
                router.push('/seller')
            } else {
                const data = await response.json()
                setError(data.error || 'Giriş başarısız')
            }
        } catch (err) {
            setError('Bir hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-45 transform hover:rotate-12 transition duration-500">
                        <FiShoppingBag className="text-4xl text-green-600 -rotate-45" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Satıcı Paneli</h1>
                    <p className="text-gray-500">Mağazanı yönetmek için giriş yap</p>
                </div>

                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-xl">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">E-posta Adresi</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiMail className="text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 bg-white border border-gray-300 rounded-lg text-gray-900 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition outline-none"
                                    placeholder="ornek@magaza.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Şifre</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiLock className="text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 bg-white border border-gray-300 rounded-lg text-gray-900 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition outline-none"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        >
                            {loading ? 'Giriş Yapılıyor...' : (
                                <>
                                    Giriş Yap <FiArrowRight />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center pt-6 border-t border-gray-100">
                        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition">
                            ← Alışverişe Dön
                        </Link>
                    </div>
                </div>

                <div className="text-center mt-8 text-sm text-gray-500">
                    &copy; 2026 sKorry Ticaret. Tüm hakları saklıdır.
                </div>
            </div>
        </div>
    )
}

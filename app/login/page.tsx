'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Giriş başarısız')
        return
      }

      // Başarılı giriş - redirect parametresine göre yönlendir
      const redirect = searchParams.get('redirect') || '/'
      
      console.log('[Login] Giriş başarılı, yönlendiriliyor:', redirect)
      console.log('[Login] User data:', data.user)
      
      // Cookie'nin set edilmesi için kısa bir bekleme
      setTimeout(() => {
        window.location.href = redirect
      }, 100)
    } catch (err) {
      setError('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Başlık */}
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Merhaba, sKorry'e giriş yap veya hesap oluştur
        </h1>

        {/* Giriş/Kayıt Butonları */}
        <div className="flex gap-4 mb-8">
          <Link
            href="/login"
            className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold text-center hover:bg-primary-700 transition"
          >
            Giriş Yap
          </Link>
          <Link
            href="/register"
            className="flex-1 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold text-center hover:border-primary-600 hover:text-primary-600 transition"
          >
            Kayıt Ol
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* E-Posta */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              E-Posta
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="E-posta adresiniz"
            />
          </div>

          {/* Şifre */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Şifre
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="Şifreniz"
            />
          </div>

          {/* Şifremi Unuttum */}
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Şifremi Unuttum
            </Link>
          </div>

          {/* Giriş Butonu */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  )
}

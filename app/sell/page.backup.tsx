'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FiPackage, FiTrendingUp, FiDollarSign, FiShield, FiCheckCircle, FiArrowRight } from 'react-icons/fi'

export default function SellPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    productType: '',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Form gönderme işlemi
    alert('Başvurunuz alındı! En kısa sürede sizinle iletişime geçeceğiz.')
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      productType: '',
      message: '',
    })
  }

  const benefits = [
    {
      icon: FiTrendingUp,
      title: 'Geniş Müşteri Kitlesi',
      description: 'Milyonlarca aktif kullanıcıya ulaş',
    },
    {
      icon: FiDollarSign,
      title: 'Hızlı Ödeme',
      description: 'Satışlarınızın ödemesi hızlıca hesabınıza geçer',
    },
    {
      icon: FiShield,
      title: 'Güvenli Platform',
      description: 'Güvenli ödeme ve teslimat altyapısı',
    },
    {
      icon: FiPackage,
      title: 'Kolay Yönetim',
      description: 'Ürünlerini kolayca yönet ve takip et',
    },
  ]

  const steps = [
    {
      number: 1,
      title: 'Başvuru Yap',
      description: 'Formu doldur ve başvurunu gönder',
    },
    {
      number: 2,
      title: 'Onay Al',
      description: 'Ekibimiz başvurunu değerlendirir',
    },
    {
      number: 3,
      title: 'Ürünlerini Ekle',
      description: 'Ürünlerini platforma yükle',
    },
    {
      number: 4,
      title: 'Satışa Başla',
      description: 'Ürünlerin müşterilerle buluşsun',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-4">sKorry'de Satış Yap</h1>
            <p className="text-xl text-primary-100 mb-8">
              Ürünlerini milyonlarca müşteriye ulaştır. Türkiye'nin en büyük e-ticaret platformunda yerini al.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="#apply"
                className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition"
              >
                Hemen Başvur
                <FiArrowRight className="inline ml-2" />
              </Link>
              <Link
                href="/seller/login"
                className="inline-block bg-primary-800/50 text-white backdrop-blur-sm border border-white/20 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-800 transition"
              >
                Satıcı Girişi
              </Link>
            </div>
            <p className="mt-4 text-sm text-primary-200">
              Zaten bir mağazanız mı var? <Link href="/seller/login" className="underline hover:text-white">Satıcı Girişi Yapın</Link>
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Avantajlar */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Neden sKorry'de Satış Yapmalısın?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md">
                <div className="bg-primary-100 p-3 rounded-lg w-fit mb-4">
                  <benefit.icon className="text-primary-600 text-2xl" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Süreç */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Nasıl Çalışır?
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-primary-200 -z-10">
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-8 border-l-primary-200 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                  </div>
                )}
                <div className="bg-white rounded-lg p-6 shadow-md text-center">
                  <div className="bg-primary-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {step.number}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Başvuru Formu */}
        <div id="apply" className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Satıcı Başvuru Formu
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şirket Adı
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ürün Kategorisi *
                </label>
                <select
                  required
                  value={formData.productType}
                  onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Seçiniz</option>
                  <option value="electronics">Elektronik</option>
                  <option value="fashion">Moda</option>
                  <option value="home">Ev & Yaşam</option>
                  <option value="sports">Spor & Outdoor</option>
                  <option value="beauty">Kozmetik</option>
                  <option value="books">Kitap</option>
                  <option value="other">Diğer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mesaj
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  placeholder="Bize kendinden ve ürünlerinden bahset..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-primary-700 transition"
              >
                Başvuruyu Gönder
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

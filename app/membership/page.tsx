'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiCheck, FiStar, FiGift, FiTruck, FiPercent, FiShield, FiShoppingCart } from 'react-icons/fi'

export default function MembershipPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly')
  const [adding, setAdding] = useState(false)
  const [message, setMessage] = useState('')

  const plans = {
    monthly: {
      price: 49,
      period: 'aylık',
      savings: null,
    },
    yearly: {
      price: 399,
      period: 'yıllık',
      savings: '2 ay bedava',
    },
  }

  const benefits = [
    {
      icon: FiPercent,
      title: 'Özel İndirimler',
      description: 'Belirli katagorilerde %10\'a varan indirim',
    },
    {
      icon: FiTruck,
      title: 'Ücretsiz Kargo',
      description: 'Tüm siparişlerde ücretsiz kargo',
    },
    {
      icon: FiGift,
      title: 'Doğum Günü Hediyesi',
      description: 'Doğum gününüzde özel hediye kuponu',
    },
    {
      icon: FiStar,
      title: 'Öncelikli Destek',
      description: '7/24 öncelikli müşteri desteği',
    },
    {
      icon: FiShield,
      title: 'Güvenli Alışveriş',
      description: 'Ekstra güvenlik ve koruma',
    },
  ]

  const handleAddMembershipToCart = async () => {
    setAdding(true)
    setMessage('')

    try {
      // Üyelik ürünü için özel bir product_id kullanabiliriz
      // Veya API'de üyelik ürününü özel olarak handle edebiliriz
      // Şimdilik basit bir yaklaşım: kullanıcıyı sepete yönlendir
      
      // Gerçek uygulamada: products tablosunda üyelik ürünleri olmalı
      // Örnek: product_id = 999 (monthly), 1000 (yearly)
      // Şimdilik bu ID'leri kullanacağız
      
      const membershipProductId = selectedPlan === 'monthly' ? 999 : 1000
      
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: membershipProductId,
          quantity: 1,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        setMessage(data.error || 'Sepete eklenemedi')
        return
      }

      setMessage('Üyelik sepete eklendi!')
      setTimeout(() => {
        router.push('/cart')
      }, 1500)
    } catch (error) {
      console.error('Üyelik ekleme hatası:', error)
      setMessage('Bir hata oluştu')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Başlık */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">sKorry Avantajlı Üyelik</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Özel indirimler, ücretsiz kargo ve daha fazlası ile alışveriş deneyimini bir üst seviyeye taşı
          </p>
        </div>

        {/* Plan Seçimi */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 inline-flex shadow-md">
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                selectedPlan === 'monthly'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Aylık
            </button>
            <button
              onClick={() => setSelectedPlan('yearly')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                selectedPlan === 'yearly'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Yıllık
              {plans.yearly.savings && (
                <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded">
                  {plans.yearly.savings}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Üyelik Kartı */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-8 text-white">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Premium Üyelik</h2>
                  <p className="text-primary-100">Tüm avantajlardan yararlan</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold">
                    {plans[selectedPlan].price}₺
                  </div>
                  <div className="text-primary-100">
                    / {plans[selectedPlan].period}
                  </div>
                  {plans[selectedPlan].savings && (
                    <div className="mt-2 text-sm bg-green-500 text-white px-3 py-1 rounded-full inline-block">
                      {plans[selectedPlan].savings}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Avantajlar */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="bg-primary-100 p-3 rounded-lg">
                      <benefit.icon className="text-primary-600 text-xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{benefit.title}</h3>
                      <p className="text-gray-600 text-sm">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Üye Ol Butonu */}
              <button
                onClick={handleAddMembershipToCart}
                disabled={adding}
                className="w-full bg-primary-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-primary-700 transition mb-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {adding ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Ekleniyor...</span>
                  </>
                ) : (
                  <>
                    <FiShoppingCart />
                    <span>Üyeliği Başlat</span>
                  </>
                )}
              </button>

              {message && (
                <div
                  className={`p-3 rounded-lg mb-4 ${
                    message.includes('eklendi')
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {message}
                </div>
              )}

              <p className="text-center text-sm text-gray-500">
                İstediğin zaman iptal edebilirsin. Hiçbir gizli ücret yok.
              </p>
            </div>
          </div>

          {/* SSS */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Sık Sorulan Sorular</h3>
            <div className="space-y-4">
              {[
                {
                  q: 'Üyeliği nasıl iptal edebilirim?',
                  a: 'Üyeliğini istediğin zaman hesap ayarlarından iptal edebilirsin. İptal ettiğinde üyelik süren bitene kadar tüm avantajlardan yararlanmaya devam edersin.',
                },
                {
                  q: 'Ücretsiz kargo tüm ürünler için geçerli mi?',
                  a: 'Evet, Premium üyelik ile tüm siparişlerinde ücretsiz kargo hakkın var.',
                },
                {
                  q: 'İndirimler nasıl uygulanır?',
                  a: 'Üyelik indirimleri otomatik olarak sepete eklenen ürünlere uygulanır. Ekstra indirimler için özel kampanyaları takip et.',
                },
              ].map((faq, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow">
                  <h4 className="font-semibold text-gray-900 mb-2">{faq.q}</h4>
                  <p className="text-gray-600 text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

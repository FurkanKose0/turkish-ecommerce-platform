'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiCheck, FiStar, FiGift, FiTruck, FiPercent, FiShield, FiShoppingCart } from 'react-icons/fi'

export default function MembershipPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly')
  const [adding, setAdding] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [membership, setMembership] = useState<any>(null)

  useEffect(() => {
    fetchMembership()
  }, [])

  const fetchMembership = async () => {
    try {
      const resp = await fetch('/api/membership')
      if (resp.ok) {
        const data = await resp.json()
        setMembership(data.membership)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

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

  const handleAddMembershipToCart = async (plan: 'monthly' | 'yearly' = selectedPlan) => {
    setAdding(true)
    setMessage('')

    try {
      const membershipProductId = plan === 'monthly' ? 999 : 1000

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-primary-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <div className="container mx-auto px-4 py-8 lg:py-16">
        {membership?.isActive ? (
          /* Premium Üye Görünümü */
          <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-yellow-100/50">
              {/* Header */}
              <div className="bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] p-8 lg:p-14 text-white relative overflow-hidden">
                <div className="absolute -top-24 -right-24 opacity-5 pointer-events-none">
                  <FiStar className="text-[400px] rotate-12 fill-white" />
                </div>
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-yellow-500/20 mb-6 backdrop-blur-sm">
                      <FiStar className="fill-yellow-500 text-xs" /> Premium Üye
                    </div>
                    <h1 className="text-4xl lg:text-6xl font-black mb-4 tracking-tight leading-tight">
                      Hoş Geldin, <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600">
                        Ayrıcalıklı Müşterimiz
                      </span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-xl font-medium leading-relaxed">
                      Sizin için her detayı düşündük. Premium üyeliğinizle alışverişin en zahmetsiz ve avantajlı halini yaşıyorsunuz.
                    </p>
                  </div>
                  <div className="lg:w-72 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[1.5rem] shadow-2xl">
                    <div className="text-[10px] text-slate-400 mb-2 uppercase tracking-[0.2em] font-black">Plan Bilgisi</div>
                    <div className="text-3xl font-black text-yellow-500 uppercase tracking-tight mb-4">
                      {membership.planType === 'yearly' ? 'Yıllık' : 'Aylık'} Paket
                    </div>
                    <div className="pt-4 border-t border-white/10">
                      <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-widest font-bold">Sonlanma</div>
                      <div className="text-sm font-bold text-slate-200 flex items-center gap-2">
                        <FiCheck className="text-yellow-500" /> {new Date(membership.expiryDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* İçerik */}
              <div className="p-8 lg:p-14">
                <div className="grid lg:grid-cols-12 gap-12">
                  {/* Avantajlar Listesi */}
                  <div className="lg:col-span-8 space-y-10">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <span className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center text-xl">
                          <FiCheck />
                        </span>
                        Aktif Haklarınız
                      </h2>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-6">
                      {benefits.map((benefit, index) => (
                        <div key={index} className="flex items-start gap-5 p-6 rounded-2xl bg-slate-50 border border-transparent hover:border-yellow-200 hover:bg-white hover:shadow-xl transition-all duration-300 group">
                          <div className="bg-white p-4 rounded-xl shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                            <benefit.icon className="text-2xl" />
                          </div>
                          <div>
                            <h3 className="font-black text-slate-900 mb-1 uppercase text-xs tracking-wider">{benefit.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed font-medium">{benefit.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Yan Panel / Upgrade */}
                  <div className="lg:col-span-4 space-y-8">
                    {membership.planType === 'monthly' && (
                      <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-1 rounded-[2rem] shadow-2xl hover:scale-[1.02] transition-transform duration-300">
                        <div className="bg-white p-8 rounded-[1.9rem] h-full flex flex-col">
                          <div className="inline-block bg-yellow-400 text-white text-[10px] font-black px-3 py-1 rounded-full mb-4">
                            SÜPER FIRSAT
                          </div>
                          <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight">Yıllık Pakete Yükseltin!</h3>
                          <p className="text-slate-500 text-sm mb-8 font-medium leading-relaxed">
                            Yıllık üyeliğe geçerek ayda sadece <span className="text-slate-900 font-bold">33 TL</span> ödeyin.
                          </p>
                          <div className="mb-8 p-4 bg-yellow-50 rounded-2xl border border-yellow-100">
                            <div className="text-3xl font-black text-slate-900">399 ₺ <span className="text-xs text-slate-400 font-bold text-center block">/ YIL</span></div>
                          </div>
                          <button
                            onClick={() => handleAddMembershipToCart('yearly')}
                            disabled={adding}
                            className="w-full bg-[#1e293b] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-50"
                          >
                            {adding ? 'İşleniyor...' : 'Hemen Yükselt'}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="bg-white p-8 rounded-[2rem] border-2 border-slate-100 shadow-sm">
                      <h4 className="font-black text-slate-900 mb-6 flex items-center gap-2 uppercase text-xs tracking-[0.2em]">
                        <FiShield className="text-blue-500" /> Hesap Güvenliği
                      </h4>
                      <div className="space-y-4">
                        {[
                          'Üyeliğiniz bitmeden hatırlatılır.',
                          'Ödemeleriniz şifreli korunur.',
                          'Fatura bilginiz anında iletilir.'
                        ].map((text, i) => (
                          <div key={i} className="flex items-center gap-3 text-sm font-medium text-slate-500">
                            <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
                            {text}
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => router.push('/profile?tab=premium')}
                        className="w-full mt-10 py-3 text-sm text-slate-400 font-bold hover:text-slate-900 border-2 border-slate-50 hover:border-slate-200 rounded-xl transition-all"
                      >
                        Üyelik Ayarları
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Üye Olma Görünümü */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-20 space-y-6">
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter">
                sKorry <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">Premium</span>
              </h1>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                Alışverişte yeni bir devir başlıyor. Ücretsiz kargo, özel indirimler ve öncelikli hizmetle alışverişin keyfini çıkarın.
              </p>
            </div>

            <div className="flex justify-center mb-16">
              <div className="bg-white rounded-3xl p-2 inline-flex shadow-2xl border border-slate-100">
                <button
                  onClick={() => setSelectedPlan('monthly')}
                  className={`px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 ${selectedPlan === 'monthly'
                    ? 'bg-slate-900 text-white shadow-xl scale-105'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  Aylık
                </button>
                <button
                  onClick={() => setSelectedPlan('yearly')}
                  className={`px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 relative ${selectedPlan === 'yearly'
                    ? 'bg-slate-900 text-white shadow-xl scale-105'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  Yıllık
                  {plans.yearly.savings && (
                    <span className="absolute -top-4 -right-4 bg-green-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full border-4 border-white shadow-lg animate-bounce">
                      {plans.yearly.savings}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100">
                <div className="bg-[#0f172a] p-12 lg:p-16 text-white flex flex-col md:flex-row md:items-center justify-between gap-10">
                  <div className="space-y-6">
                    <div className="inline-block bg-primary-500/20 text-primary-400 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-primary-500/20">
                      Önerilen Seçenek
                    </div>
                    <h2 className="text-5xl font-black tracking-tight leading-none">Premium <br /> Üyelik</h2>
                    <p className="text-slate-400 font-medium text-lg">Hemen katılın, ayrıcalıkları yaşayın.</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white/10 text-center min-w-[240px]">
                    <div className="text-[10px] text-slate-500 mb-2 uppercase tracking-[0.3em] font-black">Başlangıç</div>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-6xl font-black text-primary-400 tracking-tighter">{plans[selectedPlan].price} ₺</span>
                    </div>
                    <div className="text-xs text-slate-400 font-bold uppercase mt-2 tracking-widest">/ {plans[selectedPlan].period}</div>
                  </div>
                </div>

                <div className="p-12 lg:p-20">
                  <div className="grid md:grid-cols-2 gap-x-16 gap-y-12 mb-16">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex gap-6 group">
                        <div className="bg-slate-50 p-5 rounded-[1.5rem] group-hover:bg-primary-600 group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-sm">
                          <benefit.icon className="text-3xl" />
                        </div>
                        <div>
                          <h3 className="font-black text-slate-900 mb-2 uppercase text-xs tracking-[0.2em]">{benefit.title}</h3>
                          <p className="text-slate-500 text-base leading-relaxed font-medium">{benefit.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleAddMembershipToCart()}
                    disabled={adding}
                    className="group relative w-full bg-primary-600 text-white py-6 rounded-3xl font-black text-xl overflow-hidden hover:bg-primary-700 transition-all shadow-[0_20px_50px_rgba(79,70,229,0.3)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 w-1/4 h-full bg-white/20 -skew-x-[45deg] -translate-x-full group-hover:translate-x-[500%] transition-transform duration-1000"></div>
                    <span className="flex items-center justify-center gap-3 relative z-10">
                      {adding ? (
                        <>
                          <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>İşleminiz Yapılıyor...</span>
                        </>
                      ) : (
                        <>
                          <FiShoppingCart className="text-2xl" />
                          <span>Üyeliği Başlat</span>
                        </>
                      )}
                    </span>
                  </button>

                  {message && (
                    <div className={`mt-8 p-5 rounded-2xl font-black text-center border-2 animate-in zoom-in-95 duration-300 ${message.includes('eklendi')
                      ? 'bg-green-50 text-green-700 border-green-100 shadow-lg shadow-green-100'
                      : 'bg-red-50 text-red-700 border-red-100 shadow-lg shadow-red-100'
                      }`}>
                      {message}
                    </div>
                  )}

                  <div className="mt-12 flex items-center justify-center gap-8 text-slate-400 uppercase text-[10px] font-black tracking-[0.3em]">
                    <div className="flex items-center gap-2">
                      <FiShield className="text-primary-600" /> Güvenli Ödeme
                    </div>
                    <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
                    <div className="flex items-center gap-2">
                      7/24 Destek
                    </div>
                  </div>
                </div>
              </div>

              {/* SSS Geliştirilmiş */}
              <div className="mt-32">
                <div className="text-center mb-16 space-y-4">
                  <h3 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tight">Merak Edilenler</h3>
                  <p className="text-slate-400 font-medium">Premium hakkında bilmeniz gereken her şey.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    {
                      q: 'Taahhüt Var mı?',
                      a: 'Hayır, istediğiniz an hiçbir gerekçe göstermeden üyeliğinizi sonlandırabilirsiniz.',
                    },
                    {
                      q: 'Limitler Neler?',
                      a: 'Premium üyeler için kargo bedava sınırı yoktur. 1 TL’lik üründe dahi kargo bizden!',
                    },
                    {
                      q: 'Spora Özel Değil mi?',
                      a: 'Premium avantajları sKorry Ticaret bünyesindeki tüm kategorilerde geçerlidir.',
                    },
                  ].map((faq, index) => (
                    <div key={index} className="group bg-white rounded-[2rem] p-10 shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-50 flex flex-col justify-between">
                      <div>
                        <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl font-black mb-6 group-hover:bg-primary-600 transition-colors">
                          ?
                        </div>
                        <h4 className="font-black text-slate-900 mb-4 text-sm uppercase tracking-widest">{faq.q}</h4>
                        <p className="text-slate-500 text-sm leading-relaxed font-medium">{faq.a}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

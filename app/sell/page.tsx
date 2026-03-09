'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  FiPackage,
  FiTrendingUp,
  FiDollarSign,
  FiShield,
  FiCheckCircle,
  FiArrowRight,
  FiUsers,
  FiGlobe,
  FiZap,
  FiAward
} from 'react-icons/fi'

export default function SellPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    productType: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        productType: '',
        message: '',
      })
    }, 1500)
  }

  const benefits = [
    {
      icon: FiGlobe,
      title: 'Global Erişim',
      description: 'Ürünlerinizi sadece Türkiye\'ye değil, tüm dünyaya ulaştırma fırsatı yakalayın.',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: FiDollarSign,
      title: 'Hızlı Ödemeler',
      description: 'Satışlarınızın ödemesini her hafta düzenli olarak banka hesabınıza alın.',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: FiShield,
      title: 'Satıcı Koruması',
      description: 'Dolandırıcılık ve haksız iadelere karşı %100 satıcı koruma programı.',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: FiZap,
      title: 'Kolay Entegrasyon',
      description: 'API ve XML entegrasyonu ile dakikalar içinde binlerce ürün yükleyin.',
      color: 'bg-amber-100 text-amber-600'
    },
  ]

  const stats = [
    { number: '5M+', label: 'Aktif Müşteri', icon: FiUsers },
    { number: '150K+', label: 'Günde Sipariş', icon: FiPackage },
    { number: '%35', label: 'Ortalama Büyüme', icon: FiTrendingUp },
    { number: '4.8/5', label: 'Satıcı Memnuniyeti', icon: FiAward },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-900 via-primary-800 to-primary-900 text-white relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse delay-700"></div>

        <div className="container mx-auto px-4 py-20 lg:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full mb-8 border border-white/10">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium">Satıcı Başvuruları Açıldı</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
              İşinizi <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">Büyütmenin</span><br />
              En Güçlü Yolu
            </h1>

            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
              Milyonlarca müşteriye ulaşın, satışlarınızı artırın ve işinizi profesyonel araçlarla yönetin.
              Katılım ücreti yok, sadece satış yaptıkça kazanın.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="#apply"
                className="group relative px-8 py-4 bg-white text-primary-900 rounded-full font-bold text-lg hover:bg-gray-100 transition shadow-xl hover:shadow-2xl hover:-translate-y-1 transform duration-200"
              >
                Hemen Başvur
                <FiArrowRight className="inline ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/seller/login"
                className="px-8 py-4 bg-transparent border border-white/30 text-white rounded-full font-bold text-lg hover:bg-white/10 transition backdrop-blur-sm"
              >
                Satıcı Girişi
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center justify-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition group">
                <div className="bg-primary-50 p-3 rounded-2xl text-primary-600 group-hover:scale-110 transition duration-300">
                  <stat.icon className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-3xl font-black text-gray-900">{stat.number}</div>
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        {/* Neden Biz? */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              Neden sKorry'de Satıcı Olmalısınız?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Size en iyi deneyimi sunmak için teknolojimizi ve süreçlerimizi sürekli geliştiriyoruz.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className={`${benefit.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-3xl`}>
                  <benefit.icon />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Başvuru ve Görsel Alanı */}
        <div id="apply" className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Sol: Görsel ve İçerik */}
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">
              İlk Adımı Bugün Atın
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Başvuru sürecimiz çok basit ve hızlıdır. Formu doldurduktan sonra ekibimiz 24 saat içinde sizinle iletişime geçecektir.
            </p>

            <div className="space-y-6">
              {[
                'Ücretsiz mağaza açılışı',
                'İlk 3 ay komisyon indirimi (%50)',
                'Ücretsiz ürün fotoğraf çekimi desteği',
                '7/24 Satıcı destek hattı'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <FiCheckCircle className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-gray-700">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-gray-100 rounded-2xl p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                  <img src="https://i.pravatar.cc/150?img=33" alt="Satıcı" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 italic mb-2">
                    "sKorry'ye katıldıktan sonra satışlarımız %300 arttı. Müşteri destek ekibi harika ve panel çok kullanışlı."
                  </p>
                  <p className="font-bold text-gray-900">Ahmet Yılmaz</p>
                  <p className="text-xs text-gray-500">TechStore Kurucusu</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ: Form */}
          <div className="lg:w-1/2 w-full">
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-100 relative overflow-hidden">
              {submitted ? (
                <div className="text-center py-12 animate-in fade-in zoom-in duration-300">
                  <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiCheckCircle className="text-5xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Başvurunuz Alındı!</h3>
                  <p className="text-gray-600 mb-8">
                    Başvurunuz bize ulaştı. Ekibimiz en kısa sürede değerlendirip size geri dönüş yapacaktır.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-primary-600 font-bold hover:underline"
                  >
                    Yeni bir başvuru yap
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Hemen Başvurun</h3>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Ad Soyad</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition"
                          placeholder="Adınız Soyadınız"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Telefon</label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition"
                          placeholder="0555 555 55 55"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">E-posta</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition"
                        placeholder="ornek@sirket.com"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Şirket Adı</label>
                        <input
                          type="text"
                          required
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition"
                          placeholder="Şirketinizin Adı"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Ürün Kategorisi</label>
                        <select
                          required
                          value={formData.productType}
                          onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition appearance-none"
                        >
                          <option value="">Seçiniz</option>
                          <option value="electronics">Elektronik</option>
                          <option value="fashion">Moda & Giyim</option>
                          <option value="home">Ev & Yaşam</option>
                          <option value="sports">Spor & Outdoor</option>
                          <option value="beauty">Kozmetik & Bakım</option>
                          <option value="books">Kitap & Hobi</option>
                          <option value="other">Diğer</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Mesajınız (Opsiyonel)</label>
                      <textarea
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition resize-none"
                        placeholder="Eklemek istedikleriniz..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-700 transition shadow-lg hover:shadow-primary-500/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Gönderiliyor...
                        </>
                      ) : (
                        <>
                          Başvuruyu Tamamla
                          <FiArrowRight />
                        </>
                      )}
                    </button>

                    <p className="text-xs text-center text-gray-500 mt-4">
                      Başvurarak <Link href="/terms" className="underline hover:text-primary-600">Satıcı Sözleşmesi</Link>'ni kabul etmiş olursunuz.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

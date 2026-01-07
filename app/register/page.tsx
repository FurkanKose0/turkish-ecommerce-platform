'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiX } from 'react-icons/fi'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    gender: '',
    marketingConsent: false,
    communicationConsent: false,
    disclosureText: false,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [openModal, setOpenModal] = useState<'kvkk' | 'gizlilik' | 'kullanim' | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validasyon
    if (formData.password.length < 10) {
      setError('Şifre en az 10 karakter olmalıdır')
      return
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      setError('Şifre 1 büyük harf, 1 küçük harf ve rakam içermelidir')
      return
    }

    if (!formData.disclosureText) {
      setError('Aydınlatma Metni\'ni kabul etmelisiniz')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.error || 'Kayıt başarısız'
        const details = data.details ? ` (${data.details})` : ''
        setError(errorMessage + details)
        if (data.details) {
          console.error('Kayıt hatası detayları:', data.details)
        }
        return
      }

      // Başarılı kayıt - giriş sayfasına yönlendir
      router.push('/login?registered=true')
    } catch (err: any) {
      console.error('Kayıt hatası:', err)
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  // Modal Component
  const Modal = ({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) => {
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              aria-label="Kapat"
            >
              <FiX className="text-xl text-gray-600" />
            </button>
          </div>
          <div className="p-6 space-y-6 text-sm text-gray-700 overflow-y-auto flex-1">
            {children}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
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
              className="flex-1 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold text-center hover:border-primary-600 hover:text-primary-600 transition"
            >
              Giriş Yap
            </Link>
            <Link
              href="/register"
              className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold text-center hover:bg-primary-700 transition"
            >
              Üye Ol
            </Link>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Ad */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                Ad
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="Adınız"
              />
            </div>

            {/* Soyad */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Soyad
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="Soyadınız"
              />
            </div>

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

            {/* Telefon */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Telefon (Opsiyonel)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="0555 123 45 67"
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
              <p className="mt-2 text-xs text-gray-500">
                Şifreniz en az 10 karakter olmalı, 1 büyük harf, 1 küçük harf ve rakam içermelidir.
              </p>
            </div>

            {/* Cinsiyet Seçimi */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">
                Sana özel ürünler sunabilmek için görmek istediğin ürün grubunu seçer misin?
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, gender: 'male' }))
                  }}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 border-2 ${
                    formData.gender === 'male'
                      ? 'border-primary-600 bg-primary-600 text-white shadow-md'
                      : 'border-gray-300 text-gray-700 bg-white hover:border-primary-600'
                  }`}
                >
                  Erkek
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, gender: 'female' }))
                  }}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 border-2 ${
                    formData.gender === 'female'
                      ? 'border-primary-600 bg-primary-600 text-white shadow-md'
                      : 'border-gray-300 text-gray-700 bg-white hover:border-primary-600'
                  }`}
                >
                  Kadın
                </button>
              </div>
            </div>

            {/* Pazarlama İzni */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="marketingConsent"
                checked={formData.marketingConsent}
                onChange={(e) => setFormData({ ...formData, marketingConsent: e.target.checked })}
                className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="marketingConsent" className="text-sm text-gray-700">
                <span className="font-medium">Pazarlama İzni</span>
                <p className="text-xs text-gray-500 mt-1">
                  6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verilerimin 
                  pazarlama faaliyetleri kapsamında işlenmesine, özel avantajlı teklifler ve indirimler 
                  sunulabilmesi için kullanılmasına, analiz edilmesine ve bu amaçla iş ortaklarımızla 
                  paylaşılmasına açık rıza gösteriyorum.
                </p>
              </label>
            </div>

            {/* İletişim İzni */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="communicationConsent"
                checked={formData.communicationConsent}
                onChange={(e) => setFormData({ ...formData, communicationConsent: e.target.checked })}
                className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="communicationConsent" className="text-sm text-gray-700">
                <span className="font-medium">İletişim İzni</span>
                <p className="text-xs text-gray-500 mt-1">
                  Kampanyalar, indirimler, yeni ürünler ve özel fırsatlar hakkında bilgilendirilmek 
                  için e-posta adresime ve cep telefonuma SMS, e-posta ve diğer elektronik iletişim 
                  araçları ile ticari elektronik ileti gönderilmesine izin veriyorum. Bu izni istediğim 
                  zaman geri çekebilirim.
                </p>
              </label>
            </div>

            {/* Aydınlatma Metni */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="disclosureText"
                required
                checked={formData.disclosureText}
                onChange={(e) => setFormData({ ...formData, disclosureText: e.target.checked })}
                className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="disclosureText" className="text-sm text-gray-700">
                <span className="font-medium">Aydınlatma Metni</span>
                <p className="text-xs text-gray-500 mt-1">
                  6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında hazırlanan 
                  <button
                    type="button"
                    onClick={() => setOpenModal('kvkk')}
                    className="text-primary-600 hover:underline mx-1"
                  >
                    Aydınlatma Metni
                  </button>
                  'ni okudum, anladım ve kişisel verilerimin yukarıda belirtilen amaçlarla işlenmesine, 
                  saklanmasına, aktarılmasına ve sınıflandırılmasına onay veriyorum. Ayrıca 
                  <button
                    type="button"
                    onClick={() => setOpenModal('gizlilik')}
                    className="text-primary-600 hover:underline mx-1"
                  >
                    Gizlilik Politikası
                  </button>
                  ve 
                  <button
                    type="button"
                    onClick={() => setOpenModal('kullanim')}
                    className="text-primary-600 hover:underline mx-1"
                  >
                    Kullanım Koşulları
                  </button>
                  'nı kabul ediyorum.
                </p>
              </label>
            </div>

            {/* Üye Ol Butonu */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Kayıt yapılıyor...' : 'Üye Ol'}
            </button>
          </form>
        </div>
      </div>

      {/* KVKK Modal */}
      {openModal === 'kvkk' && (
        <Modal title="Kişisel Verilerin Korunması Aydınlatma Metni" onClose={() => setOpenModal(null)}>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">1. Veri Sorumlusu</h3>
            <p>
              sKorry E-Ticaret Platformu ("Şirket" veya "Biz") olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu 
              ("KVKK") uyarınca, kişisel verilerinizin işlenmesi ve korunması konularında sizleri bilgilendirmek isteriz.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">2. Kişisel Verilerin İşlenme Amaçları</h3>
            <p className="mb-2">Toplanan kişisel verileriniz, aşağıdaki amaçlarla işlenmektedir:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>E-ticaret hizmetlerimizden yararlanmanız için gerekli işlemlerin gerçekleştirilmesi</li>
              <li>Siparişlerinizin işlenmesi, teslimatı ve faturalandırılması</li>
              <li>Müşteri hizmetleri ve destek hizmetlerinin sunulması</li>
              <li>Hizmetlerimizin geliştirilmesi ve iyileştirilmesi</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
              <li>Pazarlama ve tanıtım faaliyetlerinin yürütülmesi (izin verilmesi halinde)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">3. Kişisel Verilerin Aktarılması</h3>
            <p>
              Kişisel verileriniz, yukarıda belirtilen amaçlar doğrultusunda, yasal düzenlemelere uygun olarak 
              yetkili kamu kurum ve kuruluşlarına, kargo firmalarına, ödeme hizmet sağlayıcılarına, iş ortaklarımıza 
              ve hizmet aldığımız üçüncü taraflara aktarılabilir.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">4. Kişisel Verilerin Toplanma Yöntemi ve Hukuki Sebebi</h3>
            <p>
              Kişisel verileriniz, web sitemiz ve mobil uygulamamız üzerinden elektronik ortamda toplanmakta olup, 
              KVKK'nın 5. ve 6. maddelerinde belirtilen hukuki sebeplere dayanarak işlenmektedir.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">5. Haklarınız</h3>
            <p className="mb-2">KVKK kapsamında, kişisel verilerinizle ilgili olarak aşağıdaki haklara sahipsiniz:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>İşlenmişse buna ilişkin bilgi talep etme</li>
              <li>İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
              <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
              <li>Silinmesini veya yok edilmesini isteme</li>
              <li>İşlenen verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
              <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
              <li>Kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">6. İletişim</h3>
            <p>
              KVKK kapsamındaki haklarınızı kullanmak için <strong>kvkk@skorry.com</strong> adresine e-posta gönderebilir 
              veya yazılı olarak başvuruda bulunabilirsiniz.
            </p>
          </div>
        </Modal>
      )}

      {/* Gizlilik Politikası Modal */}
      {openModal === 'gizlilik' && (
        <Modal title="Gizlilik Politikası" onClose={() => setOpenModal(null)}>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">1. Gizlilik Politikamız</h3>
            <p>
              sKorry olarak, kullanıcılarımızın gizliliğine önem veriyoruz. Bu Gizlilik Politikası, 
              kişisel bilgilerinizin nasıl toplandığını, kullanıldığını, korunduğunu ve paylaşıldığını açıklar.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">2. Toplanan Bilgiler</h3>
            <p className="mb-2">Hizmetlerimizi sunabilmek için aşağıdaki bilgileri topluyoruz:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Ad, soyad, e-posta adresi, telefon numarası</li>
              <li>Fatura ve teslimat adresi bilgileri</li>
              <li>Ödeme bilgileri (güvenli ödeme sağlayıcıları üzerinden)</li>
              <li>Sipariş geçmişi ve tercihleriniz</li>
              <li>Web sitesi kullanım verileri ve çerezler</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">3. Bilgilerin Kullanımı</h3>
            <p className="mb-2">Toplanan bilgileriniz aşağıdaki amaçlarla kullanılmaktadır:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Siparişlerinizin işlenmesi ve teslimatı</li>
              <li>Müşteri hizmetleri desteği</li>
              <li>Hesap yönetimi ve güvenlik</li>
              <li>Ürün önerileri ve kişiselleştirilmiş deneyim</li>
              <li>Pazarlama ve promosyon faaliyetleri (izin verilmesi halinde)</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">4. Bilgilerin Paylaşılması</h3>
            <p>
              Kişisel bilgileriniz, yalnızca hizmetlerimizi sunmak için gerekli olduğunda ve yasal zorunluluklar 
              çerçevesinde güvenilir üçüncü taraflarla paylaşılır. Kargo firmaları, ödeme işlemcileri ve teknik 
              hizmet sağlayıcıları bu kapsamdadır.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">5. Veri Güvenliği</h3>
            <p>
              Bilgilerinizin güvenliğini sağlamak için endüstri standardı güvenlik önlemleri kullanıyoruz. 
              SSL şifreleme, güvenli ödeme sistemleri ve düzenli güvenlik denetimleri uygulanmaktadır.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">6. Çerezler</h3>
            <p>
              Web sitemiz, kullanıcı deneyimini iyileştirmek için çerezler kullanmaktadır. Çerez tercihlerinizi 
              tarayıcı ayarlarınızdan yönetebilirsiniz.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">7. Değişiklikler</h3>
            <p>
              Bu Gizlilik Politikası zaman zaman güncellenebilir. Önemli değişiklikler e-posta veya site bildirimi 
              ile duyurulacaktır.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">8. İletişim</h3>
            <p>
              Gizlilik ile ilgili sorularınız için <strong>gizlilik@skorry.com</strong> adresine ulaşabilirsiniz.
            </p>
          </div>
        </Modal>
      )}

      {/* Kullanım Koşulları Modal */}
      {openModal === 'kullanim' && (
        <Modal title="Kullanım Koşulları" onClose={() => setOpenModal(null)}>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">1. Genel Hükümler</h3>
            <p>
              Bu Kullanım Koşulları, sKorry E-Ticaret Platformu'nu ("Platform") kullanımınızı düzenler. 
              Platformu kullanarak bu koşulları kabul etmiş sayılırsınız.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">2. Hesap Oluşturma</h3>
            <p className="mb-2">Platformu kullanmak için:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>18 yaşını tamamlamış olmalısınız</li>
              <li>Doğru ve güncel bilgiler sağlamalısınız</li>
              <li>Hesap bilgilerinizin güvenliğinden sorumlusunuz</li>
              <li>Hesabınızı başkalarıyla paylaşmamalısınız</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">3. Sipariş ve Ödeme</h3>
            <p className="mb-2">Sipariş verme süreci:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Tüm fiyatlar KDV dahildir</li>
              <li>Ödeme onaylandıktan sonra sipariş işleme alınır</li>
              <li>Stok durumuna göre sipariş iptal edilebilir</li>
              <li>Fiyat hatalarından platform sorumlu değildir</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">4. Teslimat ve İade</h3>
            <p className="mb-2">Teslimat ve iade koşulları:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Teslimat süreleri ürün sayfasında belirtilmiştir</li>
              <li>14 gün içinde cayma hakkınız bulunmaktadır</li>
              <li>Ürünler orijinal ambalajında ve kullanılmamış olmalıdır</li>
              <li>İade kargo ücreti müşteriye aittir</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">5. Fikri Mülkiyet</h3>
            <p>
              Platformdaki tüm içerikler (metin, görsel, logo vb.) sKorry'ye aittir ve telif hakkı koruması altındadır. 
              İzinsiz kullanım yasaktır.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">6. Sorumluluk Sınırlaması</h3>
            <p>
              Platform, teknik hatalardan, gecikmelerden veya kesintilerden sorumlu tutulamaz. Kullanıcılar, 
              platformu kendi riskleri altında kullanırlar.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">7. Hesap İptali</h3>
            <p>
              Platform, kullanım koşullarını ihlal eden hesapları uyarı vermeksizin askıya alabilir veya iptal edebilir.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">8. Değişiklikler</h3>
            <p>
              Bu Kullanım Koşulları zaman zaman güncellenebilir. Güncellemeler platform üzerinden duyurulacaktır.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">9. Uygulanacak Hukuk</h3>
            <p>
              Bu koşullar Türkiye Cumhuriyeti yasalarına tabidir. Uyuşmazlıklar İstanbul Mahkemeleri'nde çözülecektir.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">10. İletişim</h3>
            <p>
              Sorularınız için <strong>destek@skorry.com</strong> adresine ulaşabilirsiniz.
            </p>
          </div>
        </Modal>
      )}
    </>
  )
}

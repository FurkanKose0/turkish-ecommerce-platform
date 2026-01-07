'use client'

import { useState } from 'react'
import { FiGift, FiCreditCard, FiMail, FiCheck, FiDownload, FiX } from 'react-icons/fi'

export default function GiftCardPage() {
  const [selectedAmount, setSelectedAmount] = useState<number>(100)
  const [recipientEmail, setRecipientEmail] = useState('')
  const [senderName, setSenderName] = useState('')
  const [message, setMessage] = useState('')
  const [isPurchased, setIsPurchased] = useState(false)
  
  // Hediye kartı yükleme state'leri
  const [activeTab, setActiveTab] = useState<'buy' | 'load'>('buy')
  const [giftCardCode, setGiftCardCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadResult, setLoadResult] = useState<{ success: boolean; message: string; balance?: number } | null>(null)

  const amounts = [50, 100, 200, 500, 1000]

  const handlePurchase = (e: React.FormEvent) => {
    e.preventDefault()
    // Satın alma işlemi
    setIsPurchased(true)
    setTimeout(() => {
      setIsPurchased(false)
      setRecipientEmail('')
      setSenderName('')
      setMessage('')
    }, 3000)
  }

  const handleLoadGiftCard = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoadResult(null)

    // Simüle edilmiş API çağrısı
    setTimeout(() => {
      if (giftCardCode.length === 16 && /^\d+$/.test(giftCardCode)) {
        // Başarılı yükleme
        setLoadResult({
          success: true,
          message: 'Hediye kartı başarıyla yüklendi!',
          balance: 250, // Örnek bakiye
        })
        setGiftCardCode('')
      } else {
        // Hata
        setLoadResult({
          success: false,
          message: 'Geçersiz hediye kartı kodu. Lütfen kontrol edin.',
        })
      }
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Başlık */}
        <div className="text-center mb-12">
          <div className="inline-block bg-primary-100 p-4 rounded-full mb-4">
            <FiGift className="text-4xl text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Hediye Kartı</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sevdiklerine özel bir hediye gönder veya hediye kartını yükle
          </p>
        </div>

        {/* Tab Seçimi */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white rounded-lg p-1 inline-flex shadow-md">
            <button
              onClick={() => {
                setActiveTab('buy')
                setLoadResult(null)
              }}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                activeTab === 'buy'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Hediye Kartı Satın Al
            </button>
            <button
              onClick={() => {
                setActiveTab('load')
                setIsPurchased(false)
              }}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                activeTab === 'load'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Hediye Kartı Yükle
            </button>
          </div>
        </div>

        {/* Hediye Kartı Satın Al */}
        {activeTab === 'buy' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              {/* Tutar Seçimi */}
              <div className="p-8 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Tutar Seç</h2>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {amounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setSelectedAmount(amount)}
                      className={`p-4 rounded-lg border-2 font-semibold transition ${
                        selectedAmount === amount
                          ? 'border-primary-600 bg-primary-50 text-primary-600'
                          : 'border-gray-300 text-gray-700 hover:border-primary-300'
                      }`}
                    >
                      {amount}₺
                    </button>
                  ))}
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Özel Tutar
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="5000"
                    placeholder="50-5000 arası"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    onChange={(e) => {
                      const value = parseInt(e.target.value)
                      if (value >= 50 && value <= 5000) {
                        setSelectedAmount(value)
                      }
                    }}
                  />
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handlePurchase} className="p-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiMail className="inline mr-2" />
                      Alıcı E-posta Adresi
                    </label>
                    <input
                      type="email"
                      required
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="ornek@email.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gönderen Adı
                    </label>
                    <input
                      type="text"
                      required
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Adın"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mesaj (Opsiyonel)
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Özel mesajını yaz..."
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  {/* Özet */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700">Hediye Kartı Tutarı</span>
                      <span className="text-xl font-bold text-gray-900">{selectedAmount}₺</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>İşlem Ücreti</span>
                      <span>Ücretsiz</span>
                    </div>
                    <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Toplam</span>
                      <span className="text-2xl font-bold text-primary-600">{selectedAmount}₺</span>
                    </div>
                  </div>

                  {/* Satın Al Butonu */}
                  <button
                    type="submit"
                    className="w-full bg-primary-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-primary-700 transition flex items-center justify-center gap-2"
                  >
                    <FiCreditCard />
                    Hediye Kartını Satın Al
                  </button>

                  {isPurchased && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                      <FiCheck className="text-green-600 text-xl" />
                      <div>
                        <p className="font-semibold text-green-900">Hediye kartı gönderildi!</p>
                        <p className="text-sm text-green-700">
                          {recipientEmail} adresine hediye kartı kodu gönderildi.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Bilgilendirme */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-2">Hediye Kartı Hakkında</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Hediye kartı kodu e-posta ile gönderilir</li>
                <li>• 1 yıl geçerlilik süresi vardır</li>
                <li>• Tüm ürünlerde kullanılabilir</li>
                <li>• Kısmi kullanım yapılabilir, kalan tutar hesapta kalır</li>
                <li>• İade edilemez, nakit olarak çekilemez</li>
              </ul>
            </div>
          </div>
        )}

        {/* Hediye Kartı Yükle */}
        {activeTab === 'load' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Hediye Kartı Yükle
              </h2>
              
              <form onSubmit={handleLoadGiftCard} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hediye Kartı Kodu
                  </label>
                  <input
                    type="text"
                    required
                    value={giftCardCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 16)
                      setGiftCardCode(value)
                      setLoadResult(null)
                    }}
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-lg tracking-widest font-mono"
                    maxLength={16}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Hediye kartı kodunu 16 haneli olarak girin
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || giftCardCode.length !== 16}
                  className="w-full bg-primary-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-primary-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Yükleniyor...</span>
                    </>
                  ) : (
                    <>
                      <FiDownload />
                      <span>Hediye Kartını Yükle</span>
                    </>
                  )}
                </button>

                {/* Sonuç Mesajı */}
                {loadResult && (
                  <div
                    className={`rounded-lg p-4 flex items-start gap-3 ${
                      loadResult.success
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    {loadResult.success ? (
                      <FiCheck className="text-green-600 text-xl mt-0.5" />
                    ) : (
                      <FiX className="text-red-600 text-xl mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p
                        className={`font-semibold ${
                          loadResult.success ? 'text-green-900' : 'text-red-900'
                        }`}
                      >
                        {loadResult.message}
                      </p>
                      {loadResult.success && loadResult.balance && (
                        <p className="text-sm text-green-700 mt-1">
                          Hediye kartı bakiyeniz: <strong>{loadResult.balance}₺</strong>
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setLoadResult(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FiX />
                    </button>
                  </div>
                )}
              </form>

              {/* Bilgilendirme */}
              <div className="mt-8 bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Hediye Kartı Nasıl Yüklenir?</h3>
                <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
                  <li>Hediye kartı kodunu e-postanızdan veya fiziksel karttan alın</li>
                  <li>16 haneli kodu yukarıdaki alana girin</li>
                  <li>"Hediye Kartını Yükle" butonuna tıklayın</li>
                  <li>Bakiye hesabınıza otomatik olarak eklenecektir</li>
                </ol>
              </div>

              {/* Sorun mu yaşıyorsunuz? */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 mb-2">Sorun mu yaşıyorsunuz?</p>
                <a
                  href="/contact"
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  Müşteri Hizmetlerine Başvur
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

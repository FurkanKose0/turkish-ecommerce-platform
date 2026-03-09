
import { FiShield, FiLock, FiFileText } from 'react-icons/fi'

export const metadata = {
    title: 'Gizlilik Politikası - sKorry',
    description: 'Verilerinizin güvenliği bizim için önemli. Gizlilik politikamızı inceleyin.',
}

export default function PrivacyPage() {
    return (
        <div className="bg-white min-h-screen py-16">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="mb-12">
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 text-3xl mb-6">
                        <FiLock />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-6">Gizlilik Politikası</h1>
                    <p className="text-gray-500 text-lg leading-relaxed">
                        Bu Gizlilik Politikası, sKorry ("biz", "bizim" veya "şirketimiz") tarafından işletilen web sitesini kullanırken toplanan kişisel verilerinizin nasıl işlendiğini, saklandığını ve korunduğunu açıklar.
                    </p>
                </div>

                <div className="prose prose-green max-w-none text-gray-600">
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 text-sm">1</span>
                            Toplanan Veriler
                        </h2>
                        <p className="mb-4">
                            Hizmetlerimizi kullanırken aşağıdaki türde bilgileri toplayabiliriz:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mb-4">
                            <li><strong>Kimlik Bilgileri:</strong> Ad, soyad, kullanıcı adı.</li>
                            <li><strong>İletişim Bilgileri:</strong> E-posta adresi, telefon numarası, adres.</li>
                            <li><strong>İşlem Bilgileri:</strong> Ödeme bilgileri, sipariş geçmişi.</li>
                            <li><strong>Teknik Veriler:</strong> IP adresi, tarayıcı türü, cihaz bilgileri.</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 text-sm">2</span>
                            Verilerin Kullanımı
                        </h2>
                        <p className="mb-4">
                            Topladığımız verileri aşağıdaki amaçlarla kullanıyoruz:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mb-4">
                            <li>Siparişlerinizi işleme almak ve teslim etmek.</li>
                            <li>Müşteri hizmetleri desteği sağlamak.</li>
                            <li>Size özel kampanya ve teklifler sunmak (izniniz dahilinde).</li>
                            <li>Sistem güvenliğini sağlamak ve dolandırıcılığı önlemek.</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 text-sm">3</span>
                            Veri Güvenliği
                        </h2>
                        <p>
                            Verilerinizin güvenliği bizim için en öncelikli konudur. Tüm hassas verileriniz SSL şifreleme teknolojisi ile korunmakta ve güvenli sunucularda saklanmaktadır. Ödeme bilgileriniz sistemlerimizde saklanmaz, doğrudan ödeme kuruluşları aracılığıyla işlenir.
                        </p>
                    </section>
                </div>

                <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-500">
                        Son Güncelleme: 8 Ocak 2026. Bu politika hakkında sorularınız varsa, lütfen <a href="/contact" className="text-green-600 font-semibold hover:underline">iletişim</a> sayfasından bize ulaşın.
                    </p>
                </div>
            </div>
        </div>
    )
}

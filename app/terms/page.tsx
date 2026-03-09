
import { FiAlertCircle, FiCheckSquare } from 'react-icons/fi'

export const metadata = {
    title: 'Kullanım Koşulları - sKorry',
    description: 'sKorry platformu kullanım koşulları ve üyelik sözleşmesi.',
}

export default function TermsPage() {
    return (
        <div className="bg-white min-h-screen py-16">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="mb-12">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 text-3xl mb-6">
                        <FiCheckSquare />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-6">Kullanım Koşulları</h1>
                    <p className="text-gray-500 text-lg leading-relaxed">
                        Lütfen sKorry web sitesini kullanmadan önce bu koşulları dikkatlice okuyun. Siteyi kullanarak bu koşulları kabul etmiş sayılırsınız.
                    </p>
                </div>

                <div className="prose prose-blue max-w-none text-gray-600">
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Genel Hükümler</h2>
                        <p className="mb-4">
                            Bu web sitesi sKorry Ticaret A.Ş. tarafından yönetilmektedir. Site üzerindeki tüm içerik, grafikler, logolar ve yazılımlar şirketimizin mülkiyetindedir veya lisanslı olarak kullanılmaktadır.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Üyelik ve Hesap Güvenliği</h2>
                        <p className="mb-4">
                            Sitemize üye olurken verdiğiniz bilgilerin doğruluğunu taahhüt etmektesiniz. Hesap güvenliğinizden (şifrenizin korunması vb.) siz sorumlusunuz. Hesabınızla yapılan tüm işlemler sizin sorumluluğunuzdadır.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Sipariş ve Teslimat</h2>
                        <p className="mb-4">
                            Sitede yer alan ürünlerin fiyatları ve stok durumları önceden haber verilmeksizin değiştirilebilir. Siparişiniz, ödemeniz onaylandıktan sonra işleme alınır. Teslimat süreleri kargo firmasının yoğunluğuna göre değişebilir.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Telif Hakları</h2>
                        <p className="mb-4">
                            sKorry web sitesindeki hiçbir materyal, önceden yazılı izin alınmaksızın kopyalanamaz, çoğaltılamaz, dağıtılamaz veya başka bir yerde yayınlanamaz.
                        </p>
                    </section>
                </div>

                <div className="mt-8 flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                    <FiAlertCircle className="text-xl flex-shrink-0 mt-0.5" />
                    <p>
                        Bu koşullar zaman zaman güncellenebilir. Değişiklikleri takip etmek kullanıcının sorumluluğundadır. Siteyi kullanmaya devam etmeniz, değişiklikleri kabul ettiğiniz anlamına gelir.
                    </p>
                </div>
            </div>
        </div>
    )
}


import { FiPlus, FiMinus } from 'react-icons/fi'

export const metadata = {
    title: 'Sık Sorulan Sorular - sKorry',
    description: 'Aklınıza takılan soruların cevaplarını burada bulabilirsiniz.',
}

export default function FAQPage() {
    return (
        <div className="bg-gray-50 min-h-screen py-16">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Sık Sorulan Sorular</h1>
                    <p className="text-gray-600">Alışveriş sürecinizle ilgili merak ettiğiniz her şey.</p>
                </div>

                <div className="space-y-4">
                    <FAQItem
                        question="Siparişim ne zaman kargoya verilir?"
                        answer="Siparişleriniz, onaylandıktan sonra genellikle 24 saat içinde kargoya teslim edilmektedir. Kampanya dönemlerinde bu süre 48 saati bulabilir."
                    />
                    <FAQItem
                        question="İade ve değişim şartları nelerdir?"
                        answer="Satın aldığınız ürünü, teslim tarihinden itibaren 14 gün içinde ücretsiz olarak iade edebilirsiniz. Ürünün kullanılmamış ve orijinal ambalajında olması gerekmektedir."
                    />
                    <FAQItem
                        question="Hangi ödeme yöntemlerini kullanabilirim?"
                        answer="Kredi kartı, banka kartı ve havale/EFT yöntemleri ile ödeme yapabilirsiniz. Tüm ödemeleriniz 256-bit SSL sertifikası ile korunmaktadır."
                    />
                    <FAQItem
                        question="Kargo ücreti ne kadar?"
                        answer="150 TL ve üzeri alışverişlerinizde kargo ücretsizdir. Bu tutarın altındaki siparişlerinizde sabit kargo ücreti uygulanmaktadır."
                    />
                    <FAQItem
                        question="Siparişimi iptal edebilir miyim?"
                        answer="Siparişiniz 'Hazırlanıyor' aşamasına geçmeden önce 'Siparişlerim' sayfasından iptal edebilirsiniz. Kargoya verilen siparişler iptal edilemez, iade prosedürü uygulanır."
                    />
                </div>
            </div>
        </div>
    )
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group">
            <details className="group">
                <summary className="flex items-center justify-between cursor-pointer p-6 list-none relative z-10 bg-white">
                    <h3 className="text-lg font-semibold text-gray-800 pr-8">{question}</h3>
                    <span className="text-green-600 transform transition-transform group-open:rotate-45">
                        <FiPlus className="text-2xl" />
                    </span>
                </summary>
                <div className="text-gray-600 px-6 pb-6 pt-0 animate-fade-in">
                    {answer}
                </div>
            </details>
        </div>
    )
}

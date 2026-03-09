
import { FiMapPin, FiPhone, FiMail, FiSend } from 'react-icons/fi'

export const metadata = {
    title: 'İletişim - sKorry',
    description: 'Bizimle iletişime geçin. Sorularınız ve önerileriniz için buradayız.',
}

export default function ContactPage() {
    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header */}
            <div className="bg-green-900 text-white py-16 text-center">
                <h1 className="text-4xl font-bold mb-2">Bize Ulaşın</h1>
                <p className="text-green-100 max-w-xl mx-auto px-4">
                    Sorularınız mı var? Size yardımcı olmaktan mutluluk duyarız. Formu doldurun veya iletişim bilgilerimizden bize ulaşın.
                </p>
            </div>

            <div className="container mx-auto px-4 -mt-8">
                <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">

                    {/* İletişim Bilgileri (Sol Taraf) */}
                    <div className="bg-green-800 text-white p-10 md:w-2/5 flex flex-col justify-between relative overflow-hidden">
                        {/* Dekoratif Daireler */}
                        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-green-700/50 rounded-full blur-3xl"></div>
                        <div className="absolute -top-20 -left-20 w-40 h-40 bg-green-400/20 rounded-full blur-2xl"></div>

                        <div className="relative z-10 space-y-8">
                            <div>
                                <h3 className="text-2xl font-bold mb-6">İletişim Bilgileri</h3>
                                <p className="text-green-100 leading-relaxed mb-8">
                                    Size en kısa sürede dönüş yapmak için sabırsızlanıyoruz. Çalışma saatlerimiz içinde bizi aramaktan çekinmeyin.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <ContactInfoItem
                                    icon={<FiMapPin />}
                                    title="Adres"
                                    content="Maslak Mah. Büyükdere Cad. No: 123, 34398 Sarıyer/İstanbul"
                                />
                                <ContactInfoItem
                                    icon={<FiPhone />}
                                    title="Telefon"
                                    content="0850 123 45 67"
                                />
                                <ContactInfoItem
                                    icon={<FiMail />}
                                    title="E-Posta"
                                    content="destek@skorry.com"
                                />
                            </div>
                        </div>

                        <div className="pt-12 relative z-10">
                            <p className="text-sm text-green-200">
                                Çalışma Saatleri: Hafta içi 09:00 - 18:00
                            </p>
                        </div>
                    </div>

                    {/* İletişim Formu (Sağ Taraf) */}
                    <div className="p-10 md:w-3/5 bg-white">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">Mesaj Gönderin</h3>
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-600">Adınız</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                                        placeholder="Adınız"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-600">Soyadınız</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                                        placeholder="Soyadınız"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-600">E-Posta Adresi</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                                    placeholder="ornek@email.com"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-600">Konu</label>
                                <select className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition bg-white">
                                    <option>Genel Sorular</option>
                                    <option>Sipariş Durumu</option>
                                    <option>İade ve Değişim</option>
                                    <option>Satıcı Başvurusu</option>
                                    <option>Diğer</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-600">Mesajınız</label>
                                <textarea
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition resize-none"
                                    placeholder="Mesajınızı buraya yazın..."
                                ></textarea>
                            </div>

                            <button
                                type="button"
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <FiSend />
                                Mesajı Gönder
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    )
}

function ContactInfoItem({ icon, title, content }: { icon: any, title: string, content: string }) {
    return (
        <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-green-700/50 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                {icon}
            </div>
            <div>
                <p className="text-xs text-green-300 uppercase font-bold tracking-wider mb-1">{title}</p>
                <p className="font-medium text-white">{content}</p>
            </div>
        </div>
    )
}

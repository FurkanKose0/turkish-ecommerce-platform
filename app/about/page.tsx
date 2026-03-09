
import Image from 'next/image'
import { FiTarget, FiAward, FiUsers, FiSmile } from 'react-icons/fi'

export const metadata = {
    title: 'Hakkımızda - sKorry',
    description: 'Türkiye\'nin en güvenilir e-ticaret platformu sKorry hakkında bilgi edinin.',
}

export default function AboutPage() {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-900 via-green-800 to-green-900"></div>
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center mix-blend-overlay"></div>
                <div className="relative container mx-auto px-4 text-center text-white z-10">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Alışverişin Yeni Rengi</h1>
                    <p className="text-xl max-w-2xl mx-auto text-green-100 font-light">
                        Teknolojiyi ve modayı, güvenle kapınıza getiriyoruz. sKorry ile tanışın.
                    </p>
                </div>
            </section>

            {/* Hikayemiz */}
            <section className="py-20 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl group">
                            <Image
                                src="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                alt="Ofis Ortamı"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-green-900/10 group-hover:bg-transparent transition-colors duration-500"></div>
                        </div>
                        <div className="space-y-6">
                            <span className="text-green-600 font-bold uppercase tracking-wider text-sm">Biz Kimiz?</span>
                            <h2 className="text-4xl font-bold text-gray-900 leading-tight">Müşteri Memnuniyeti Odaklı <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-400">Yenilikçi Alışveriş</span></h2>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                2024 yılında kurulan sKorry, alışveriş deneyimini sadece bir işlem olmaktan çıkarıp, keyifli bir yolculuğa dönüştürmeyi hedefliyor. Geniş ürün yelpazemiz, kullanıcı dostu arayüzümüz ve 7/24 müşteri destek hattımızla, her zaman yanınızdayız.
                            </p>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                Sadece ürün satmıyor, güven inşa ediyoruz. Her siparişin arkasında titizlikle çalışan dev bir ekip, her paketin içinde mutluluk var.
                            </p>

                            <div className="grid grid-cols-2 gap-6 pt-4">
                                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                                    <h4 className="font-bold text-2xl text-green-700 mb-1">50K+</h4>
                                    <p className="text-sm text-green-800">Mutlu Müşteri</p>
                                </div>
                                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                                    <h4 className="font-bold text-2xl text-green-700 mb-1">100+</h4>
                                    <p className="text-sm text-green-800">Marka İş Ortağı</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Değerlerimiz */}
            <section className="bg-gray-50 py-20 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">Değerlerimiz</h2>
                        <div className="w-20 h-1 bg-green-500 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <ValueCard
                            icon={<FiTarget className="text-4xl" />}
                            title="Güvenilirlik"
                            desc="Şeffaf politikalarımız ve güvenli ödeme altyapımızla, aklınızda soru işareti bırakmıyoruz."
                        />
                        <ValueCard
                            icon={<FiAward className="text-4xl" />}
                            title="Kalite"
                            desc="Sadece en iyi markalarla çalışıyor, kalite standartlarına uymayan ürünlere yer vermiyoruz."
                        />
                        <ValueCard
                            icon={<FiSmile className="text-4xl" />}
                            title="Mutluluk"
                            desc="Müşteri memnuniyeti bizim için bir istatistik değil, en büyük motivasyon kaynağımızdır."
                        />
                        <ValueCard
                            icon={<FiUsers className="text-4xl" />}
                            title="Topluluk"
                            desc="Müşterilerimizle, satıcılarımızla ve çalışanlarımızla büyük ve güçlü bir aileyiz."
                        />
                    </div>
                </div>
            </section>
        </div>
    )
}

function ValueCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1 group text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-500 leading-relaxed text-sm">
                {desc}
            </p>
        </div>
    )
}

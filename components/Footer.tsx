import Link from 'next/link'
import { FiTruck, FiMail, FiPhone, FiMapPin } from 'react-icons/fi'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <FiTruck className="text-2xl" />
              <span className="text-xl font-bold">E-Ticaret</span>
            </div>
            <p className="text-gray-400">
              Türkiye'nin en güvenilir e-ticaret platformu. Güvenli alışveriş, hızlı teslimat.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/" className="hover:text-white transition">Ana Sayfa</Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition">Ürünler</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition">Hakkımızda</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">İletişim</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Müşteri Hizmetleri</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/orders" className="hover:text-white transition">Siparişlerim</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition">Sık Sorulan Sorular</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">Kullanım Koşulları</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition">Gizlilik Politikası</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">İletişim</h3>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center space-x-2">
                <FiMapPin />
                <span>İstanbul, Türkiye</span>
              </li>
              <li className="flex items-center space-x-2">
                <FiPhone />
                <span>0850 123 45 67</span>
              </li>
              <li className="flex items-center space-x-2">
                <FiMail />
                <span>info@eticaret.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 E-Ticaret. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  )
}

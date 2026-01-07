import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { CartProvider } from '@/hooks/useCart'
import GuestSessionInit from '@/components/GuestSessionInit'

export const metadata: Metadata = {
  title: 'E-Ticaret - Türkiye\'nin Güvenilir E-Ticaret Platformu',
  description: 'Güvenli alışveriş, hızlı teslimat. Binlerce ürün, tek tıkla kapınızda.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className="min-h-screen flex flex-col">
        <CartProvider>
          <GuestSessionInit />
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}

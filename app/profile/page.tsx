'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiPackage,
  FiEdit2,
  FiPlus,
  FiTrash2,
  FiStar,
  FiCheckCircle,
  FiXCircle,
} from 'react-icons/fi'
import AddressForm from '@/components/AddressForm'

interface User {
  userId: number
  email: string
  firstName: string
  lastName: string
  phone?: string
}

interface Membership {
  isActive: boolean
  planType?: 'monthly' | 'yearly'
  expiryDate?: string
}

interface Address {
  address_id: number
  address_line1: string
  address_line2?: string
  city: string
  postal_code: string
  is_default: boolean
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [membership, setMembership] = useState<Membership | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'membership'>('profile')
  const [showAddressForm, setShowAddressForm] = useState(false)

  useEffect(() => {
    fetchUserData()
    fetchAddresses()
    fetchMembership()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else if (response.status === 401) {
        router.push('/login')
      }
    } catch (error) {
      console.error('Kullanıcı bilgileri yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/addresses')
      if (response.ok) {
        const data = await response.json()
        setAddresses(data.addresses || [])
      }
    } catch (error) {
      console.error('Adresler yüklenemedi:', error)
    }
  }

  const fetchMembership = async () => {
    try {
      // Üyelik bilgilerini orders tablosundan kontrol et
      // Üyelik ürünü sipariş edilmişse aktif sayılır
      const response = await fetch('/api/membership')
      if (response.ok) {
        const data = await response.json()
        setMembership(data.membership)
      }
    } catch (error) {
      console.error('Üyelik bilgileri yüklenemedi:', error)
      // Varsayılan olarak üyelik yok
      setMembership({ isActive: false })
    }
  }

  const handleDeleteAddress = async (addressId: number) => {
    if (!confirm('Bu adresi silmek istediğinize emin misiniz?')) {
      return
    }

    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchAddresses()
      } else {
        alert('Adres silinemedi')
      }
    } catch (error) {
      console.error('Adres silme hatası:', error)
      alert('Bir hata oluştu')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <p className="text-center text-gray-600">Yükleniyor...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <p className="text-center text-gray-600">Kullanıcı bilgileri yüklenemedi</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Hesabım</h1>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${activeTab === 'profile'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
          >
            Profil Bilgileri
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${activeTab === 'addresses'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
          >
            Adreslerim
          </button>
          <button
            onClick={() => setActiveTab('membership')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${activeTab === 'membership'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
          >
            Üyelik
          </button>
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FiUser />
            Kişisel Bilgilerim
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ad Soyad
              </label>
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                <FiUser className="text-gray-400" />
                <span className="text-gray-800">
                  {user.firstName} {user.lastName}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-posta
              </label>
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                <FiMail className="text-gray-400" />
                <span className="text-gray-800">{user.email}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon
              </label>
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                <FiPhone className="text-gray-400" />
                <span className="text-gray-800">{user.phone || 'Belirtilmemiş'}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-4">
                Profil bilgilerinizi güncellemek için lütfen müşteri hizmetleri ile iletişime geçin.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Membership Tab */}
      {activeTab === 'membership' && (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FiStar />
            Üyelik Durumum
          </h2>

          {membership?.isActive ? (
            <div className="space-y-4">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <FiCheckCircle className="text-3xl text-green-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-green-800 mb-2">
                      Aktif Premium Üyelik
                    </h3>
                    <div className="space-y-2 text-sm text-green-700">
                      <p>
                        <span className="font-semibold">Plan:</span>{' '}
                        {membership.planType === 'monthly' ? 'Aylık' : 'Yıllık'}
                      </p>
                      {membership.expiryDate && (
                        <p>
                          <span className="font-semibold">Bitiş Tarihi:</span>{' '}
                          {new Date(membership.expiryDate).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Üyelik Avantajları</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <FiCheckCircle className="text-green-600" />
                    <span>Tüm siparişlerde ücretsiz kargo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FiCheckCircle className="text-green-600" />
                    <span>Belirli kategorilerde %10'a varan indirim</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FiCheckCircle className="text-green-600" />
                    <span>7/24 öncelikli müşteri desteği</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FiCheckCircle className="text-green-600" />
                    <span>Doğum gününde özel hediye kuponu</span>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <FiXCircle className="text-3xl text-gray-400 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      Aktif Üyeliğiniz Yok
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Premium üyelik ile tüm avantajlardan yararlanın. Ücretsiz kargo, özel
                      indirimler ve daha fazlası sizi bekliyor!
                    </p>
                    <Link
                      href="/membership"
                      className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
                    >
                      Avantajlı Üyelik Al
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-primary-50 rounded-lg p-4">
                <h4 className="font-semibold text-primary-800 mb-3">Üyelik Avantajları</h4>
                <ul className="space-y-2 text-sm text-primary-700">
                  <li className="flex items-center gap-2">
                    <FiStar className="text-primary-600" />
                    <span>Tüm siparişlerde ücretsiz kargo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FiStar className="text-primary-600" />
                    <span>Belirli kategorilerde %10'a varan indirim</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FiStar className="text-primary-600" />
                    <span>7/24 öncelikli müşteri desteği</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FiStar className="text-primary-600" />
                    <span>Doğum gününde özel hediye kuponu</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Addresses Tab */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FiMapPin />
              Adreslerim
            </h2>
            {!showAddressForm && (
              <button
                onClick={() => setShowAddressForm(true)}
                className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition"
              >
                <FiPlus />
                Yeni Adres Ekle
              </button>
            )}
          </div>

          {showAddressForm ? (
            <AddressForm
              onSuccess={() => {
                setShowAddressForm(false)
                fetchAddresses()
              }}
              onCancel={() => setShowAddressForm(false)}
            />
          ) : addresses.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <FiMapPin className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Henüz adres eklenmemiş
              </h3>
              <p className="text-gray-600 mb-6">
                Sipariş verebilmek için bir teslimat adresi eklemeniz gerekiyor.
              </p>
              <button
                onClick={() => setShowAddressForm(true)}
                className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
              >
                <FiPlus />
                İlk Adresinizi Ekleyin
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addresses.map((address) => (
                <div
                  key={address.address_id}
                  className={`bg-white rounded-lg shadow-md p-6 border-2 ${address.is_default
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200'
                    }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      {address.is_default && (
                        <span className="inline-block bg-primary-600 text-white text-xs px-2 py-1 rounded mb-2">
                          Varsayılan Adres
                        </span>
                      )}
                      <h3 className="font-semibold text-gray-800 mb-2">
                        {address.address_line1}
                      </h3>
                      {address.address_line2 && (
                        <p className="text-gray-600 mb-2">{address.address_line2}</p>
                      )}
                      <p className="text-sm text-gray-600">
                        {address.city} / {address.postal_code}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteAddress(address.address_id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                      title="Adresi Sil"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Links */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Hızlı İşlemler</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/orders"
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition"
          >
            <FiPackage className="text-2xl text-primary-600" />
            <div>
              <h3 className="font-semibold text-gray-800">Siparişlerim</h3>
              <p className="text-sm text-gray-600">Sipariş geçmişinizi görüntüleyin</p>
            </div>
          </Link>
          <button
            onClick={() => {
              setActiveTab('addresses')
              setShowAddressForm(true)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition text-left"
          >
            <FiMapPin className="text-2xl text-primary-600" />
            <div>
              <h3 className="font-semibold text-gray-800">Adres Ekle</h3>
              <p className="text-sm text-gray-600">Yeni teslimat adresi ekleyin</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

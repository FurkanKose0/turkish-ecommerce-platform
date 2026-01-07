'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiCheckCircle, FiCreditCard, FiMapPin, FiShoppingBag, FiArrowLeft, FiPlus, FiUser, FiMail, FiPhone, FiLock } from 'react-icons/fi'
import { iller, type Il } from '@/lib/turkiye-iller-ilceler'
import AddressForm from '@/components/AddressForm'

interface Address {
  address_id: number
  address_line1: string
  address_line2?: string
  city: string
  postal_code: string
  is_default: boolean
}

interface CartItem {
  cart_id: number
  product_id: number
  product_name: string
  price: number
  quantity: number
  image_url?: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showGuestForm, setShowGuestForm] = useState(false)
  const [showRegisterForm, setShowRegisterForm] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)

  // Guest form state
  const [guestForm, setGuestForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    postal_code: '',
  })
  const [ilInput, setIlInput] = useState('')
  const [ilSuggestions, setIlSuggestions] = useState<typeof iller[0][]>([])
  const [showIlSuggestions, setShowIlSuggestions] = useState(false)

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  })

  useEffect(() => {
    checkAuth()
    fetchData()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        setIsLoggedIn(true)
      }
    } catch (error) {
      setIsLoggedIn(false)
    }
  }

  const fetchData = async () => {
    try {
      const [addressesRes, cartRes, authRes] = await Promise.all([
        fetch('/api/addresses'),
        fetch('/api/cart'),
        fetch('/api/auth/me'),
      ])

      const isAuth = authRes.ok
      setIsLoggedIn(isAuth)

      if (isAuth && addressesRes.ok) {
        const addressesData = await addressesRes.json()
        setAddresses(addressesData.addresses || [])
        const defaultAddr = addressesData.addresses?.find((a: Address) => a.is_default)
        if (defaultAddr) {
          setSelectedAddress(defaultAddr.address_id)
        } else if (addressesData.addresses?.length > 0) {
          setSelectedAddress(addressesData.addresses[0].address_id)
        }
      }

      if (cartRes.ok) {
        const cartData = await cartRes.json()
        setCartItems(cartData.items || [])

        if (!cartData.items || cartData.items.length === 0) {
          router.push('/cart')
          return
        }
      }

      if (!isAuth) {
        // Varsayılan olarak misafir formunu göster
        setShowGuestForm(true)
        setShowRegisterForm(false)
      }
    } catch (error) {
      console.error('Veri yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleIlInputChange = (value: string) => {
    setIlInput(value)
    setGuestForm({ ...guestForm, city: '' })

    if (value.length > 0) {
      const filtered = iller.filter(il =>
        il.name.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 10)
      setIlSuggestions(filtered)
      setShowIlSuggestions(true)
    } else {
      setIlSuggestions([])
      setShowIlSuggestions(false)
    }
  }

  const handleIlSelect = (il: typeof iller[number]) => {
    setIlInput(il.name)
    setGuestForm({ ...guestForm, city: il.name })
    setIlSuggestions([])
    setShowIlSuggestions(false)
  }

  const handleGuestOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!guestForm.firstName || !guestForm.lastName || !guestForm.email ||
      !guestForm.address_line1 || !guestForm.city || !guestForm.postal_code) {
      setError('Lütfen tüm zorunlu alanları doldurun')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestOrder: true,
          guestInfo: {
            firstName: guestForm.firstName,
            lastName: guestForm.lastName,
            email: guestForm.email,
            phone: guestForm.phone || null,
            address: {
              address_line1: guestForm.address_line1,
              address_line2: guestForm.address_line2 || null,
              city: guestForm.city,
              postal_code: guestForm.postal_code,
            },
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Sipariş oluşturulamadı')
        setSubmitting(false)
        return
      }

      router.push(`/orders?success=true&orderId=${data.orderId}&guest=true`)
    } catch (error) {
      setError('Bir hata oluştu')
      setSubmitting(false)
    }
  }

  const handleRegisterAndOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!registerForm.email || !registerForm.password || !registerForm.firstName || !registerForm.lastName) {
      setError('Lütfen tüm zorunlu alanları doldurun')
      return
    }

    if (registerForm.password.length < 10) {
      setError('Şifre en az 10 karakter olmalıdır')
      return
    }

    setSubmitting(true)

    try {
      // Önce kayıt ol
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm),
      })

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json()
        setError(errorData.error || 'Kayıt başarısız')
        setSubmitting(false)
        return
      }

      // Giriş yap
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registerForm.email,
          password: registerForm.password,
        }),
      })

      if (!loginResponse.ok) {
        setError('Giriş yapılamadı')
        setSubmitting(false)
        return
      }

      // Adres ekle
      const addressResponse = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address_line1: guestForm.address_line1,
          address_line2: guestForm.address_line2 || null,
          city: guestForm.city,
          postal_code: guestForm.postal_code,
          is_default: true,
        }),
      })

      if (!addressResponse.ok) {
        setError('Adres eklenemedi')
        setSubmitting(false)
        return
      }

      const addressData = await addressResponse.json()

      // Sipariş oluştur
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addressId: addressData.address.address_id }),
      })

      const orderData = await orderResponse.json()

      if (!orderResponse.ok) {
        setError(orderData.error || 'Sipariş oluşturulamadı')
        setSubmitting(false)
        return
      }

      router.push(`/orders?success=true&orderId=${orderData.orderId}`)
    } catch (error) {
      setError('Bir hata oluştu')
      setSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!selectedAddress) {
      setError('Lütfen bir teslimat adresi seçin')
      return
    }

    if (cartItems.length === 0) {
      setError('Sepetiniz boş')
      router.push('/cart')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addressId: selectedAddress }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Sipariş oluşturulamadı')
        setSubmitting(false)
        return
      }

      router.push(`/orders?success=true&orderId=${data.orderId}`)
    } catch (error) {
      setError('Bir hata oluştu')
      setSubmitting(false)
    }
  }

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingThreshold = 399.99
  const shippingCost = 49.90
  const needsShipping = total < shippingThreshold
  const shippingTotal = needsShipping ? total + shippingCost : total

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <p className="text-center text-gray-600">Yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-6">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold mb-4"
        >
          <FiArrowLeft />
          Sepete Dön
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Sipariş Tamamlama</h1>
      </div>

      {!isLoggedIn && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 mb-3">
            Siparişinizi tamamlamak için üye olabilir, giriş yapabilir veya misafir olarak devam edebilirsiniz.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setShowGuestForm(true)
                setShowRegisterForm(false)
              }}
              className={`px-4 py-2 rounded-lg font-medium transition ${showGuestForm
                ? 'bg-primary-600 text-white'
                : 'bg-white text-primary-600 border border-primary-600 hover:bg-primary-50'
                }`}
            >
              Misafir Olarak Devam Et
            </button>
            <button
              onClick={() => {
                setShowRegisterForm(true)
                setShowGuestForm(false)
              }}
              className={`px-4 py-2 rounded-lg font-medium transition ${showRegisterForm
                ? 'bg-primary-600 text-white'
                : 'bg-white text-primary-600 border border-primary-600 hover:bg-primary-50'
                }`}
            >
              Üye Ol ve Sipariş Ver
            </button>
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg font-medium bg-white text-primary-600 border border-primary-600 hover:bg-primary-50 transition"
            >
              Giriş Yap
            </Link>
          </div>
        </div>
      )}

      <form onSubmit={isLoggedIn ? handleSubmit : (showRegisterForm ? handleRegisterAndOrder : handleGuestOrder)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol Kolon - Form */}
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Giriş Yapılmış - Adres Seçimi */}
            {isLoggedIn && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <FiMapPin />
                    Teslimat Adresi
                  </h2>
                  {!showAddressForm && (
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center gap-1"
                    >
                      <FiPlus />
                      Yeni Ekle
                    </button>
                  )}
                </div>

                {showAddressForm ? (
                  <AddressForm
                    onSuccess={() => {
                      setShowAddressForm(false)
                      fetchData()
                    }}
                    onCancel={() => setShowAddressForm(false)}
                  />
                ) : addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">Henüz adres eklenmemiş</p>
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold"
                    >
                      <FiPlus />
                      Adres Ekle
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <label
                        key={address.address_id}
                        className={`block p-4 border-2 rounded-lg cursor-pointer transition ${selectedAddress === address.address_id
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="address"
                            value={address.address_id}
                            checked={selectedAddress === address.address_id}
                            onChange={(e) => setSelectedAddress(Number(e.target.value))}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            {address.is_default && (
                              <span className="inline-block bg-primary-600 text-white text-xs px-2 py-1 rounded mb-2">
                                Varsayılan
                              </span>
                            )}
                            <p className="font-semibold text-gray-800">{address.address_line1}</p>
                            {address.address_line2 && (
                              <p className="text-gray-600">{address.address_line2}</p>
                            )}
                            <p className="text-sm text-gray-600">
                              {address.city} / {address.postal_code}
                            </p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Misafir Formu */}
            {!isLoggedIn && showGuestForm && (
              <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FiUser />
                  Teslimat Bilgileri
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ad <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={guestForm.firstName}
                      onChange={(e) => setGuestForm({ ...guestForm, firstName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Soyad <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={guestForm.lastName}
                      onChange={(e) => setGuestForm({ ...guestForm, lastName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-Posta <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={guestForm.email}
                      onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      value={guestForm.phone}
                      onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adres Satırı 1 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={guestForm.address_line1}
                    onChange={(e) => setGuestForm({ ...guestForm, address_line1: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Mahalle, Sokak, Bina No"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adres Satırı 2
                  </label>
                  <input
                    type="text"
                    value={guestForm.address_line2}
                    onChange={(e) => setGuestForm({ ...guestForm, address_line2: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Daire, Kat, Blok (Opsiyonel)"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      İl <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={ilInput}
                      onChange={(e) => handleIlInputChange(e.target.value)}
                      onFocus={() => {
                        if (ilInput.length > 0) {
                          const filtered = iller.filter(il =>
                            il.name.toLowerCase().includes(ilInput.toLowerCase())
                          ).slice(0, 10)
                          setIlSuggestions(filtered)
                          setShowIlSuggestions(true)
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      placeholder="İl seçiniz"
                    />
                    {showIlSuggestions && ilSuggestions.length > 0 && (
                      <div className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 w-full max-h-60 overflow-y-auto">
                        {ilSuggestions.map((il) => (
                          <button
                            key={il.id}
                            type="button"
                            onClick={() => handleIlSelect(il)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {il.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Posta Kodu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={guestForm.postal_code}
                      onChange={(e) => setGuestForm({ ...guestForm, postal_code: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      placeholder="34000"
                      maxLength={5}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Üye Ol Formu */}
            {!isLoggedIn && showRegisterForm && (
              <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FiLock />
                  Üyelik Bilgileri
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ad <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={registerForm.firstName}
                      onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Soyad <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={registerForm.lastName}
                      onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-Posta <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Şifre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    En az 10 karakter, 1 büyük harf, 1 küçük harf ve rakam içermelidir.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>

                {/* Misafir formundaki adres alanları burada da kullanılacak */}
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Teslimat Adresi</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adres Satırı 1 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={guestForm.address_line1}
                      onChange={(e) => setGuestForm({ ...guestForm, address_line1: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        İl <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={ilInput}
                        onChange={(e) => handleIlInputChange(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      />
                      {showIlSuggestions && ilSuggestions.length > 0 && (
                        <div className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 w-full max-h-60 overflow-y-auto">
                          {ilSuggestions.map((il) => (
                            <button
                              key={il.id}
                              type="button"
                              onClick={() => handleIlSelect(il)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              {il.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Posta Kodu <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={guestForm.postal_code}
                        onChange={(e) => setGuestForm({ ...guestForm, postal_code: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        maxLength={5}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Ödeme Bilgileri */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiCreditCard />
                Ödeme Bilgileri
              </h2>
              <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <FiCreditCard className="text-4xl text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium mb-2">Demo Ödeme Sistemi</p>
                  <p className="text-sm text-gray-500">
                    Bu bir demo uygulamadır. Gerçek ödeme işlemi entegre edilmemiştir.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ Kolon - Sipariş Özeti */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiShoppingBag />
                Sipariş Özeti
              </h2>

              {/* Ürünler */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.cart_id} className="flex items-center gap-3 pb-3 border-b border-gray-200 last:border-0">
                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.product_name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <FiShoppingBag className="text-2xl text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">
                        {item.product_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} x {item.price.toLocaleString('tr-TR')} ₺
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">
                        {(item.price * item.quantity).toLocaleString('tr-TR')} ₺
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Fiyat Özeti */}
              <div className="space-y-3 mb-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Ara Toplam</span>
                  <span>{total.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Kargo</span>
                  {needsShipping ? (
                    <span>{shippingCost.toLocaleString('tr-TR')} ₺</span>
                  ) : (
                    <span className="text-primary-600 font-semibold">Ücretsiz</span>
                  )}
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-800 pt-3 border-t border-gray-200">
                  <span>Toplam</span>
                  <span className="text-primary-600">{shippingTotal.toLocaleString('tr-TR')} ₺</span>
                </div>
              </div>

              {/* Siparişi Tamamla Butonu */}
              <button
                type="submit"
                disabled={submitting || (isLoggedIn && !selectedAddress) || cartItems.length === 0}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>İşleniyor...</span>
                  </>
                ) : (
                  <>
                    <FiCheckCircle />
                    <span>Siparişi Tamamla</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { iller, getIlcelerByIlId, Il, Ilce } from '@/lib/turkiye-iller-ilceler'
import { FiSave, FiX } from 'react-icons/fi'

interface AddressFormProps {
    onSuccess: () => void
    onCancel: () => void
}

export default function AddressForm({ onSuccess, onCancel }: AddressFormProps) {
    const [formData, setFormData] = useState({
        address_line2: '', // Building/Apt details
        postal_code: '',
        is_default: false,
    })

    // Separate states for the composite address parts
    const [selectedCity, setSelectedCity] = useState<Il | null>(null)
    const [districts, setDistricts] = useState<Ilce[]>([])
    const [selectedDistrict, setSelectedDistrict] = useState('')
    const [neighborhood, setNeighborhood] = useState('')
    const [openAddress, setOpenAddress] = useState('') // Street/No details

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // City Autocomplete States
    const [cityInput, setCityInput] = useState('')
    const [citySuggestions, setCitySuggestions] = useState<Il[]>([])
    const [showCitySuggestions, setShowCitySuggestions] = useState(false)

    // Handle City Input Change
    const handleCityInputChange = (value: string) => {
        setCityInput(value)
        setSelectedCity(null)
        setDistricts([])
        setSelectedDistrict('')

        if (value.length > 0) {
            const filtered = iller.filter(il =>
                il.name.toLowerCase().includes(value.toLowerCase())
            )
            setCitySuggestions(filtered)
            setShowCitySuggestions(true)
        } else {
            setCitySuggestions([])
            setShowCitySuggestions(false)
        }
    }

    // Handle City Selection
    const handleCitySelect = (il: Il) => {
        setCityInput(il.name)
        setSelectedCity(il)
        setDistricts(getIlcelerByIlId(il.id))
        setCitySuggestions([])
        setShowCitySuggestions(false)
        setSelectedDistrict('') // Reset district when city changes
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        if (!selectedCity || !selectedDistrict || !neighborhood || !openAddress || !formData.postal_code) {
            setError('Lütfen tüm zorunlu alanları doldurun')
            setLoading(false)
            return
        }

        // Combine District, Neighborhood and Open Address into address_line1
        // Format: [Mahalle] Mah., [Sokak/Cadde...] No:..., [İlçe]
        const finalAddressLine1 = `${neighborhood} Mah. ${openAddress}, ${selectedDistrict}`

        const submitData = {
            ...formData,
            city: selectedCity.name,
            address_line1: finalAddressLine1
        }

        try {
            const response = await fetch('/api/addresses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData),
            })

            if (response.ok) {
                onSuccess()
            } else {
                const data = await response.json()
                setError(data.error || 'Adres eklenemedi')
            }
        } catch (error) {
            console.error('Adres ekleme hatası:', error)
            setError('Bir hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white text-gray-800">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                <h3 className="text-xl font-bold text-gray-800">Yeni Adres Ekle</h3>
                <button
                    onClick={onCancel}
                    className="text-gray-400 hover:text-gray-600 transition"
                >
                    <FiX className="text-2xl" />
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* City and District Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            İl <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={cityInput}
                            onChange={(e) => handleCityInputChange(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition shadow-sm"
                            placeholder="İl seçiniz"
                        />
                        {showCitySuggestions && citySuggestions.length > 0 && (
                            <div className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-xl mt-1 w-full max-h-48 overflow-y-auto">
                                {citySuggestions.map((il) => (
                                    <button
                                        key={il.id}
                                        type="button"
                                        onClick={() => handleCitySelect(il)}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition"
                                    >
                                        {il.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            İlçe <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            disabled={!selectedCity}
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition shadow-sm disabled:bg-gray-50 disabled:text-gray-400"
                        >
                            <option value="">Seçiniz</option>
                            {districts.map((ilce) => (
                                <option key={ilce.id} value={ilce.name}>
                                    {ilce.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Neighborhood Row */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Mahalle <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        required
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition shadow-sm"
                        placeholder="Örn: Cumhuriyet"
                    />
                </div>

                {/* Open Address */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Sokak / Cadde / No <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        required
                        rows={2}
                        value={openAddress}
                        onChange={(e) => setOpenAddress(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition shadow-sm resize-none"
                        placeholder="Örn: Atatürk Cad. Lale Sok. No: 5"
                    />
                </div>

                {/* Address Line 2 & Postal Code */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Bina / Daire Detayı (Opsiyonel)
                        </label>
                        <input
                            type="text"
                            value={formData.address_line2}
                            onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition shadow-sm"
                            placeholder="Örn: Blok A, Kat 3, Daire 12"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Posta Kodu <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.postal_code}
                            onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-800 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition shadow-sm"
                            placeholder="34000"
                            maxLength={5}
                        />
                    </div>
                </div>

                {/* Default Checkbox */}
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="is_default"
                        checked={formData.is_default}
                        onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                    />
                    <label htmlFor="is_default" className="text-sm text-gray-600 cursor-pointer select-none">
                        Bu adresi varsayılan teslimat adresi olarak ayarla
                    </label>
                </div>

                {/* Actions */}
                <div className="flex justify-end pt-6 border-t border-gray-100 gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2 rounded-lg text-gray-600 font-medium hover:bg-gray-100 transition"
                    >
                        Vazgeç
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FiSave />
                        {loading ? 'Kaydediliyor...' : 'Adresi Kaydet'}
                    </button>
                </div>
            </form>
        </div>
    )
}

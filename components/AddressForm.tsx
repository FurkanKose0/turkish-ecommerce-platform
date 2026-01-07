'use client'

import { useState } from 'react'
import { iller } from '@/lib/turkiye-iller-ilceler'
import { FiSave, FiX } from 'react-icons/fi'

interface AddressFormProps {
    onSuccess: () => void
    onCancel: () => void
}

export default function AddressForm({ onSuccess, onCancel }: AddressFormProps) {
    const [formData, setFormData] = useState({
        address_line1: '',
        address_line2: '',
        city: '',
        postal_code: '',
        is_default: false,
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [ilInput, setIlInput] = useState('')
    const [ilSuggestions, setIlSuggestions] = useState<typeof iller[0][]>([])
    const [showIlSuggestions, setShowIlSuggestions] = useState(false)

    const handleIlInputChange = (value: string) => {
        setIlInput(value)
        setFormData({ ...formData, city: '' })

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
        setFormData({ ...formData, city: il.name })
        setIlSuggestions([])
        setShowIlSuggestions(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        if (!formData.address_line1 || !formData.city || !formData.postal_code) {
            setError('Lütfen zorunlu alanları doldurun')
            setLoading(false)
            return
        }

        try {
            const response = await fetch('/api/addresses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
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
        <div className="bg-white border rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Yeni Adres Ekle</h3>
                <button
                    onClick={onCancel}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <FiX className="text-xl" />
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adres Satırı 1 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.address_line1}
                        onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        placeholder="Mahalle, Sokak, Bina No"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adres Satırı 2
                    </label>
                    <input
                        type="text"
                        value={formData.address_line2}
                        onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        placeholder="Daire, Kat, Blok (Opsiyonel)"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            İl <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={ilInput}
                            onChange={(e) => handleIlInputChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                            placeholder="İl seçiniz"
                        />
                        {showIlSuggestions && ilSuggestions.length > 0 && (
                            <div className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 w-full max-h-48 overflow-y-auto">
                                {ilSuggestions.map((il) => (
                                    <button
                                        key={il.id}
                                        type="button"
                                        onClick={() => handleIlSelect(il)}
                                        className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        {il.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Posta Kodu <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.postal_code}
                            onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                            placeholder="34000"
                            maxLength={5}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="is_default"
                        checked={formData.is_default}
                        onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                        className="rounded text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="is_default" className="text-sm text-gray-700 cursor-pointer">
                        Varsayılan adres olarak ayarla
                    </label>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
                    >
                        <FiSave />
                        {loading ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                </div>
            </form>
        </div>
    )
}

'use client'

import { useEffect, useState } from 'react'
import {
    FiMessageSquare,
    FiCheckCircle,
    FiClock,
    FiSend,
    FiUser,
    FiPackage,
    FiX
} from 'react-icons/fi'

interface Question {
    question_id: number
    product_id: number
    product_name: string
    image_url?: string
    question_text: string
    answer_text?: string
    is_answered: boolean
    created_at: string
    customer_first_name: string
    customer_last_name: string
}

export default function SellerQuestionsPage() {
    const [questions, setQuestions] = useState<Question[]>([])
    const [loading, setLoading] = useState(true)
    const [answeringId, setAnsweringId] = useState<number | null>(null)
    const [answerText, setAnswerText] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [filter, setFilter] = useState<'all' | 'unanswered' | 'answered'>('unanswered')

    useEffect(() => {
        fetchQuestions()
    }, [])

    const fetchQuestions = async () => {
        try {
            const response = await fetch('/api/seller/questions')
            if (response.ok) {
                const data = await response.json()
                setQuestions(data.questions || [])
            }
        } catch (error) {
            console.error('Questions fetch error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAnswer = async (questionId: number) => {
        if (!answerText.trim()) return
        setSubmitting(true)

        try {
            const response = await fetch(`/api/seller/questions/${questionId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answerText })
            })

            if (response.ok) {
                setQuestions(questions.map(q =>
                    q.question_id === questionId
                        ? { ...q, is_answered: true, answer_text: answerText }
                        : q
                ))
                setAnsweringId(null)
                setAnswerText('')
            } else {
                alert('Cevap kaydedilemedi.')
            }
        } catch (error) {
            alert('Bir hata oluştu.')
        } finally {
            setSubmitting(false)
        }
    }

    const filteredQuestions = questions.filter(q => {
        if (filter === 'all') return true
        if (filter === 'unanswered') return !q.is_answered
        if (filter === 'answered') return q.is_answered
        return true
    })

    if (loading) {
        return (
            <div className="p-8">
                <p className="text-gray-600">Yükleniyor...</p>
            </div>
        )
    }

    return (
        <div className="p-8 min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Müşteri Soruları</h1>
                        <p className="text-gray-500 mt-1">Ürünleriniz hakkında gelen soruları buradan yanıtlayabilirsiniz.</p>
                    </div>

                    <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
                        <button
                            onClick={() => setFilter('unanswered')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition ${filter === 'unanswered' ? 'bg-primary-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            Bekleyenler
                        </button>
                        <button
                            onClick={() => setFilter('answered')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition ${filter === 'answered' ? 'bg-primary-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            Cevaplananlar
                        </button>
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition ${filter === 'all' ? 'bg-primary-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            Tümü
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {filteredQuestions.length === 0 ? (
                        <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-200">
                            <FiMessageSquare className="text-6xl text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Soru Bulunamadı</h3>
                            <p className="text-gray-500">Bu kategöride henüz bir soru bulunmuyor.</p>
                        </div>
                    ) : (
                        filteredQuestions.map((q) => (
                            <div key={q.question_id} className={`bg-white rounded-3xl overflow-hidden shadow-sm border transition duration-300 ${q.is_answered ? 'border-gray-100' : 'border-primary-200 ring-2 ring-primary-500/5'}`}>
                                <div className="p-6 md:p-8">
                                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0">
                                                {q.image_url ? (
                                                    <img src={q.image_url} alt={q.product_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <FiPackage />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800 line-clamp-1">{q.product_name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                                        <FiUser /> {q.customer_first_name} {q.customer_last_name}
                                                    </span>
                                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                                        <FiClock /> {new Date(q.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${q.is_answered ? 'bg-green-100 text-green-700' : 'bg-primary-100 text-primary-700'}`}>
                                            {q.is_answered ? (
                                                <><FiCheckCircle /> Cevaplandı</>
                                            ) : (
                                                <><FiClock /> Bekliyor</>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-gray-100 text-gray-500 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                                                S
                                            </div>
                                            <div className="bg-gray-50 p-6 rounded-3xl rounded-tl-none flex-1 border border-gray-100">
                                                <p className="text-gray-800 leading-relaxed">{q.question_text}</p>
                                            </div>
                                        </div>

                                        {q.is_answered ? (
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                                                    C
                                                </div>
                                                <div className="bg-green-50/30 p-6 rounded-3xl rounded-tl-none flex-1 border border-green-100">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-extrabold text-green-800 text-xs uppercase tracking-tighter">Cevabınız</span>
                                                        <button
                                                            onClick={() => {
                                                                setAnsweringId(q.question_id)
                                                                setAnswerText(q.answer_text || '')
                                                            }}
                                                            className="text-primary-600 text-xs font-bold hover:underline"
                                                        >
                                                            Düzenle
                                                        </button>
                                                    </div>
                                                    <p className="text-gray-800 leading-relaxed">{q.answer_text}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            answeringId === q.question_id ? (
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                                                        C
                                                    </div>
                                                    <div className="flex-1 space-y-4">
                                                        <textarea
                                                            autoFocus
                                                            rows={4}
                                                            value={answerText}
                                                            onChange={(e) => setAnswerText(e.target.value)}
                                                            className="w-full p-6 bg-white border-2 border-primary-500 rounded-3xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition resize-none text-gray-800 text-sm"
                                                            placeholder="Cevabınızı buraya yazın..."
                                                        ></textarea>
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                onClick={() => handleAnswer(q.question_id)}
                                                                disabled={submitting}
                                                                className="bg-primary-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-primary-700 transition shadow-lg flex items-center gap-2 disabled:opacity-50"
                                                            >
                                                                {submitting ? 'Kaydediliyor...' : <><FiSend /> Gönder</>}
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setAnsweringId(null)
                                                                    setAnswerText('')
                                                                }}
                                                                className="text-gray-400 hover:text-gray-600 p-3"
                                                            >
                                                                <FiX className="text-xl" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="pl-14">
                                                    <button
                                                        onClick={() => setAnsweringId(q.question_id)}
                                                        className="bg-white border-2 border-primary-600 text-primary-600 px-8 py-3 rounded-2xl font-bold hover:bg-primary-50 transition flex items-center gap-2"
                                                    >
                                                        <FiMessageSquare />
                                                        Cevapla
                                                    </button>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

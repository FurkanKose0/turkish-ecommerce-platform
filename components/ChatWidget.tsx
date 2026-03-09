'use client'

import { useState, useRef, useEffect } from 'react'
import { FiMessageSquare, FiX, FiSend, FiUser, FiHeadphones } from 'react-icons/fi'

interface Message {
    id: number
    text: string
    isUser: boolean
    timestamp: Date
}

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: "Merhaba! Size nasıl yardımcı olabilirim?",
            isUser: false,
            timestamp: new Date()
        }
    ])
    const [inputText, setInputText] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isOpen])

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!inputText.trim()) return

        // Add user message
        const newMessage: Message = {
            id: Date.now(),
            text: inputText,
            isUser: true,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, newMessage])
        setInputText('')

        // Simulate response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "Müşteri temsilcimiz şu anda diğer müşterilerle ilgileniyor. Lütfen bekleyiniz...",
                isUser: false,
                timestamp: new Date()
            }])
        }, 1000)
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-[350px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col transition-all duration-300 animate-slide-up origin-bottom-right">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 flex items-center justify-between text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <FiHeadphones className="text-xl" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Canlı Destek</h3>
                                <p className="text-xs text-green-100 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    Çevrimiçi
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-white/10 rounded-full transition"
                        >
                            <FiX />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="h-96 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-4">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-3 max-w-[85%] ${msg.isUser ? 'self-end flex-row-reverse' : 'self-start'}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${msg.isUser ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    {msg.isUser ? <FiUser /> : <FiHeadphones />}
                                </div>
                                <div>
                                    <div className={`p-3 rounded-2xl text-sm shadow-sm ${msg.isUser
                                            ? 'bg-green-600 text-white rounded-br-none'
                                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                        }`}>
                                        {msg.text}
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-1 block px-1">
                                        {msg.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <form onSubmit={handleSend} className="relative">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Mesajınızı yazın..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-full pl-5 pr-12 py-3 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition text-sm text-gray-700"
                            />
                            <button
                                type="submit"
                                disabled={!inputText.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:hover:bg-green-600 transition shadow-sm"
                            >
                                <FiSend className="text-sm" />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white text-2xl transition-all transform hover:scale-105 ${isOpen ? 'bg-red-500 rotate-90' : 'bg-green-600 hover:bg-green-700'
                    }`}
            >
                {isOpen ? <FiX /> : <FiMessageSquare />}
            </button>
        </div>
    )
}

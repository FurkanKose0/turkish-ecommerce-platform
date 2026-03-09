import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-helpers'

export async function POST(
    request: NextRequest,
    { params }: { params: { productId: string } }
) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
        }

        const body = await request.json()
        const discountPercent = Number(body.discountPercent)
        const durationHours = Number(body.durationHours)

        const productId = parseInt(params.productId)

        if (!discountPercent || discountPercent <= 0 || discountPercent > 90) {
            return NextResponse.json({ error: 'Geçersiz indirim oranı (1-90 arası olmalı)' }, { status: 400 })
        }

        // Ürünü satıcıya ait mi diye kontrol et
        const productCheck = await pool.query(
            'SELECT product_id, price FROM products WHERE product_id = $1 AND seller_id = $2',
            [productId, user.userId]
        )

        if (productCheck.rows.length === 0) {
            return NextResponse.json({ error: 'Ürün bulunamadı veya size ait değil' }, { status: 404 })
        }

        // Tarihleri ayarla
        const startDate = new Date()
        const endDate = new Date()
        const hoursToAdd = !isNaN(durationHours) && durationHours > 0 ? durationHours : 24
        endDate.setHours(endDate.getHours() + hoursToAdd)

        // Ürünü güncelle
        await pool.query(
            `UPDATE products 
       SET is_deal_of_day = TRUE,
           deal_discount_percent = $1,
           deal_start_date = $2,
           deal_end_date = $3
       WHERE product_id = $4`,
            [discountPercent, startDate, endDate, productId]
        )

        return NextResponse.json({ message: 'Ürün günün fırsatlarına eklendi' })
    } catch (error: any) {
        console.error('Fırsat ekleme hatası:', error)
        return NextResponse.json({ error: 'İşlem başarısız: ' + (error.message || 'Bilinmeyen hata') }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { productId: string } }
) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
        }

        const productId = parseInt(params.productId)

        // Tarihçesi ve yetki kontrolü ile birlikte fırsatı kaldır
        // Sadece is_deal_of_day'i false yapıyoruz
        const result = await pool.query(
            `UPDATE products 
       SET is_deal_of_day = FALSE,
           deal_discount_percent = 0,
           deal_start_date = NULL,
           deal_end_date = NULL
       WHERE product_id = $1 AND seller_id = $2
       RETURNING product_id`,
            [productId, user.userId]
        )

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Ürün bulunamadı veya fırsat kaldırılamadı' }, { status: 404 })
        }

        return NextResponse.json({ message: 'Ürün fırsatlardan kaldırıldı' })
    } catch (error: any) {
        console.error('Fırsat kaldırma hatası:', error)
        return NextResponse.json({ error: 'İşlem başarısız' }, { status: 500 })
    }
}

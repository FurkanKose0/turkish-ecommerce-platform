import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-helpers'

export async function GET() {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
        }

        // Satıcının aktif fırsatlarını getir
        const deals = await pool.query(
            `SELECT 
        p.product_id,
        p.product_name,
        p.price,
        p.image_url,
        p.deal_discount_percent,
        p.deal_start_date,
        p.deal_end_date,
        p.is_active
       FROM products p
       WHERE p.seller_id = $1 
         AND p.is_deal_of_day = TRUE 
       ORDER BY p.deal_end_date DESC`,
            [user.userId]
        )

        return NextResponse.json({ deals: deals.rows })
    } catch (error: any) {
        console.error('Fırsatları getirme hatası:', error)
        return NextResponse.json({ error: 'Fırsatlar yüklenemedi' }, { status: 500 })
    }
}

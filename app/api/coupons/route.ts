import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-helpers'

export async function GET() {
    try {
        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json({ error: 'Giriş yapmanız gerekiyor' }, { status: 401 })
        }

        // Kullanıcının kuponlarını ve genel aktif kuponları getir
        // Not: Gerçek bir sistemde kullanıcıya atanmış kuponlar olur, 
        // şimdilik tüm aktif kuponları gösterelim ama kullanıcıya özel olanları işaretleyelim.
        const query = `
      SELECT 
        c.coupon_id,
        c.code,
        c.discount_value,
        c.discount_type,
        c.min_purchase,
        c.expiry_date,
        c.is_active,
        (uc.user_id IS NOT NULL) as is_assigned,
        uc.is_used
      FROM coupons c
      LEFT JOIN user_coupons uc ON c.coupon_id = uc.coupon_id AND uc.user_id = $1
      WHERE c.is_active = TRUE AND c.expiry_date > CURRENT_TIMESTAMP
    `

        const result = await pool.query(query, [user.userId])

        return NextResponse.json({ coupons: result.rows })
    } catch (error: any) {
        console.error('Kuponlar hatası:', error)
        return NextResponse.json({ error: 'Kuponlar yüklenemedi' }, { status: 500 })
    }
}

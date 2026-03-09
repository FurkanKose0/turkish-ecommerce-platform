import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// Ürünün aktif kampanyalarını getir
export async function GET(
    request: NextRequest,
    { params }: { params: { productId: string } }
) {
    try {
        const result = await pool.query(
            `SELECT 
                c.campaign_id,
                c.campaign_name,
                c.description,
                c.discount_type,
                c.discount_value,
                c.min_order_amount,
                c.max_discount_amount,
                c.end_date,
                u.first_name as seller_first_name,
                u.last_name as seller_last_name
            FROM campaigns c
            JOIN campaign_products cp ON c.campaign_id = cp.campaign_id
            JOIN users u ON c.seller_id = u.user_id
            WHERE cp.product_id = $1
              AND c.is_active = TRUE
              AND c.start_date <= NOW()
              AND c.end_date >= NOW()
            ORDER BY c.discount_value DESC`,
            [params.productId]
        )

        return NextResponse.json({ campaigns: result.rows })
    } catch (error: any) {
        console.error('Product campaigns fetch error:', error)
        return NextResponse.json({ error: 'Kampanyalar yüklenemedi' }, { status: 500 })
    }
}

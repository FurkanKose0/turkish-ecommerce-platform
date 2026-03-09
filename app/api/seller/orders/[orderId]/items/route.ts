import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-helpers'

export async function GET(
    request: NextRequest,
    { params }: { params: { orderId: string } }
) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const orderId = parseInt(params.orderId)

        const query = `
            SELECT 
                oi.order_item_id,
                oi.quantity,
                oi.unit_price,
                oi.subtotal,
                oi.selected_size,
                p.product_name,
                p.image_url,
                p.sku
            FROM order_items oi
            JOIN products p ON oi.product_id = p.product_id
            WHERE oi.order_id = $1 AND p.seller_id = $2
        `

        const result = await pool.query(query, [orderId, user.userId])

        return NextResponse.json({ items: result.rows })
    } catch (error) {
        console.error('Seller order details error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

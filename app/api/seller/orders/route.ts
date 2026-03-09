import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const query = `
            SELECT DISTINCT 
                o.order_id, 
                o.order_date, 
                o.status_id, 
                os.status_name,
                o.guest_first_name, o.guest_last_name, 
                u.first_name, u.last_name,
                (
                    SELECT SUM(oi2.unit_price * oi2.quantity) 
                    FROM order_items oi2 
                    JOIN products p2 ON oi2.product_id = p2.product_id 
                    WHERE oi2.order_id = o.order_id AND p2.seller_id = $1
                ) as seller_total,
                (
                    SELECT COUNT(*)
                    FROM order_items oi3
                    JOIN products p3 ON oi3.product_id = p3.product_id
                    WHERE oi3.order_id = o.order_id AND p3.seller_id = $1
                ) as item_count
            FROM orders o
            JOIN order_items oi ON o.order_id = oi.order_id
            JOIN products p ON oi.product_id = p.product_id
            JOIN order_status os ON o.status_id = os.status_id
            LEFT JOIN users u ON o.user_id = u.user_id
            WHERE p.seller_id = $1
            ORDER BY o.order_date DESC
        `

        const result = await pool.query(query, [user.userId])

        return NextResponse.json({ orders: result.rows })
    } catch (error) {
        console.error('Seller orders error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

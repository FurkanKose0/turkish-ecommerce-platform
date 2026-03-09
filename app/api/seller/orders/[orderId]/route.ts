import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-helpers'

export async function PUT(
    request: Request,
    { params }: { params: { orderId: string } }
) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { status_id, cancellation_reason, tracking_number, cargo_company } = await request.json()
        const orderId = params.orderId

        // Verify that this seller has items in this order
        const checkQuery = `
            SELECT 1 
            FROM order_items oi
            JOIN products p ON oi.product_id = p.product_id
            WHERE oi.order_id = $1 AND p.seller_id = $2
        `
        const checkResult = await pool.query(checkQuery, [orderId, user.userId])

        if (checkResult.rows.length === 0) {
            return NextResponse.json({ error: 'Order not found or access denied' }, { status: 403 })
        }

        // Update status and related fields based on new status
        const client = await pool.connect()
        try {
            if (status_id === 5) { // Cancelled
                await client.query(
                    'UPDATE orders SET status_id = $1, cancellation_reason = $2 WHERE order_id = $3',
                    [status_id, cancellation_reason, orderId]
                )
            } else if (status_id === 3) { // Shipped
                await client.query(
                    'UPDATE orders SET status_id = $1, tracking_number = $2, cargo_company = $3, shipped_date = CURRENT_TIMESTAMP WHERE order_id = $4',
                    [status_id, tracking_number, cargo_company, orderId]
                )
            } else if (status_id === 4) { // Delivered
                await client.query(
                    'UPDATE orders SET status_id = $1, delivered_date = CURRENT_TIMESTAMP WHERE order_id = $2',
                    [status_id, orderId]
                )
            } else {
                await client.query(
                    'UPDATE orders SET status_id = $1 WHERE order_id = $2',
                    [status_id, orderId]
                )
            }
        } finally {
            client.release()
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Update order status error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

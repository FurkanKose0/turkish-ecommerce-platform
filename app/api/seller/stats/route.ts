import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-helpers'

export async function GET() {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const client = await pool.connect()
        try {
            // Total Sales (excluding cancelled)
            const salesQuery = `
                SELECT COALESCE(SUM(oi.unit_price * oi.quantity), 0) as total_sales
                FROM order_items oi
                JOIN products p ON oi.product_id = p.product_id
                JOIN orders o ON oi.order_id = o.order_id
                WHERE p.seller_id = $1 AND o.status_id != 5
            `
            const salesResult = await client.query(salesQuery, [user.userId])
            const totalSales = parseFloat(salesResult.rows[0].total_sales)

            // Total Orders
            const ordersQuery = `
                SELECT COUNT(DISTINCT o.order_id) as total_orders
                FROM orders o
                JOIN order_items oi ON o.order_id = oi.order_id
                JOIN products p ON oi.product_id = p.product_id
                WHERE p.seller_id = $1
            `
            const ordersResult = await client.query(ordersQuery, [user.userId])
            const totalOrders = parseInt(ordersResult.rows[0].total_orders)

            // Active Products
            const productsQuery = `
                SELECT COUNT(*) as active_products
                FROM products
                WHERE seller_id = $1 AND is_active = true
            `
            const productsResult = await client.query(productsQuery, [user.userId])
            const activeProducts = parseInt(productsResult.rows[0].active_products)

            // Previous Month Sales (for trend)
            const prevMonthQuery = `
                SELECT COALESCE(SUM(oi.unit_price * oi.quantity), 0) as prev_month_sales
                FROM order_items oi
                JOIN products p ON oi.product_id = p.product_id
                JOIN orders o ON oi.order_id = o.order_id
                WHERE p.seller_id = $1 AND o.status_id != 5
                AND o.order_date >= date_trunc('month', current_date - interval '1 month')
                AND o.order_date < date_trunc('month', current_date)
            `
            const prevMonthResult = await client.query(prevMonthQuery, [user.userId])
            const prevMonthSales = parseFloat(prevMonthResult.rows[0].prev_month_sales)

            // Calculate trend
            let trend = 0
            if (prevMonthSales > 0) {
                trend = ((totalSales - prevMonthSales) / prevMonthSales) * 100
            }

            return NextResponse.json({
                total_sales: totalSales,
                total_orders: totalOrders,
                active_products: activeProducts,
                sales_trend: trend.toFixed(1)
            })
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Stats error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

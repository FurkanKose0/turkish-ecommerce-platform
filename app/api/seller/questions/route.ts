import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-helpers'

// Satıcıya sorulan soruları getir
export async function GET() {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const query = `
            SELECT 
                q.*, 
                p.product_name, 
                p.image_url,
                u.first_name as customer_first_name,
                u.last_name as customer_last_name
            FROM product_questions q
            JOIN products p ON q.product_id = p.product_id
            JOIN users u ON q.user_id = u.user_id
            WHERE p.seller_id = $1
            ORDER BY q.created_at DESC
        `
        const result = await pool.query(query, [user.userId])
        return NextResponse.json({ questions: result.rows })
    } catch (error) {
        console.error('Seller questions fetch error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

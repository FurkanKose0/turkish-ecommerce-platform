import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-helpers'

// Kullanıcının sorduğu soruları getir (Müşteri için)
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
                u.first_name as seller_first_name,
                u.last_name as seller_last_name
            FROM product_questions q
            JOIN products p ON q.product_id = p.product_id
            JOIN users u ON p.seller_id = u.user_id
            WHERE q.user_id = $1
            ORDER BY q.created_at DESC
        `
        const result = await pool.query(query, [user.userId])
        return NextResponse.json({ questions: result.rows })
    } catch (error) {
        console.error('Questions fetch error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// Soru sor (Müşteri için)
export async function POST(request: Request) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { productId, questionText } = await request.json()

        if (!productId || !questionText) {
            return NextResponse.json({ error: 'Product ID and question text are required' }, { status: 400 })
        }

        const query = `
            INSERT INTO product_questions (product_id, user_id, question_text)
            VALUES ($1, $2, $3)
            RETURNING *
        `
        const result = await pool.query(query, [productId, user.userId, questionText])

        return NextResponse.json({
            success: true,
            message: 'Sorunuz başarıyla iletildi.',
            question: result.rows[0]
        })
    } catch (error) {
        console.error('Question create error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

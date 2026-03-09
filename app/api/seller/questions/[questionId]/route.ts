import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-helpers'

// Soruyu cevapla
export async function PUT(
    request: Request,
    { params }: { params: { questionId: string } }
) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { answerText } = await request.json()
        const questionId = params.questionId

        if (!answerText) {
            return NextResponse.json({ error: 'Answer text is required' }, { status: 400 })
        }

        // Check if the question belongs to a product owned by this seller
        const checkQuery = `
            SELECT 1 FROM product_questions q
            JOIN products p ON q.product_id = p.product_id
            WHERE q.question_id = $1 AND p.seller_id = $2
        `
        const checkRes = await pool.query(checkQuery, [questionId, user.userId])

        if (checkRes.rows.length === 0) {
            return NextResponse.json({ error: 'Question not found or access denied' }, { status: 403 })
        }

        const updateQuery = `
            UPDATE product_questions 
            SET 
                answer_text = $1, 
                is_answered = TRUE, 
                answered_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE question_id = $2
            RETURNING *
        `
        const result = await pool.query(updateQuery, [answerText, questionId])

        return NextResponse.json({
            success: true,
            message: 'Cevabınız başarıyla kaydedildi.',
            question: result.rows[0]
        })
    } catch (error) {
        console.error('Answer question error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

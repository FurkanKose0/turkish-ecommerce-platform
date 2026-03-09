import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-helpers'

export async function GET() {
    try {
        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json({ error: 'Giriş yapmanız gerekiyor' }, { status: 401 })
        }

        const query = `
      SELECT 
        u.user_id as seller_id,
        u.first_name as seller_first_name,
        u.last_name as seller_last_name,
        u.email as seller_email,
        fs.created_at as followed_at,
        (SELECT COUNT(*) FROM products p WHERE p.seller_id = u.user_id AND p.is_active = TRUE) as product_count
      FROM followed_stores fs
      JOIN users u ON fs.seller_id = u.user_id
      WHERE fs.user_id = $1
      ORDER BY fs.created_at DESC
    `

        const result = await pool.query(query, [user.userId])

        return NextResponse.json({ followedStores: result.rows })
    } catch (error: any) {
        console.error('Takip edilen mağazalar hatası:', error)
        return NextResponse.json({ error: 'Takip edilen mağazalar yüklenemedi' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Giriş yapmanız gerekiyor' }, { status: 401 })
        }

        const { sellerId, action } = await request.json()

        if (!sellerId) {
            return NextResponse.json({ error: 'Satıcı ID gerekli' }, { status: 400 })
        }

        if (action === 'follow') {
            await pool.query(
                'INSERT INTO followed_stores (user_id, seller_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                [user.userId, sellerId]
            )
            return NextResponse.json({ success: true, message: 'Mağaza takip edildi' })
        } else if (action === 'unfollow') {
            await pool.query(
                'DELETE FROM followed_stores WHERE user_id = $1 AND seller_id = $2',
                [user.userId, sellerId]
            )
            return NextResponse.json({ success: true, message: 'Takip bırakıldı' })
        }

        return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 })
    } catch (error: any) {
        console.error('Takip işlemi hatası:', error)
        return NextResponse.json({ error: 'İşlem başarısız' }, { status: 500 })
    }
}

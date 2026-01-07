// Favoriler API - Guest ve Authenticated kullanıcılar için
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-helpers'
import { getOrCreateGuestSession, getGuestSession } from '@/lib/guest-session'

// Favorileri listele
export async function GET() {
  try {
    const user = await getCurrentUser()
    let userId: number | null = null
    let sessionId: string | null = null

    if (user) {
      userId = user.userId
    } else {
      // Session yoksa oluştur
      sessionId = await getGuestSession()
      if (!sessionId) {
        sessionId = await getOrCreateGuestSession()
      }
    }

    let query: string
    let params: any[]

    if (userId) {
      query = `
        SELECT 
          f.favorite_id,
          f.product_id,
          f.created_at,
          p.product_name,
          p.price,
          p.image_url,
          p.stock_quantity,
          p.sku,
          c.category_name
        FROM favorites f
        INNER JOIN products p ON f.product_id = p.product_id
        INNER JOIN categories c ON p.category_id = c.category_id
        WHERE f.user_id = $1 AND p.is_active = TRUE
        ORDER BY f.created_at DESC
      `
      params = [userId]
    } else {
      query = `
        SELECT 
          f.favorite_id,
          f.product_id,
          f.created_at,
          p.product_name,
          p.price,
          p.image_url,
          p.stock_quantity,
          p.sku,
          c.category_name
        FROM favorites f
        INNER JOIN products p ON f.product_id = p.product_id
        INNER JOIN categories c ON p.category_id = c.category_id
        WHERE f.session_id = $1 AND p.is_active = TRUE
        ORDER BY f.created_at DESC
      `
      params = [sessionId]
    }

    const result = await pool.query(query, params)
    return NextResponse.json({ favorites: result.rows })
  } catch (error: any) {
    console.error('Favoriler yüklenemedi:', error)
    return NextResponse.json(
      { error: 'Favoriler yüklenemedi' },
      { status: 500 }
    )
  }
}

// Favoriye ekle
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json(
        { error: 'Ürün ID gerekli' },
        { status: 400 }
      )
    }

    // Ürünün var olup olmadığını kontrol et
    const productCheck = await pool.query(
      'SELECT product_id FROM products WHERE product_id = $1 AND is_active = TRUE',
      [productId]
    )

    if (productCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Ürün bulunamadı' },
        { status: 404 }
      )
    }

    let userId: number | null = null
    let sessionId: string | null = null

    if (user) {
      userId = user.userId
      console.log('Using authenticated user:', userId)
    } else {
      try {
        sessionId = await getOrCreateGuestSession()
        console.log('Created/retrieved guest session:', sessionId)
      } catch (sessionError: any) {
        console.error('Session oluşturma hatası:', sessionError)
        return NextResponse.json(
          { error: `Session oluşturulamadı: ${sessionError.message}` },
          { status: 500 }
        )
      }
    }

    if (!userId && !sessionId) {
      return NextResponse.json(
        { error: 'Session oluşturulamadı' },
        { status: 500 }
      )
    }

    // Zaten favorilerde var mı kontrol et
    let existing
    if (userId) {
      existing = await pool.query(
        'SELECT favorite_id FROM favorites WHERE user_id = $1 AND product_id = $2',
        [userId, productId]
      )
    } else {
      existing = await pool.query(
        'SELECT favorite_id FROM favorites WHERE session_id = $1 AND product_id = $2',
        [sessionId, productId]
      )
    }

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'Ürün zaten favorilerinizde' },
        { status: 400 }
      )
    }

    // Favoriye ekle
    let result
    if (userId) {
      result = await pool.query(
        `INSERT INTO favorites (user_id, product_id)
         VALUES ($1, $2)
         RETURNING favorite_id, product_id, created_at`,
        [userId, productId]
      )
    } else {
      result = await pool.query(
        `INSERT INTO favorites (session_id, product_id)
         VALUES ($1, $2)
         RETURNING favorite_id, product_id, created_at`,
        [sessionId, productId]
      )
    }

    console.log('Ürün favorilere eklendi başarıyla')
    return NextResponse.json({
      message: 'Favorilere eklendi',
      favorite: result.rows[0],
    })
  } catch (error: any) {
    console.error('Favoriye ekleme hatası:', error)
    console.error('Error stack:', error.stack)
    console.error('Error code:', error.code)
    console.error('Error detail:', error.detail)
    return NextResponse.json(
      { error: `Favoriye eklenemedi: ${error.message}` },
      { status: 500 }
    )
  }
}

// Favoriden çıkar
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    const searchParams = request.nextUrl.searchParams
    const favoriteId = searchParams.get('favoriteId')
    const productId = searchParams.get('productId')

    if (!favoriteId && !productId) {
      return NextResponse.json(
        { error: 'Favori ID veya Ürün ID gerekli' },
        { status: 400 }
      )
    }

    let userId: number | null = null
    let sessionId: string | null = null

    if (user) {
      userId = user.userId
    } else {
      sessionId = await getGuestSession()
      if (!sessionId) {
        return NextResponse.json(
          { error: 'Favori bulunamadı' },
          { status: 404 }
        )
      }
    }

    let query: string
    let params: any[]

    if (favoriteId) {
      if (userId) {
        query = 'DELETE FROM favorites WHERE favorite_id = $1 AND user_id = $2'
        params = [favoriteId, userId]
      } else {
        query = 'DELETE FROM favorites WHERE favorite_id = $1 AND session_id = $2'
        params = [favoriteId, sessionId]
      }
    } else {
      if (userId) {
        query = 'DELETE FROM favorites WHERE product_id = $1 AND user_id = $2'
        params = [productId, userId]
      } else {
        query = 'DELETE FROM favorites WHERE product_id = $1 AND session_id = $2'
        params = [productId, sessionId]
      }
    }

    const result = await pool.query(query, params)

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Favori bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Favorilerden çıkarıldı' })
  } catch (error: any) {
    console.error('Favoriden çıkarma hatası:', error)
    return NextResponse.json(
      { error: 'Favoriden çıkarılamadı' },
      { status: 500 }
    )
  }
}

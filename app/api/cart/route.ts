// Sepet API - Guest ve Authenticated kullanıcılar için
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-helpers'
import { getOrCreateGuestSession, getGuestSession } from '@/lib/guest-session'

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
          c.cart_id,
          c.quantity,
          p.product_id,
          p.product_name,
          p.price,
          p.image_url,
          p.stock_quantity
        FROM cart c
        INNER JOIN products p ON c.product_id = p.product_id
        WHERE c.user_id = $1
        ORDER BY c.created_at DESC
      `
      params = [userId]
    } else {
      query = `
        SELECT 
          c.cart_id,
          c.quantity,
          p.product_id,
          p.product_name,
          p.price,
          p.image_url,
          p.stock_quantity
        FROM cart c
        INNER JOIN products p ON c.product_id = p.product_id
        WHERE c.session_id = $1
        ORDER BY c.created_at DESC
      `
      params = [sessionId]
    }

    const result = await pool.query(query, params)
    return NextResponse.json({ items: result.rows })
  } catch (error: any) {
    console.error('Sepet yüklenemedi:', error)
    return NextResponse.json(
      { error: 'Sepet yüklenemedi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    const { productId, quantity } = await request.json()

    console.log('POST /api/cart - productId:', productId, 'quantity:', quantity, 'user:', user ? 'authenticated' : 'guest')

    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'Geçersiz ürün veya miktar' },
        { status: 400 }
      )
    }

    // Ürün kontrolü
    const productCheck = await pool.query(
      'SELECT product_id, stock_quantity FROM products WHERE product_id = $1 AND is_active = TRUE',
      [productId]
    )

    if (productCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Ürün bulunamadı' },
        { status: 404 }
      )
    }

    const stock = productCheck.rows[0].stock_quantity
    if (stock < quantity) {
      return NextResponse.json(
        { error: 'Yetersiz stok' },
        { status: 400 }
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

    // Sepete ekle veya güncelle
    try {
      if (userId) {
        // Önce mevcut kaydı kontrol et
        const existingCart = await pool.query(
          'SELECT cart_id, quantity FROM cart WHERE user_id = $1 AND product_id = $2',
          [userId, productId]
        )

        if (existingCart.rows.length > 0) {
          // Güncelle
          await pool.query(
            'UPDATE cart SET quantity = quantity + $1, updated_at = CURRENT_TIMESTAMP WHERE cart_id = $2',
            [quantity, existingCart.rows[0].cart_id]
          )
        } else {
          // Yeni ekle
          await pool.query(
            'INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3)',
            [userId, productId, quantity]
          )
        }
      } else {
        // Önce mevcut kaydı kontrol et
        const existingCart = await pool.query(
          'SELECT cart_id, quantity FROM cart WHERE session_id = $1 AND product_id = $2',
          [sessionId, productId]
        )

        if (existingCart.rows.length > 0) {
          // Güncelle
          await pool.query(
            'UPDATE cart SET quantity = quantity + $1, updated_at = CURRENT_TIMESTAMP WHERE cart_id = $2',
            [quantity, existingCart.rows[0].cart_id]
          )
        } else {
          // Yeni ekle
          await pool.query(
            'INSERT INTO cart (session_id, product_id, quantity) VALUES ($1, $2, $3)',
            [sessionId, productId, quantity]
          )
        }
      }
      console.log('Ürün sepete eklendi başarıyla')
      return NextResponse.json({ message: 'Ürün sepete eklendi' })
    } catch (dbError: any) {
      console.error('Database hatası:', dbError)
      console.error('Database error code:', dbError.code)
      console.error('Database error detail:', dbError.detail)
      return NextResponse.json(
        { error: `Database hatası: ${dbError.message}` },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Sepete ekleme hatası:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { error: `Sepete ekleme başarısız: ${error.message}` },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    const { cartId, quantity } = await request.json()

    if (!cartId || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'Geçersiz sepet ID veya miktar' },
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
          { error: 'Sepet bulunamadı' },
          { status: 404 }
        )
      }
    }

    // Sepet öğesini kontrol et
    let cartCheck
    if (userId) {
      cartCheck = await pool.query(
        `SELECT c.cart_id, c.product_id, p.stock_quantity, p.is_active
         FROM cart c
         INNER JOIN products p ON c.product_id = p.product_id
         WHERE c.cart_id = $1 AND c.user_id = $2`,
        [cartId, userId]
      )
    } else {
      cartCheck = await pool.query(
        `SELECT c.cart_id, c.product_id, p.stock_quantity, p.is_active
         FROM cart c
         INNER JOIN products p ON c.product_id = p.product_id
         WHERE c.cart_id = $1 AND c.session_id = $2`,
        [cartId, sessionId]
      )
    }

    if (cartCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Sepet öğesi bulunamadı' },
        { status: 404 }
      )
    }

    const cartItem = cartCheck.rows[0]

    if (!cartItem.is_active) {
      return NextResponse.json(
        { error: 'Ürün artık aktif değil' },
        { status: 400 }
      )
    }

    if (cartItem.stock_quantity < quantity) {
      return NextResponse.json(
        { error: `Yetersiz stok. Mevcut stok: ${cartItem.stock_quantity}` },
        { status: 400 }
      )
    }

    // Miktarı güncelle
    if (userId) {
      await pool.query(
        'UPDATE cart SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE cart_id = $2 AND user_id = $3',
        [quantity, cartId, userId]
      )
    } else {
      await pool.query(
        'UPDATE cart SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE cart_id = $2 AND session_id = $3',
        [quantity, cartId, sessionId]
      )
    }

    return NextResponse.json({ message: 'Miktar güncellendi' })
  } catch (error: any) {
    console.error('Güncelleme hatası:', error)
    return NextResponse.json(
      { error: 'Güncelleme başarısız' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    const searchParams = request.nextUrl.searchParams
    const cartId = searchParams.get('cartId')

    if (!cartId) {
      return NextResponse.json(
        { error: 'Sepet ID gereklidir' },
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
          { error: 'Sepet bulunamadı' },
          { status: 404 }
        )
      }
    }

    if (userId) {
      await pool.query(
        'DELETE FROM cart WHERE cart_id = $1 AND user_id = $2',
        [cartId, userId]
      )
    } else {
      await pool.query(
        'DELETE FROM cart WHERE cart_id = $1 AND session_id = $2',
        [cartId, sessionId]
      )
    }

    return NextResponse.json({ message: 'Ürün sepetten çıkarıldı' })
  } catch (error: any) {
    console.error('Silme hatası:', error)
    return NextResponse.json(
      { error: 'Silme işlemi başarısız' },
      { status: 500 }
    )
  }
}

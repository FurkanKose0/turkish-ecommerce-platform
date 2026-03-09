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

    // Query to fetch cart items
    const cartSelectColumns = `
          c.cart_id,
          c.quantity,
          p.product_id,
          p.product_name,
          p.price,
          p.image_url,
          p.stock_quantity,
          p.size_stocks,
          p.seller_id,
          p.is_deal_of_day,
          p.deal_discount_percent,
          p.deal_start_date,
          p.deal_end_date,
          c.selected_size
    `

    if (userId) {
      query = `
        SELECT ${cartSelectColumns}
        FROM cart c
        INNER JOIN products p ON c.product_id = p.product_id
        WHERE c.user_id = $1
        ORDER BY c.created_at DESC
      `
      params = [userId]
    } else {
      query = `
        SELECT ${cartSelectColumns}
        FROM cart c
        INNER JOIN products p ON c.product_id = p.product_id
        WHERE c.session_id = $1
        ORDER BY c.created_at DESC
      `
      params = [sessionId]
    }

    let isPremium = false
    if (userId) {
      const userRes = await pool.query('SELECT is_premium FROM users WHERE user_id = $1', [userId])
      if (userRes.rows.length > 0) {
        isPremium = userRes.rows[0].is_premium || false
      }
    }

    const result = await pool.query(query, params)

    // Her ürün için aktif kampanya ve günün fırsatı kontrolü yap
    const itemsWithCampaigns = await Promise.all(result.rows.map(async (item: any) => {
      let campaignDiscount = 0
      let activeDeal = null
      let activeCampaign = null
      const originalPrice = parseFloat(item.price)

      // 1. Günün Fırsatı Kontrolü
      if (item.is_deal_of_day && item.deal_discount_percent > 0) {
        const now = new Date();
        const startDate = item.deal_start_date ? new Date(item.deal_start_date) : null;
        const endDate = item.deal_end_date ? new Date(item.deal_end_date) : null;

        if ((!startDate || now >= startDate) && (!endDate || now <= endDate)) {
          // Fırsat geçerli
          campaignDiscount = (originalPrice * parseFloat(item.deal_discount_percent)) / 100;
          activeDeal = {
            type: 'deal_of_day',
            name: 'Günün Fırsatı',
            discount_percent: item.deal_discount_percent
          };
        }
      }

      // 2. Eğer Günün Fırsatı yoksa, normal Kampanya Kontrolü yap
      if (!activeDeal) {
        const campaignResult = await pool.query(
          `SELECT 
              cam.campaign_id,
              cam.campaign_name,
              cam.discount_type,
              cam.discount_value,
              cam.max_discount_amount
            FROM campaigns cam
            JOIN campaign_products cp ON cam.campaign_id = cp.campaign_id
            WHERE cp.product_id = $1
              AND cam.is_active = TRUE
              AND cam.start_date <= NOW()
              AND cam.end_date >= NOW()
            ORDER BY cam.discount_value DESC
            LIMIT 1`,
          [item.product_id]
        )

        if (campaignResult.rows.length > 0) {
          const campaign = campaignResult.rows[0]
          activeCampaign = campaign;

          if (campaign.discount_type === 'percentage') {
            campaignDiscount = (originalPrice * parseFloat(campaign.discount_value)) / 100
            // Max indirim kontrolü
            if (campaign.max_discount_amount && campaignDiscount > parseFloat(campaign.max_discount_amount)) {
              campaignDiscount = parseFloat(campaign.max_discount_amount)
            }
          } else {
            campaignDiscount = parseFloat(campaign.discount_value)
          }
        }
      }

      // İndirim ürün fiyatını geçemez
      if (campaignDiscount > originalPrice) {
        campaignDiscount = originalPrice
      }

      return {
        ...item,
        original_price: item.price,
        campaign_discount: Math.round(campaignDiscount * 100) / 100,
        final_price: Math.round((item.price - campaignDiscount) * 100) / 100,
        campaign: activeDeal ? {
          campaign_id: 'deal',
          campaign_name: 'Günün Fırsatı',
          discount_type: 'percentage',
          discount_value: activeDeal.discount_percent
        } : activeCampaign ? {
          campaign_id: activeCampaign.campaign_id,
          campaign_name: activeCampaign.campaign_name,
          discount_type: activeCampaign.discount_type,
          discount_value: activeCampaign.discount_value
        } : null
      }
    }))

    return NextResponse.json({ items: itemsWithCampaigns, isPremium })
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
    const { productId, quantity, selectedSize } = await request.json()

    console.log('POST /api/cart - productId:', productId, 'quantity:', quantity, 'user:', user ? 'authenticated' : 'guest')

    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'Geçersiz ürün veya miktar' },
        { status: 400 }
      )
    }

    // Ürün kontrolü
    const productCheck = await pool.query(
      'SELECT product_id, stock_quantity, size_stocks FROM products WHERE product_id = $1 AND is_active = TRUE',
      [productId]
    )

    if (productCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Ürün bulunamadı' },
        { status: 404 }
      )
    }

    const productData = productCheck.rows[0]

    // Önce kullanıcının sepetinde halihazırda bu üründen kaç tane olduğunu bulalım
    let currentInCart = 0
    if (user) {
      const res = await pool.query(
        'SELECT quantity FROM cart WHERE user_id = $1 AND product_id = $2 AND COALESCE(selected_size, \'\') = $3',
        [user.userId, productId, selectedSize || '']
      )
      if (res.rows.length > 0) currentInCart = res.rows[0].quantity
    } else {
      const sessionIdForCheck = await getGuestSession()
      if (sessionIdForCheck) {
        const res = await pool.query(
          'SELECT quantity FROM cart WHERE session_id = $1 AND product_id = $2 AND COALESCE(selected_size, \'\') = $3',
          [sessionIdForCheck, productId, selectedSize || '']
        )
        if (res.rows.length > 0) currentInCart = res.rows[0].quantity
      }
    }

    const totalRequested = currentInCart + quantity

    // Eğer beden seçilmişse ve ürünün beden stokları varsa ona göre kontrol et
    if (selectedSize && productData.size_stocks) {
      const sizeStock = productData.size_stocks[selectedSize] || 0
      if (sizeStock < totalRequested) {
        return NextResponse.json(
          { error: `Üzgünüz, bu bedende (${selectedSize}) stokta sadece ${sizeStock} adet ürün kaldı. Sepetinizde zaten ${currentInCart} adet var.` },
          { status: 400 }
        )
      }
    } else if (productData.stock_quantity < totalRequested) {
      return NextResponse.json(
        { error: `Üzgünüz, stokta sadece ${productData.stock_quantity} adet ürün kaldı. Sepetinizde zaten ${currentInCart} adet var.` },
        { status: 400 }
      )
    }

    // Üyelik kontrolü: Eğer kullanıcı zaten premium ise tekrar alamasın
    if (user && (productId === 999 || productId === 1000)) {
      const userRes = await pool.query('SELECT is_premium FROM users WHERE user_id = $1', [user.userId])
      if (userRes.rows.length > 0 && userRes.rows[0].is_premium) {
        // Eğer yıllık paket (1000) eklenmek isteniyorsa ve kullanıcı premium ise, 
        // şu anki paketinin aylık mı yoksa yıllık mı olduğuna bakmalıyız.
        const membershipRes = await pool.query(`
          SELECT oi.product_id
          FROM orders o
          JOIN order_items oi ON o.order_id = oi.order_id
          WHERE o.user_id = $1 AND oi.product_id IN (999, 1000) AND o.status_id != 5
          ORDER BY o.order_date DESC LIMIT 1
        `, [user.userId])

        const currentProductId = membershipRes.rows[0]?.product_id

        // Eğer zaten yıllık paketi varsa veya aynı paketi eklemeye çalışıyorsa engelle
        if (currentProductId === 1000 || currentProductId === productId) {
          return NextResponse.json(
            { error: 'Zaten aktif bir Premium üyeliğiniz bulunmaktadır.' },
            { status: 400 }
          )
        }
        // Aylıktan yıllığa geçişe (999 -> 1000) izin veriyoruz
      }
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
          'SELECT cart_id, quantity FROM cart WHERE user_id = $1 AND product_id = $2 AND COALESCE(selected_size, \'\') = $3',
          [userId, productId, selectedSize || '']
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
            'INSERT INTO cart (user_id, product_id, quantity, selected_size) VALUES ($1, $2, $3, $4)',
            [userId, productId, quantity, selectedSize]
          )
        }
      } else {
        // Önce mevcut kaydı kontrol et
        const existingCart = await pool.query(
          'SELECT cart_id, quantity FROM cart WHERE session_id = $1 AND product_id = $2 AND COALESCE(selected_size, \'\') = $3',
          [sessionId, productId, selectedSize || '']
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
            'INSERT INTO cart (session_id, product_id, quantity, selected_size) VALUES ($1, $2, $3, $4)',
            [sessionId, productId, quantity, selectedSize]
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
        `SELECT c.cart_id, c.product_id, c.selected_size, p.stock_quantity, p.size_stocks, p.is_active, p.product_name
         FROM cart c
         INNER JOIN products p ON c.product_id = p.product_id
         WHERE c.cart_id = $1 AND c.user_id = $2`,
        [cartId, userId]
      )
    } else {
      cartCheck = await pool.query(
        `SELECT c.cart_id, c.product_id, c.selected_size, p.stock_quantity, p.size_stocks, p.is_active, p.product_name
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

    // Stok Kontrolü
    if (cartItem.selected_size && cartItem.size_stocks) {
      const sizeStock = cartItem.size_stocks[cartItem.selected_size] || 0
      if (sizeStock < quantity) {
        return NextResponse.json(
          { error: `Üzgünüz, ${cartItem.product_name} ürününün ${cartItem.selected_size} bedeni için stokta sadece ${sizeStock} adet kaldı.` },
          { status: 400 }
        )
      }
    } else if (cartItem.stock_quantity < quantity) {
      return NextResponse.json(
        { error: `Üzgünüz, stokta sadece ${cartItem.stock_quantity} adet ürün kaldı.` },
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

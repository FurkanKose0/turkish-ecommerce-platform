// Siparişler API - Guest ve Authenticated kullanıcılar için
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-helpers'
import { getGuestSession } from '@/lib/guest-session'

export async function GET() {
  try {
    const user = await getCurrentUser()
    const guestSessionId = await getGuestSession()

    if (!user && !guestSessionId) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    // Müşteri kendi siparişlerini görür, admin tüm siparişleri görür
    let query = `
      SELECT 
        o.order_id,
        o.order_date,
        o.total_amount,
        o.tracking_code,
        o.guest_first_name,
        o.guest_last_name,
        os.status_name,
        COUNT(oi.order_item_id) as item_count,
        (
          SELECT json_agg(json_build_object(
            'product_id', p.product_id, 
            'product_name', p.product_name,
            'price', p.price,
            'image_url', p.image_url,
            'selected_size', oi2.selected_size,
            'quantity', oi2.quantity
          ))
          FROM order_items oi2
          JOIN products p ON oi2.product_id = p.product_id
          WHERE oi2.order_id = o.order_id
        ) as items
      FROM orders o
      INNER JOIN order_status os ON o.status_id = os.status_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
    `
    const params: any[] = []

    if (user) {
      if (user.roleId !== 1) {
        // Müşteri: Sadece kendi siparişlerini görür
        query += ' WHERE o.user_id = $1'
        params.push(user.userId)
      }
      // Admin (roleId === 1) ise WHERE eklemez, tümünü görür
    } else if (guestSessionId) {
      // Misafir: Sadece mevcut session'ındaki siparişleri görür
      query += ' WHERE o.session_id = $1'
      params.push(guestSessionId)
    }

    query += ' GROUP BY o.order_id, o.order_date, o.total_amount, os.status_name, o.guest_first_name, o.guest_last_name'
    query += ' ORDER BY o.order_date DESC'

    const result = await pool.query(query, params)

    return NextResponse.json({ orders: result.rows })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: 'Siparişler yüklenemedi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    const body = await request.json()
    const { addressId, guestOrder, guestInfo, appliedCoupon, discountAmount } = body

    // Authenticated kullanıcı siparişi
    if (user && addressId) {
      // Stored procedure ile sipariş oluştur
      const result = await pool.query(
        'SELECT * FROM create_order($1, $2)',
        [user.userId, addressId]
      )

      const orderResult = result.rows[0]

      if (orderResult.p_status === 'ERROR') {
        return NextResponse.json(
          { error: orderResult.p_message },
          { status: 400 }
        )
      }

      const orderId = orderResult.p_order_id

      // Kupon kullanıldıysa kaydet
      if (appliedCoupon && appliedCoupon.coupon_id) {
        try {
          // Kupon kullanımını kaydet
          await pool.query(
            `INSERT INTO seller_coupon_usages (coupon_id, user_id, order_id, discount_amount)
             VALUES ($1, $2, $3, $4)`,
            [appliedCoupon.coupon_id, user.userId, orderId, discountAmount || 0]
          )

          // Kupon kullanım sayısını artır
          await pool.query(
            `UPDATE seller_coupons SET usage_count = usage_count + 1 WHERE coupon_id = $1`,
            [appliedCoupon.coupon_id]
          )
        } catch (couponError) {
          console.error('Kupon kullanımı kaydedilemedi:', couponError)
          // Kupon kaydı başarısız olsa bile sipariş başarılı
        }
      }

      return NextResponse.json({
        message: orderResult.p_message,
        orderId: orderId,
      })
    }

    // Misafir siparişi
    if (guestOrder && guestInfo) {
      const sessionId = await getGuestSession()
      if (!sessionId) {
        return NextResponse.json(
          { error: 'Session bulunamadı' },
          { status: 400 }
        )
      }

      // Sepetteki ürünleri kontrol et ve toplam tutarı hesapla
      const cartResult = await pool.query(
        `SELECT c.product_id, c.quantity, c.selected_size, p.price, p.stock_quantity, p.product_name, p.size_stocks
         FROM cart c
         INNER JOIN products p ON c.product_id = p.product_id
         WHERE c.session_id = $1`,
        [sessionId]
      )

      if (cartResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Sepetiniz boş!' },
          { status: 400 }
        )
      }

      let totalAmount = 0
      for (const item of cartResult.rows) {
        // Genel stok kontrolü
        if (item.stock_quantity < item.quantity) {
          return NextResponse.json(
            { error: `Yetersiz stok: ${item.product_name} (Mevcut: ${item.stock_quantity}, İstenen: ${item.quantity})` },
            { status: 400 }
          )
        }

        // Beden stoğu kontrolü
        if (item.selected_size && item.size_stocks) {
          const sizeStocks = typeof item.size_stocks === 'string' ? JSON.parse(item.size_stocks) : item.size_stocks;
          const currentSizeStock = sizeStocks[item.selected_size] || 0;
          if (currentSizeStock < item.quantity) {
            return NextResponse.json(
              { error: `Yetersiz beden stoğu: ${item.product_name} - ${item.selected_size} (Mevcut: ${currentSizeStock}, İstenen: ${item.quantity})` },
              { status: 400 }
            )
          }
        }

        totalAmount += item.price * item.quantity
      }

      // Sipariş oluşturma işlemini transaction içine alalım
      const client = await pool.connect()
      try {
        await client.query('BEGIN')

        // Sipariş oluştur
        const orderResult = await client.query(
          `INSERT INTO orders (
            session_id, 
            guest_first_name, guest_last_name, guest_email, guest_phone,
            guest_address_line1, guest_address_line2, guest_city, guest_postal_code,
            total_amount, status_id
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 1)
          RETURNING order_id`,
          [
            sessionId,
            guestInfo.firstName,
            guestInfo.lastName,
            guestInfo.email,
            guestInfo.phone || null,
            guestInfo.address.address_line1,
            guestInfo.address.address_line2 || null,
            guestInfo.address.city,
            guestInfo.address.postal_code,
            totalAmount,
          ]
        )

        const orderId = orderResult.rows[0].order_id

        // Sipariş detaylarını oluştur ve stok düşür
        for (const item of cartResult.rows) {
          // Sipariş detayı ekle
          await client.query(
            `INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal, selected_size)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              orderId,
              item.product_id,
              item.quantity,
              item.price,
              item.price * item.quantity,
              item.selected_size
            ]
          )

          // Stok düşür
          if (item.selected_size && item.size_stocks) {
            // Beden stoklu ürün
            const sizeStocks = typeof item.size_stocks === 'string' ? JSON.parse(item.size_stocks) : item.size_stocks;
            if (sizeStocks[item.selected_size] !== undefined) {
              sizeStocks[item.selected_size] = Math.max(0, (sizeStocks[item.selected_size] || 0) - item.quantity);
            }

            await client.query(
              'UPDATE products SET stock_quantity = stock_quantity - $1, size_stocks = $2 WHERE product_id = $3',
              [item.quantity, JSON.stringify(sizeStocks), item.product_id]
            )
          } else {
            // Normal ürün
            await client.query(
              'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE product_id = $2',
              [item.quantity, item.product_id]
            )
          }
        }

        // Sepeti temizle
        await client.query('DELETE FROM cart WHERE session_id = $1', [sessionId])

        // Kupon kullanıldıysa kaydet
        if (appliedCoupon && appliedCoupon.coupon_id) {
          await client.query(
            `INSERT INTO seller_coupon_usages (coupon_id, session_id, order_id, discount_amount)
             VALUES ($1, $2, $3, $4)`,
            [appliedCoupon.coupon_id, sessionId, orderId, discountAmount || 0]
          )

          await client.query(
            `UPDATE seller_coupons SET usage_count = usage_count + 1 WHERE coupon_id = $1`,
            [appliedCoupon.coupon_id]
          )
        }

        await client.query('COMMIT')

        return NextResponse.json({
          message: `Sipariş başarıyla oluşturuldu. Sipariş No: ${orderId}`,
          orderId: orderId,
        })
      } catch (transactionError: any) {
        await client.query('ROLLBACK')
        throw transactionError
      } finally {
        client.release()
      }
    }

    return NextResponse.json(
      { error: 'Geçersiz istek' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Sipariş oluşturma hatası:', error)
    return NextResponse.json(
      { error: 'Sipariş oluşturulamadı' },
      { status: 500 }
    )
  }
}

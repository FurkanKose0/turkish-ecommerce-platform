// Ürünler API
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')
    const sellerId = searchParams.get('sellerId')
    const showDeals = searchParams.get('showDeals') === 'true'

    let query = `
      SELECT 
        p.product_id,
        p.product_name,
        p.description,
        p.price,
        p.stock_quantity,
        p.sku,
        p.image_url,
        p.sizes,
        p.size_stocks,
        p.is_active,
        p.is_deal_of_day,
        p.deal_discount_percent,
        p.deal_start_date,
        p.deal_end_date,
        c.category_id,
        c.category_name
      FROM products p
      INNER JOIN categories c ON p.category_id = c.category_id
      WHERE p.is_active = TRUE
    `
    const params: any[] = []
    let paramCount = 0

    if (categoryId) {
      paramCount++
      query += ` AND p.category_id = $${paramCount}`
      params.push(categoryId)
    }

    if (search) {
      paramCount++
      query += ` AND (p.product_name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`
      params.push(`%${search}%`)
    }

    if (sellerId) {
      paramCount++
      query += ` AND p.seller_id = $${paramCount}`
      params.push(sellerId)
    }

    if (showDeals) {
      query += ` AND p.is_deal_of_day = TRUE AND p.deal_end_date > NOW()`
    }

    query += ' ORDER BY p.product_name'

    const result = await pool.query(query, params)

    // Her ürün için kampanya veya fırsat bilgisi ekle
    const productsWithCampaigns = await Promise.all(result.rows.map(async (product: any) => {
      let finalPrice = parseFloat(product.price)
      let discountAmount = 0
      let activeDeal = null

      // 1. Önce Günün Fırsatı kontrolü (Öncelikli)
      if (product.is_deal_of_day && product.deal_end_date && new Date(product.deal_end_date) > new Date()) {
        const dealPercent = parseFloat(product.deal_discount_percent)
        discountAmount = (finalPrice * dealPercent) / 100
        activeDeal = {
          type: 'deal',
          percent: dealPercent,
          endDate: product.deal_end_date
        }
      }

      // 2. Eğer fırsat yoksa Kampanya kontrolü
      let campaign = null
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
          [product.product_id]
        )

        if (campaignResult.rows.length > 0) {
          campaign = campaignResult.rows[0]

          if (campaign.discount_type === 'percentage') {
            discountAmount = (finalPrice * parseFloat(campaign.discount_value)) / 100
            if (campaign.max_discount_amount && discountAmount > parseFloat(campaign.max_discount_amount)) {
              discountAmount = parseFloat(campaign.max_discount_amount)
            }
          } else {
            discountAmount = parseFloat(campaign.discount_value)
          }
        }
      }

      if (discountAmount > finalPrice) {
        discountAmount = finalPrice
      }

      finalPrice = finalPrice - discountAmount

      return {
        ...product,
        original_price: product.price,
        campaign_discount: Math.round(discountAmount * 100) / 100,
        final_price: Math.round(finalPrice * 100) / 100,
        // Frontend uyumluluğu için campaign objesini hem fırsat hem kampanya için dolduruyoruz
        campaign: activeDeal ? {
          campaign_id: 0,
          campaign_name: 'Günün Fırsatı',
          discount_type: 'percentage',
          discount_value: activeDeal.percent,
          is_deal: true,
          end_date: activeDeal.endDate
        } : (campaign ? {
          campaign_id: campaign.campaign_id,
          campaign_name: campaign.campaign_name,
          discount_type: campaign.discount_type,
          discount_value: parseFloat(campaign.discount_value)
        } : null)
      }
    }))

    return NextResponse.json({ products: productsWithCampaigns })
  } catch (error: any) {
    console.error('Ürün listeleme hatası:', error)
    return NextResponse.json(
      { error: 'Ürünler yüklenemedi' },
      { status: 500 }
    )
  }
}

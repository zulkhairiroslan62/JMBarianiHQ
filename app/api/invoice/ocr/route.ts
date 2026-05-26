import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')

    // Determine media type
    let mediaType = 'image/jpeg'
    if (file.type === 'image/png') mediaType = 'image/png'
    else if (file.type === 'image/webp') mediaType = 'image/webp'
    else if (file.type === 'image/gif') mediaType = 'image/gif'

    // Call Claude Vision API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64,
              },
            },
            {
              type: 'text',
              text: `You are an OCR system for restaurant invoices. Extract the following information from this invoice image and return ONLY valid JSON (no markdown, no explanation):

{
  "supplier": "supplier name",
  "invoiceNumber": "invoice number or null",
  "date": "invoice date in YYYY-MM-DD format or null",
  "items": [
    {
      "name": "item name",
      "quantity": number,
      "unit": "kg/liter/pcs/etc",
      "price": number,
      "subtotal": number
    }
  ],
  "total": number,
  "confidence": number between 0-100
}

Rules:
- Extract ALL line items from the invoice
- Use exact names as written
- Convert quantities to numbers
- If any field is unclear, use null
- Confidence should reflect overall OCR quality
- Return ONLY the JSON object, nothing else`
            }
          ],
        },
      ],
    })

    // Parse Claude response
    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : ''

    // Try to extract JSON from response
    let ocrData
    try {
      // Remove markdown code blocks if present
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        ocrData = JSON.parse(jsonMatch[0])
      } else {
        ocrData = JSON.parse(responseText)
      }
    } catch (parseError) {
      console.error('Failed to parse Claude response:', responseText)
      return NextResponse.json({
        error: 'Failed to parse OCR results',
        rawResponse: responseText
      }, { status: 500 })
    }

    // Validate required fields
    if (!ocrData.supplier || !ocrData.items || !Array.isArray(ocrData.items)) {
      return NextResponse.json({
        error: 'Invalid OCR data structure',
        data: ocrData
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: ocrData,
      rawResponse: responseText
    })

  } catch (error: any) {
    console.error('OCR error:', error)
    return NextResponse.json(
      { 
        error: 'OCR processing failed', 
        details: error.message 
      },
      { status: 500 }
    )
  }
}

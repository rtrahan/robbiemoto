import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json()
    
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    // Create a summary of all items
    const itemsList = items.map((item: any, idx: number) => 
      `${idx + 1}. ${item.title}: ${item.description}`
    ).join('\n')

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a curator writing auction descriptions for handcrafted ceramics. Create compelling, warm descriptions that capture the essence of a collection."
        },
        {
          role: "user",
          content: `Create an auction description for this collection of handmade ceramic pieces:

${itemsList}

Generate a 2-3 sentence description that:
- Captures the overall theme/vibe of the collection
- Highlights common colors, styles, or techniques
- Creates excitement without listing every item
- Uses warm, artisanal language

Respond with ONLY the description text, no JSON, no quotes.`
        },
      ],
      max_tokens: 150,
      temperature: 0.8,
    })

    const description = response.choices[0]?.message?.content?.trim()
    
    if (!description) {
      throw new Error('No response from OpenAI')
    }

    return NextResponse.json({ description })
  } catch (error) {
    console.error('AI auction description error:', error)
    return NextResponse.json(
      { error: 'Failed to generate auction description' },
      { status: 500 }
    )
  }
}


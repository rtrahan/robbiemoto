import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json()
    
    console.log('AI Generation - Image URL:', imageUrl)
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'No image URL provided' }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    // Use GPT-4o (latest model with vision support)
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this handcrafted ceramic mug photo and create an auction listing.

Provide ONLY valid JSON (no markdown):
{
  "title": "3-5 word catchy title with main color",
  "condition": "New - Handmade",
  "description": "1-2 poetic sentences about glaze, form, feel"
}

Focus on artisanal, warm language. Highlight what makes it special.`
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "low" // Use low detail for faster/cheaper processing
              },
            },
          ],
        },
      ],
      max_tokens: 250,
      temperature: 0.7,
    })

    console.log('OpenAI Response:', response.choices[0]?.message?.content)

    const content = response.choices[0]?.message?.content
    
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    // Clean the response - remove any markdown formatting
    let cleanContent = content.trim()
    
    // Remove code blocks
    cleanContent = cleanContent.replace(/```json\s*/g, '')
    cleanContent = cleanContent.replace(/```\s*/g, '')
    cleanContent = cleanContent.trim()
    
    console.log('Cleaned content:', cleanContent)
    
    const result = JSON.parse(cleanContent)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('=== AI GENERATION ERROR ===')
    console.error('Error:', error)
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    
    return NextResponse.json(
      { 
        error: error.message || 'AI generation failed',
        code: error.code,
        details: error.toString()
      },
      { status: 500 }
    )
  }
}

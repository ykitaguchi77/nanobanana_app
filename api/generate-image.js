import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { prompt } = req.body

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not set'
      })
    }

    if (!prompt) {
      return res.status(400).json({
        error: 'Prompt is required'
      })
    }

    // Try to use Gemini's image generation capabilities
    // Note: Imagen 3 is available through Google AI API
    try {
      const model = genAI.getGenerativeModel({ model: 'imagen-3.0-generate-001' })

      const result = await model.generateContent(prompt)
      const response = await result.response

      // Extract image data
      if (response.candidates && response.candidates[0]) {
        const candidate = response.candidates[0]
        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData) {
              const imageData = part.inlineData.data
              const mimeType = part.inlineData.mimeType
              const imageUrl = `data:${mimeType};base64,${imageData}`

              return res.status(200).json({
                imageUrl: imageUrl,
                description: `生成された画像: ${prompt}`
              })
            }
          }
        }
      }
    } catch (imageGenError) {
      console.log('Imagen API not available, using placeholder:', imageGenError.message)
    }

    // Fallback: Generate a placeholder using text
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    const enhancedPrompt = `あなたは画像生成AIです。以下のプロンプトから詳細な画像の説明を生成してください：\n\n「${prompt}」\n\n画像の詳細な説明（色、構図、雰囲気など）を200文字以内で説明してください。`

    const result = await model.generateContent(enhancedPrompt)
    const response = await result.response
    const description = response.text()

    // Generate a placeholder image URL using a service
    // Using picsum.photos as a placeholder
    const seed = encodeURIComponent(prompt.slice(0, 20))
    const placeholderUrl = `https://picsum.photos/seed/${seed}/800/600`

    res.status(200).json({
      imageUrl: placeholderUrl,
      description: description,
      note: '注: 現在はプレースホルダー画像を使用しています。Imagen APIが利用可能になると実際の画像生成が可能になります。'
    })

  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({
      error: 'Failed to generate image',
      details: error.message
    })
  }
}

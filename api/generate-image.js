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
    const { prompt, previousImage } = req.body

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

    // Use Gemini to enhance the prompt for better image generation
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    let enhancedPromptRequest

    // 前回の画像が存在する場合、変更を適用したプロンプトを生成
    if (previousImage && previousImage.enhancedPrompt) {
      enhancedPromptRequest = `前回生成した画像のプロンプトに対して、ユーザーの新しい指示を適用した画像生成プロンプトを作成してください。

前回の画像プロンプト: ${previousImage.enhancedPrompt}

ユーザーの新しい指示: ${prompt}

指示を適用した新しい英語プロンプト（前回の画像の要素を保ちつつ、新しい指示を反映させてください。プロンプトのみを出力し、他の説明は不要です）:`
    } else {
      // 前回の画像がない場合は通常のプロンプト生成
      enhancedPromptRequest = `以下の日本語のプロンプトを、画像生成AIに最適な英語のプロンプトに変換してください。詳細で具体的な説明を追加し、画像生成に適した形式にしてください。プロンプトのみを出力し、他の説明は不要です。

元のプロンプト: ${prompt}

英語プロンプト:`
    }

    const enhanceResult = await model.generateContent(enhancedPromptRequest)
    const enhanceResponse = await enhanceResult.response
    let enhancedPrompt = enhanceResponse.text().trim()

    // Remove any markdown formatting or extra quotes
    enhancedPrompt = enhancedPrompt.replace(/^["']|["']$/g, '').replace(/^`+|`+$/g, '')

    // Try Imagen API first (if available with Vertex AI)
    try {
      const imagenModel = genAI.getGenerativeModel({ model: 'imagen-3.0-generate-001' })
      const imagenResult = await imagenModel.generateContent(enhancedPrompt)
      const imagenResponse = await imagenResult.response

      if (imagenResponse.candidates && imagenResponse.candidates[0]) {
        const candidate = imagenResponse.candidates[0]
        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData) {
              const imageData = part.inlineData.data
              const mimeType = part.inlineData.mimeType
              const imageUrl = `data:${mimeType};base64,${imageData}`

              return res.status(200).json({
                imageUrl: imageUrl,
                description: `生成された画像: ${prompt}`,
                enhancedPrompt: enhancedPrompt
              })
            }
          }
        }
      }
    } catch (imageGenError) {
      console.log('Imagen API not available:', imageGenError.message)
    }

    // Fallback: Use Pollinations.ai (free image generation API)
    // This service generates real images based on prompts
    const encodedPrompt = encodeURIComponent(enhancedPrompt)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${Date.now()}&nologo=true`

    // Generate a description in Japanese
    const descriptionPrompt = `以下の画像プロンプトに基づいて、生成された画像の説明を日本語で50文字以内で書いてください：\n\n${enhancedPrompt}`

    const descResult = await model.generateContent(descriptionPrompt)
    const descResponse = await descResult.response
    const description = descResponse.text().trim()

    res.status(200).json({
      imageUrl: imageUrl,
      description: description,
      enhancedPrompt: enhancedPrompt,
      note: 'Pollinations.ai を使用して画像を生成しました'
    })

  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({
      error: 'Failed to generate image',
      details: error.message
    })
  }
}

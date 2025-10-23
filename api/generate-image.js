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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

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

    // Use Gemini 2.5 Flash Image for image generation
    try {
      const imageModel = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash-image'
      })

      const result = await imageModel.generateContent(enhancedPrompt)
      const response = await result.response

      // Check if response contains image data
      if (response.candidates && response.candidates[0]) {
        const candidate = response.candidates[0]
        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData) {
              const imageData = part.inlineData.data
              const mimeType = part.inlineData.mimeType
              const imageUrl = `data:${mimeType};base64,${imageData}`

              // Generate description
              const textModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
              const descriptionPrompt = `以下の画像プロンプトに基づいて、生成された画像の説明を日本語で50文字以内で書いてください：\n\n${enhancedPrompt}`
              const descResult = await textModel.generateContent(descriptionPrompt)
              const descResponse = await descResult.response
              const description = descResponse.text().trim()

              return res.status(200).json({
                imageUrl: imageUrl,
                description: description,
                enhancedPrompt: enhancedPrompt,
                note: 'gemini-2.5-flash-image を使用して生成しました'
              })
            }
          }
        }
      }
    } catch (imageGenError) {
      console.log('gemini-2.5-flash-image error:', imageGenError.message)

      // Return detailed error for debugging
      return res.status(500).json({
        error: 'Image generation failed',
        details: imageGenError.message,
        note: 'gemini-2.5-flash-image APIでエラーが発生しました。APIキーの権限を確認してください。'
      })
    }

    // This should not be reached if everything works correctly
    res.status(500).json({
      error: 'Failed to generate image',
      note: '画像の生成に失敗しました'
    })

  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({
      error: 'Failed to generate image',
      details: error.message
    })
  }
}

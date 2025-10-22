import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not set. Please set it in .env file'
      })
    }

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    // Build chat history
    const chatHistory = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }))

    // Start chat with history
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.9,
      },
    })

    // Send message and get response
    const result = await chat.sendMessage(message)
    const response = await result.response
    const text = response.text()

    res.json({ response: text })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({
      error: 'Failed to process request',
      details: error.message
    })
  }
})

app.post('/api/generate-image', async (req, res) => {
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

    // Use Gemini to enhance the prompt for better image generation
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    const enhancedPromptRequest = `以下の日本語のプロンプトを、画像生成AIに最適な英語のプロンプトに変換してください。詳細で具体的な説明を追加し、画像生成に適した形式にしてください。プロンプトのみを出力し、他の説明は不要です。

元のプロンプト: ${prompt}

英語プロンプト:`

    const enhanceResult = await model.generateContent(enhancedPromptRequest)
    const enhanceResponse = await enhanceResult.response
    let enhancedPrompt = enhanceResponse.text().trim()

    // Remove any markdown formatting or extra quotes
    enhancedPrompt = enhancedPrompt.replace(/^["']|["']$/g, '').replace(/^`+|`+$/g, '')

    // Try Imagen API first (if available)
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

              return res.json({
                imageUrl: imageUrl,
                description: `生成された画像: ${prompt}`,
                enhancedPrompt: enhancedPrompt
              })
            }
          }
        }
      }
    } catch (imageGenError) {
      console.log('Imagen not available:', imageGenError.message)
    }

    // Fallback: Use Pollinations.ai (free image generation API)
    const encodedPrompt = encodeURIComponent(enhancedPrompt)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${Date.now()}&nologo=true`

    // Generate a description in Japanese
    const descriptionPrompt = `以下の画像プロンプトに基づいて、生成された画像の説明を日本語で50文字以内で書いてください：\n\n${enhancedPrompt}`

    const descResult = await model.generateContent(descriptionPrompt)
    const descResponse = await descResult.response
    const description = descResponse.text().trim()

    res.json({
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
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', model: 'gemini-2.0-flash-exp' })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`)
  console.log(`API Key configured: ${!!process.env.GEMINI_API_KEY}`)
  console.log(`Access from mobile: http://<your-ip>:${PORT}`)
})

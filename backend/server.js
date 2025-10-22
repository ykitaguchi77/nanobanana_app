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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', model: 'gemini-2.0-flash-exp' })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`)
  console.log(`API Key configured: ${!!process.env.GEMINI_API_KEY}`)
  console.log(`Access from mobile: http://<your-ip>:${PORT}`)
})

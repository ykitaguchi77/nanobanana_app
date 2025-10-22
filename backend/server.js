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

// System prompt for Nanobanana image generation assistant
const SYSTEM_PROMPT = `あなたは「Nanobanana」という画像生成AIのプロンプト作成専門アシスタントです。

## あなたの役割
- ユーザーが理想的な画像を生成できるよう、最適なプロンプトを提案すること
- 画像生成AIに特化したアドバイスを提供すること
- ユーザーのアイデアを具体的で詳細なプロンプトに変換すること

## 重要な方針
- 他のツールやアプリケーションの使用を提案しないこと（Nanobananaでの画像生成に集中）
- プログラミングコードを書かないこと
- 画像生成プロンプトの改善に特化すること

## プロンプト作成のベストプラクティス

### 1. 具体的で詳細な説明
- 悪い例: 「バナナの絵」
- 良い例: 「笑顔の黄色いバナナのキャラクター、カートゥーンスタイル、温かい雰囲気、パステルカラーの背景」

### 2. 推奨構造
主題 → 詳細な説明 → スタイル → 構図 → 照明 → 雰囲気 → 品質指定

### 3. 重要な要素
- **主題**: 何を描くか明確に
- **スタイル**: アニメ風、水彩画、フォトリアリスティックなど
- **構図**: 正面から、クローズアップ、遠景など
- **照明**: 柔らかい光、夕日、自然光など
- **色彩**: 鮮やか、パステル、具体的な色名
- **雰囲気**: 温かい、神秘的、楽しいなど
- **品質**: 高品質、詳細、鮮明

### 4. 効果的なテクニック
- 重要な要素を最初に書く
- カンマで要素を区切る
- 明確で視覚的な言葉を使う
- 抽象的な表現を避ける

### 5. シーン別テンプレート

**キャラクター**: [種類]、[表情]、[服装]、[ポーズ]、[背景]、[スタイル]、[照明]、[雰囲気]

**風景**: [場所]、[時間帯]、[季節]、[天気]、[主要な要素]、[スタイル]、[視点]、[雰囲気]

**食べ物**: [料理名]、[盛り付け]、[器]、[背景]、[照明]、[スタイル]、[視点]、[雰囲気]

## 対応方法
1. ユーザーのアイデアを聞く
2. 具体的で詳細なプロンプトに変換して提案
3. 必要に応じて複数のバリエーションを提示
4. ユーザーが「🎨 画像生成」ボタンで使えるよう、完成したプロンプトを提供

## 会話例
ユーザー: 「バナナの絵が欲しい」
あなた: 「かわいいバナナの画像ですね！以下のようなプロンプトはいかがでしょうか：

"笑顔の黄色いバナナのキャラクター、大きな目と手足、カートゥーンスタイル、白い背景、柔らかい照明、楽しくフレンドリーな雰囲気、高品質、鮮やかな色彩"

このプロンプトを🎨画像生成ボタンでお試しください！

もし雰囲気を変えたい場合は：
- よりリアルな写真風にしたい
- アニメ風にしたい
- レトロなイラスト風にしたい

など、ご要望をお聞かせください。」

常にNanobananaでの画像生成を前提に、最高のプロンプトを提案してください。`

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, lastGeneratedImage } = req.body

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not set. Please set it in .env file'
      })
    }

    // システムプロンプトに画像情報を追加
    let contextualSystemPrompt = SYSTEM_PROMPT

    if (lastGeneratedImage) {
      contextualSystemPrompt += `\n\n## 現在の画像生成コンテキスト
直前に以下の画像を生成しました：
- 元のプロンプト: ${lastGeneratedImage.originalPrompt}
- 最適化されたプロンプト: ${lastGeneratedImage.enhancedPrompt}
- 画像の説明: ${lastGeneratedImage.description}

ユーザーがこの画像について質問したり、変更を提案したりする可能性があります。この画像を参照して応答してください。`
    }

    // Get the Gemini model with system instruction
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      systemInstruction: contextualSystemPrompt
    })

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

              return res.json({
                imageUrl: imageUrl,
                description: description,
                enhancedPrompt: enhancedPrompt,
                note: 'Gemini 2.5 Flash Image を使用して生成しました'
              })
            }
          }
        }
      }
    } catch (imageGenError) {
      console.log('Gemini 2.5 Flash Image error:', imageGenError.message)

      // Return detailed error for debugging
      return res.status(500).json({
        error: 'Image generation failed',
        details: imageGenError.message,
        note: 'Gemini 2.5 Flash Image APIでエラーが発生しました。APIキーの権限を確認してください。'
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
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', model: 'gemini-2.0-flash-exp' })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`)
  console.log(`API Key configured: ${!!process.env.GEMINI_API_KEY}`)
  console.log(`Access from mobile: http://<your-ip>:${PORT}`)
})

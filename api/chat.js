import { GoogleGenerativeAI } from '@google/generative-ai'

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
    const { message, history, lastGeneratedImage, model: selectedModel = 'flash' } = req.body

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not set'
      })
    }

    // Select the chat model based on user choice
    const chatModelName = selectedModel === 'pro' ? 'gemini-2.5-pro' : 'gemini-2.5-flash'

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

    // Get the Gemini model
    const model = genAI.getGenerativeModel({
      model: chatModelName,
      systemInstruction: contextualSystemPrompt
    })

    // Build chat history
    const chatHistory = (history || []).map(msg => ({
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

    res.status(200).json({ response: text })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({
      error: 'Failed to process request',
      details: error.message
    })
  }
}

import { useState, useRef, useEffect } from 'react'
import axios from 'axios'

function ChatInterface() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [lastGeneratedImage, setLastGeneratedImage] = useState(null)
  const [selectedModel, setSelectedModel] = useState('flash') // 'flash' or 'pro'
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // 画像が生成されている場合、その情報も含めて送信
      const requestData = {
        message: input,
        history: messages,
        model: selectedModel
      }

      if (lastGeneratedImage) {
        requestData.lastGeneratedImage = {
          description: lastGeneratedImage.description,
          enhancedPrompt: lastGeneratedImage.enhancedPrompt,
          originalPrompt: lastGeneratedImage.originalPrompt
        }
      }

      const response = await axios.post('/api/chat', requestData)

      const aiMessage = { role: 'assistant', content: response.data.response }
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error:', error)
      const errorMessage = {
        role: 'assistant',
        content: 'エラーが発生しました。APIキーが設定されているか確認してください。'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateImageFromPrompt = async (promptText) => {
    if (loading || isGeneratingImage) return

    const userMessage = { role: 'user', content: `🎨 ${promptText}` }
    setMessages(prev => [...prev, userMessage])
    setIsGeneratingImage(true)

    try {
      // 前回の画像情報を含めて送信
      const requestData = {
        prompt: promptText
      }

      // 前回の画像が存在する場合、その情報と画像データを追加
      if (lastGeneratedImage) {
        requestData.previousImage = {
          prompt: lastGeneratedImage.originalPrompt,
          enhancedPrompt: lastGeneratedImage.enhancedPrompt,
          description: lastGeneratedImage.description,
          imageUrl: lastGeneratedImage.imageUrl  // 実際の画像データを送信
        }
      }

      const response = await axios.post('/api/generate-image', requestData)

      const imageMessage = {
        role: 'assistant',
        content: response.data.description || '画像を生成しました',
        image: response.data.imageUrl,
        isImage: true
      }
      setMessages(prev => [...prev, imageMessage])

      // 最後に生成した画像の情報を保存
      setLastGeneratedImage({
        imageUrl: response.data.imageUrl,
        originalPrompt: promptText,
        enhancedPrompt: response.data.enhancedPrompt,
        description: response.data.description
      })
    } catch (error) {
      console.error('Error:', error)
      const errorMessage = {
        role: 'assistant',
        content: '画像の生成中にエラーが発生しました。もう一度お試しください。'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const handleGenerateImage = async () => {
    if (!input.trim() || loading || isGeneratingImage) return

    const userMessage = { role: 'user', content: `🎨 ${input}` }
    setMessages(prev => [...prev, userMessage])
    const prompt = input
    setInput('')
    setIsGeneratingImage(true)

    try {
      // 前回の画像情報を含めて送信
      const requestData = {
        prompt: prompt
      }

      // 前回の画像が存在する場合、その情報と画像データを追加
      if (lastGeneratedImage) {
        requestData.previousImage = {
          prompt: lastGeneratedImage.originalPrompt,
          enhancedPrompt: lastGeneratedImage.enhancedPrompt,
          description: lastGeneratedImage.description,
          imageUrl: lastGeneratedImage.imageUrl  // 実際の画像データを送信
        }
      }

      const response = await axios.post('/api/generate-image', requestData)

      const imageMessage = {
        role: 'assistant',
        content: response.data.description || '画像を生成しました',
        image: response.data.imageUrl,
        isImage: true
      }
      setMessages(prev => [...prev, imageMessage])

      // 最後に生成した画像の情報を保存
      setLastGeneratedImage({
        imageUrl: response.data.imageUrl,
        originalPrompt: prompt,
        enhancedPrompt: response.data.enhancedPrompt,
        description: response.data.description
      })
    } catch (error) {
      console.error('Error:', error)
      const errorMessage = {
        role: 'assistant',
        content: '画像の生成中にエラーが発生しました。もう一度お試しください。'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsGeneratingImage(false)
    }
  }

  // プロンプトを抽出する関数（""または「」で囲まれたテキスト）
  const extractPrompts = (text) => {
    const prompts = []
    // ""で囲まれたテキストを抽出
    const doubleQuoteMatches = text.match(/"([^"]+)"/g)
    if (doubleQuoteMatches) {
      doubleQuoteMatches.forEach(match => {
        prompts.push(match.slice(1, -1))
      })
    }
    // 「」で囲まれたテキストを抽出
    const jpQuoteMatches = text.match(/「([^」]+)」/g)
    if (jpQuoteMatches) {
      jpQuoteMatches.forEach(match => {
        prompts.push(match.slice(1, -1))
      })
    }
    return prompts
  }

  // テキストをプロンプト部分とそれ以外に分割してレンダリング
  const renderMessageWithPrompts = (text) => {
    // ""と「」の両方にマッチする正規表現
    const regex = /"([^"]+)"|「([^」]+)」/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = regex.exec(text)) !== null) {
      // マッチ前のテキスト
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, match.index)
        })
      }
      // プロンプト部分
      const promptText = match[1] || match[2]
      parts.push({
        type: 'prompt',
        content: promptText,
        fullMatch: match[0]
      })
      lastIndex = regex.lastIndex
    }
    // 残りのテキスト
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex)
      })
    }

    return parts.map((part, index) => {
      if (part.type === 'text') {
        return <span key={index} className="whitespace-pre-wrap">{part.content}</span>
      } else {
        return (
          <span key={index} className="inline-block my-1">
            <span className="bg-purple-100 text-purple-900 px-2 py-1 rounded font-medium">
              {part.fullMatch}
            </span>
            <button
              onClick={() => handleGenerateImageFromPrompt(part.content)}
              disabled={loading || isGeneratingImage}
              className="ml-2 bg-purple-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors inline-flex items-center space-x-1"
            >
              <span>🎨</span>
              <span>生成</span>
            </button>
          </span>
        )
      }
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-0">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="h-[70vh] sm:h-[600px] overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-10 sm:mt-20">
              <p className="text-lg sm:text-xl mb-2">こんにちは！</p>
              <p className="text-sm sm:text-base">何でも聞いてください。</p>
              <p className="text-xs sm:text-sm mt-4 text-gray-400">
                💬 通常のチャット、または 🎨 画像生成ができます
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-3 sm:p-4 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.isImage && message.image ? (
                  <div>
                    <img
                      src={message.image}
                      alt="Generated"
                      className="rounded-lg max-w-full h-auto mb-2"
                      loading="lazy"
                    />
                    <p className="text-xs sm:text-sm text-gray-600 mt-2">{message.content}</p>
                  </div>
                ) : (
                  <div className="text-sm sm:text-base">
                    {message.role === 'assistant' && extractPrompts(message.content).length > 0
                      ? renderMessageWithPrompts(message.content)
                      : <span className="whitespace-pre-wrap">{message.content}</span>
                    }
                  </div>
                )}
              </div>
            </div>
          ))}

          {(loading || isGeneratingImage) && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  {isGeneratingImage && (
                    <span className="text-xs text-gray-500 ml-2">画像生成中...</span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="border-t p-3 sm:p-4">
          <div className="flex flex-col space-y-2">
            {lastGeneratedImage && (
              <div className="flex items-center justify-between bg-purple-50 px-3 py-2 rounded-lg text-xs sm:text-sm">
                <span className="text-purple-700">
                  ✨ 前回の画像に変更を適用できます
                </span>
                <button
                  type="button"
                  onClick={() => setLastGeneratedImage(null)}
                  className="text-purple-500 hover:text-purple-700 font-medium"
                >
                  リセット
                </button>
              </div>
            )}
            <div className="flex items-center justify-center space-x-4 bg-gray-50 px-3 py-2 rounded-lg">
              <span className="text-xs sm:text-sm font-medium text-gray-700">チャットAI:</span>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="model"
                  value="flash"
                  checked={selectedModel === 'flash'}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-4 h-4 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-xs sm:text-sm text-gray-700">⚡ Flash</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="model"
                  value="pro"
                  checked={selectedModel === 'pro'}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-4 h-4 text-purple-500 focus:ring-purple-500"
                />
                <span className="text-xs sm:text-sm text-gray-700">✨ Pro</span>
              </label>
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={lastGeneratedImage ? "変更内容を入力（例：もっと明るく、背景を青に）..." : "メッセージまたは画像の説明を入力..."}
                className="flex-1 border rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading || isGeneratingImage}
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={loading || isGeneratingImage || !input.trim()}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
              >
                💬 チャット
              </button>
              <button
                type="button"
                onClick={handleGenerateImage}
                disabled={loading || isGeneratingImage || !input.trim()}
                className="flex-1 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
              >
                🎨 画像生成
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChatInterface

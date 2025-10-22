import { useState } from 'react'
import ChatInterface from './components/ChatInterface'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Nanobanana Web App
          </h1>
          <p className="text-gray-600">
            Powered by Google Gemini AI
          </p>
        </header>
        <ChatInterface />
      </div>
    </div>
  )
}

export default App

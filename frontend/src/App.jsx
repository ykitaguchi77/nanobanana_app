import { useState } from 'react'
import ChatInterface from './components/ChatInterface'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <header className="text-center mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-1 sm:mb-2">
            Nanobanana Web App
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Powered by Google Gemini AI
          </p>
        </header>
        <ChatInterface />
      </div>
    </div>
  )
}

export default App

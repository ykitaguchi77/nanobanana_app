export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    model: 'gemini-2.0-flash-exp',
    timestamp: new Date().toISOString()
  })
}

const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const connectDB = require('./config/db')

dotenv.config()
console.log('GROQ KEY:', process.env.GROQ_API_KEY?.substring(0, 8))
connectDB()
const app = express()
app.use(cors({
  origin: '*',
  credentials: false
}))
app.use(express.json())

// Routes
app.use('/api/auth',      require('./routes/auth'))
app.use('/api/questions', require('./routes/questions'))
app.use('/api/sessions',  require('./routes/sessions'))

app.get('/', (req, res) => res.json({ message: 'PrepAI API running' }))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
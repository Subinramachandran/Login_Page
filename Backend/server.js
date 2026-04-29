const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const csrf = require('csurf')
const connectDB = require('./config/db')
require('dotenv').config()

const authRoutes = require('./routes/authRoutes')
const refreshRoute = require('./routes/refresh')

const app = express()
const PORT = process.env.PORT || 5000

// ---------------------
// Middleware
// ---------------------
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

app.use(express.json())
app.use(cookieParser())

// ---------------------
// CSRF CONFIG
// ---------------------
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: "lax"
  }
})

// ---------------------
// CSRF TOKEN ROUTE
// ---------------------
app.get('/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() })
})

// ---------------------
// ROUTES
// ---------------------
app.use(authRoutes)
app.use(refreshRoute)

// ---------------------
// START SERVER
// ---------------------
const startServer = async () => {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`🚀 Server running on ${PORT}`)
  })
}

startServer()
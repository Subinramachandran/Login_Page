const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const cookieParser = require("cookie-parser");
const csrf = require('csurf');
const verifyToken = require('./middleware/authMiddleware')
const refreshRoute = require('./routes/refresh')

const app = express()
const PORT = process.env.PORT || 5000
const SECRET_KEY = process.env.SECRET_KEY

// Middleware
app.use(express.json())
app.use(cookieParser())

// CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// CSRF (cookie mode)
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false
  }
})

// 👉 CSRF TOKEN ROUTE (ONLY THIS USES csrfProtection)
app.get('/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() })
})

const user = {
  username: 'Subin',
  password: '1234'
}

// ✅ LOGIN (NO CSRF here to avoid issues)
app.post('/login', (req, res) => {
  const { username, password } = req.body

  if (username !== user.username || password !== user.password) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const accessToken = jwt.sign({ username }, SECRET_KEY, { expiresIn: "15m" })
  const refreshToken = jwt.sign({ username }, SECRET_KEY, { expiresIn: "7d" })

  // Access Token
  res.cookie("token", accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 15 * 60 * 1000
  })

  // Refresh Token
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000
  })

  res.json({ message: "Login success" })
})

// ✅ LOGOUT (CSRF REQUIRED)
app.post('/logout', csrfProtection, (req, res) => {
  res.clearCookie("token")
  res.clearCookie("refreshToken")

  res.json({ message: "Logged out" })
})

// ✅ PROTECTED ROUTE
app.get('/profile', verifyToken, (req, res) => {
  res.json({
    message: "Protected route",
    user: req.user
  })
})

// ✅ REFRESH ROUTE
app.use('/refresh', refreshRoute)

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`)
})
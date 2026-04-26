const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const csrf = require('csurf')
const bcrypt = require('bcrypt')
const connectDB = require('./config/db')
const User = require('./models/User')
require('dotenv').config()

const verifyToken = require('./middleware/authMiddleware.js')
const refreshRoute = require('./routes/refresh')

const app = express()
const PORT = process.env.PORT || 5000

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET

// ---------------------
// Middleware
// ---------------------
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

app.use(express.json())
app.use(cookieParser())

// =========================
// CSRF CONFIG 
// =========================
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: "lax"
  }
})

// =========================
// CSRF TOKEN ROUTE 
// =========================
app.get('/csrf-token', csrfProtection, (req, res) => {
  res.json({
    csrfToken: req.csrfToken()
  })
})

// apply refresh route
app.use(refreshRoute)

// ---------------------
// SIGNUP
// ---------------------
app.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields required'
      })
    }

    // check existing user
    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists'
      })
    }

    // hash password
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    // save user
    const newUser = new User({
      username,
      passwordHash
    })

    await newUser.save()

    res.status(201).json({
      success: true,
      message: 'User registered successfully'
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// ---------------------
// LOGIN 
// ---------------------
app.post(`/login`, async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Empty credentials'
      })
    }

    //fetch user FIRST
    const user = await User.findOne({ username })
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid user'
      })
    }

    // check password
    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Wrong password'
      })
    }

    const accessToken = jwt.sign(
      { username: user.username },
      ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    )

    const refreshToken = jwt.sign(
      { username: user.username },
      REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    )

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: '/',
      maxAge: 60 * 60 * 1000
    })

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return res.status(200).json({
      success: true,
      message: 'Login successful'
    })

  } catch (err) {
    console.error(err)
    return res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// ---------------------
// PROFILE (PROTECTED)
// ---------------------
app.get(`/profile`, verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Protected Route',
    user: req.user
  })
})

// =========================
// LOGOUT (CSRF PROTECTED)
// =========================
app.post(`/logout`, csrfProtection, (req, res) => {

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: '/'
  })

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: '/'
  })

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  })
})

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
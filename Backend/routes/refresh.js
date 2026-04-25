const express = require('express')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const router = express.Router()

router.post('/refresh', (req, res) => {
  const refreshToken = req.cookies?.refreshToken
  console.log('Refresh token', refreshToken)

  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token' })
  }

  try {
    // ✅ verify refresh token (NOT access secret)
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )

    // create new access token
    const newAccessToken = jwt.sign(
      { username: decoded.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    )

    // optional (BEST PRACTICE → store in cookie)
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: '/',
      maxAge: 15 * 60 * 1000
    })

    return res.json({
      success: true,
      accessToken: newAccessToken,
      message: 'Token refreshed successfully'
    })

  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid refresh token'
    })
  }
})

module.exports = router
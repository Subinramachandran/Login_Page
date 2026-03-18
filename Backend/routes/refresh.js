const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
require('dotenv').config()

const SECRET_KEY = process.env.SECRET_KEY

router.post('/', (req, res) => {
  const refreshToken = req.cookies.refreshToken

  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token' })
  }

  try {
    const userData = jwt.verify(refreshToken, SECRET_KEY)

    const newAccessToken = jwt.sign(
      { username: userData.username },
      SECRET_KEY,
      { expiresIn: "15m" }
    )

    res.cookie("token", newAccessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 15 * 60 * 1000
    })

    res.json({ message: "Token refreshed" })

  } catch (err) {
    return res.status(403).json({ message: "Invalid refresh token" })
  }
})

module.exports = router
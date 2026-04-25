require('dotenv').config()
const jwt = require('jsonwebtoken')

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET

const verifyToken = (req, res, next) => {
  const accessToken = req.cookies.accessToken
  
  if(!accessToken){
    return res.status(401).json({
      message: 'No token, unauthorized'
    })
  }

  try {
     const decoded = jwt.verify(accessToken, ACCESS_TOKEN_SECRET)
     req.user = decoded
     next()
  } catch (error) {
    console.error('Jwt error', error)
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    })
  }
}
module.exports = verifyToken
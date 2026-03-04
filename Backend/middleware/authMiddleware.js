const jwt = require('jsonwebtoken')
require('dotenv').config()

const SECRET_KEY = process.env.SECRET_KEY

const verifyToken = (req, res, next) => {
    const authHeaders = req.headers.authorization

    if (!authHeaders) {
        return res.status(401).json({ message: 'No token provided' })
    }

    const token = authHeaders.split(" ")[1]
    try {
        const decoded = jwt.verify(token, SECRET_KEY)
        req.user = decoded
        next()
    } catch (error) {
        console.log("JWT ERROR", error.message)
    }

}

module.exports = verifyToken
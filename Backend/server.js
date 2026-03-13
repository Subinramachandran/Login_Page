const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const verifyToken = require('./middleware/authMiddleware.js')
const cookieParser = require("cookie-parser");

const app = express()
const PORT = process.env.PORT || 5000
const SECRET_KEY = process.env.SECRET_KEY

//Middleware
app.use(express.json())
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(cookieParser())

const user = {
    username: 'Subin',
    password: '1234'
}

app.post('/login', (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Empty credentials'
        })
    }

    if (username !== user.username || password !== user.password) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        })
    }

    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1hr" })

    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",        
        maxAge: 60 * 60 * 1000 //1 hr
    })

    return res.status(200).json({
        success: true,
        message: 'Login successful'
    })
})

app.post('/logout', (req, res) => {
    res.clearCookie("token", {
        path: '/',
        sameSite: 'lax'
    })
    res.json({ message: 'Logged out successfully' })
})

app.get('/profile', verifyToken, (req, res) => {
    return res.status(200).json({
        message: 'Protected Route',
        user: req.user
    })
})

app.listen(PORT, () => {
    console.log(`Server is listening ${PORT}`)
})
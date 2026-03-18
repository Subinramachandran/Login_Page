require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const jwt = require('jsonwebtoken');
const csrf = require('csurf');
const bcrypt = require('bcrypt');
const connectDB = require('./config/db');
const User = require('./models/User');
const verifyToken = require('./middleware/authMiddleware');

const app = express();
const PORT = 5000;
const SECRET_KEY = process.env.SECRET_KEY;

// ---------------------
// Middleware
// ---------------------
app.use(express.json());
app.use(cookieParser());

// CORS (frontend localhost:5173)
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// CSRF protection
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false
  }
});

// ---------------------
// CSRF TOKEN
// ---------------------
app.get('/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// ---------------------
// LOGIN ROUTE
// ---------------------
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ message: "Invalid user" });

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) return res.status(401).json({ message: "Wrong password" });

  // Access Token (short-lived)
  const accessToken = jwt.sign({ username }, SECRET_KEY, { expiresIn: "15m" });

  // Refresh Token (long-lived)
  const refreshToken = jwt.sign({ username }, SECRET_KEY, { expiresIn: "7d" });

  // Send cookies to client
  res.cookie("token", accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 15 * 60 * 1000, // 15 min
    path: '/'
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
  });

  res.json({ message: "Login success" });
});

// ---------------------
// REFRESH TOKEN ROUTE
// ---------------------
app.post('/refresh', csrfProtection, (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) return res.status(401).json({ message: "No refresh token" });

  try {
    const userData = jwt.verify(refreshToken, SECRET_KEY);

    // New Access Token
    const newAccessToken = jwt.sign({ username: userData.username }, SECRET_KEY, { expiresIn: "15m" });

    res.cookie("token", newAccessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 15 * 60 * 1000,
      path: '/'
    });

    res.json({ message: "Token refreshed" });

  } catch (err) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
});

// ---------------------
// PROFILE ROUTE (protected)
// ---------------------
app.get('/profile', verifyToken, (req, res) => {
  res.json({
    message: "Profile data fetched successfully",
    user: req.user
  });
});

// ---------------------
// LOGOUT ROUTE
// ---------------------
app.post('/logout', (req, res) => {
  // Clear both access and refresh token cookies
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: false, path: '/' });
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'lax', secure: false, path: '/' });

  res.json({ message: "Logout success" });
});

// ---------------------
// START SERVER
// ---------------------
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on ${PORT}`);
  });
};

startServer();
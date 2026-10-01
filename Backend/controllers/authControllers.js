const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET


// ---------------------
// SIGNUP
// ---------------------
exports.signup = async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields required'
      })
    }

    const existingUser = await User.findOne({
      username
    })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists'
      })
    }

    const salt = await bcrypt.genSalt(10)

    const passwordHash = await bcrypt.hash(
      password,
      salt
    )

    const newUser = new User({
      username,
      passwordHash
    })

    await newUser.save()

    return res.status(201).json({
      success: true,
      message: 'User registered successfully'
    })

  } catch (err) {
    console.error('Signup error:', err)

    return res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
}


// ---------------------
// LOGIN
// ---------------------
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Empty credentials'
      })
    }

    const user = await User.findOne({
      username
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid user'
      })
    }

    const isMatch = await bcrypt.compare(
      password,
      user.passwordHash
    )

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Wrong password'
      })
    }


    // ---------------------
    // ACCESS TOKEN
    // ---------------------
    const accessToken = jwt.sign(
      {
        username: user.username
      },
      ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
      }
    )


    // ---------------------
    // REFRESH TOKEN
    // ---------------------
    const refreshToken = jwt.sign(
      {
        username: user.username
      },
      REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
      }
    )


    // ---------------------
    // ACCESS TOKEN COOKIE
    // ---------------------
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000
    })


    // ---------------------
    // REFRESH TOKEN COOKIE
    // ---------------------
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })


    return res.json({
      success: true,
      message: 'Login successful'
    })

  } catch (err) {
    console.error('Login error:', err)

    return res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
}


// ---------------------
// PROFILE
// ---------------------
exports.profile = (req, res) => {
  return res.json({
    success: true,
    message: 'Protected Route',
    user: req.user
  })
}


// ---------------------
// DELETE ACCOUNT
// ---------------------
exports.deleteAccount = async (req, res) => {
  try {
    const username = req.user.username

    const deletedUser =
      await User.findOneAndDelete({
        username
      })

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')

    return res.json({
      success: true,
      message: 'Account deleted successfully'
    })

  } catch (err) {
    console.error('Delete account error:', err)

    return res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
}


// ---------------------
// GET TASKS
// ---------------------
exports.getTasks = async (req, res) => {
  try {
    const username = req.user.username

    const user = await User.findOne({
      username
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    return res.json({
      success: true,
      tasks: user.tasks || []
    })

  } catch (err) {
    console.error('Get tasks error:', err)

    return res.status(500).json({
      success: false,
      message: 'Unable to load tasks'
    })
  }
}


// ---------------------
// SAVE TASKS
// ---------------------
exports.saveTasks = async (req, res) => {
  try {
    const username = req.user.username
    const { tasks } = req.body


    // ---------------------
    // CHECK TASKS
    // ---------------------
    if (!Array.isArray(tasks)) {
      return res.status(400).json({
        success: false,
        message: 'Tasks must be an array'
      })
    }


    // ---------------------
    // UPDATE TASKS
    // ---------------------
    const updatedUser =
      await User.findOneAndUpdate(
        {
          username
        },
        {
          $set: {
            tasks: tasks
          }
        },
        {
          returnDocument: 'after',
          runValidators: true
        }
      )


    // ---------------------
    // USER NOT FOUND
    // ---------------------
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }


    // ---------------------
    // SUCCESS
    // ---------------------
    return res.json({
      success: true,
      message: 'Tasks saved successfully'
    })

  } catch (err) {
    console.error('Save tasks error:', err)

    return res.status(500).json({
      success: false,
      message: 'Unable to save tasks'
    })
  }
}


// ---------------------
// LOGOUT
// ---------------------
exports.logout = (req, res) => {

  res.clearCookie('accessToken')
  res.clearCookie('refreshToken')

  return res.json({
    success: true,
    message: 'Logged out successfully'
  })
}
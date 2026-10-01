const express = require('express')
const router = express.Router()

const authController = require('../controllers/authControllers')
const verifyToken = require('../middleware/authMiddleware')


// ---------------------
// AUTH ROUTES
// ---------------------

router.post(
  '/signup',
  authController.signup
)

router.post(
  '/login',
  authController.login
)

router.post(
  '/logout',
  authController.logout
)


// ---------------------
// PROTECTED ROUTES
// ---------------------

router.get(
  '/profile',
  verifyToken,
  authController.profile
)

router.delete(
  '/delete-account',
  verifyToken,
  authController.deleteAccount
)


// ---------------------
// TASK ROUTES
// ---------------------

router.get(
  '/tasks',
  verifyToken,
  authController.getTasks
)

router.post(
  '/tasks',
  verifyToken,
  authController.saveTasks
)


module.exports = router

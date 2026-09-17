const express = require('express')
const { registerUser, loginUser, getMe, pushSubscribe } = require("../controllers/auth.controller")
const protect = require('../middlewares/protect')
const router = express.Router()


router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/me', protect, getMe)
router.post('/push-subscribe', protect, pushSubscribe)
module.exports = router


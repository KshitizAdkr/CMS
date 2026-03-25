// Auth Routes 
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/login
router.post('/login', authController.login);

// POST /api/auth/signup — register a new patient
router.post('/signup', authController.signup);

module.exports = router;

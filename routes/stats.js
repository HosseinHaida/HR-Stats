const express = require('express');

const { register } = require('../controllers/stats.js');

const verifyAuth = require('../middlewares/verifyAuth.js');

const router = express.Router();

// Routes
router.post('/stats/register', verifyAuth, register);

module.exports = router;

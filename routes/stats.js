const express = require('express');

const {
  register,
  setDaysOff,
  fetchDaysOff,
  fetchTodaysStats,
} = require('../controllers/stats.js');

const verifyAuth = require('../middlewares/verifyAuth.js');

const router = express.Router();

// Routes
router.get('/stats/fetch_stats/:department', verifyAuth, fetchTodaysStats);
router.post('/stats/register', verifyAuth, register);
router.post('/stats/set_days_off', verifyAuth, setDaysOff);
router.get('/stats/days_off/list', verifyAuth, fetchDaysOff);

module.exports = router;

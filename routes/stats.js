const express = require('express');

const {
  register,
  setDaysOff,
  fetchDaysOff,
  fetchTodaysStats,
  approveStats,
  approveADayOff,
} = require('../controllers/stats.js');

const verifyAuth = require('../middlewares/verifyAuth.js');

const router = express.Router();

// Routes
router.post('/stats/fetch_stats', verifyAuth, fetchTodaysStats); // Actually a get
router.post('/stats/register', verifyAuth, register);
router.post('/stats/set_days_off', verifyAuth, setDaysOff);
router.get('/stats/days_off/list', verifyAuth, fetchDaysOff);
router.post('/stats/approve', verifyAuth, approveStats);
router.post('/stats/approve/day_off', verifyAuth, approveADayOff);

module.exports = router;

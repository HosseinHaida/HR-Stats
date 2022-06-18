const express = require('express');

const {
  register,
  setDaysOff,
  fetchDaysOff,
  fetchTodaysStats,
  approveStats,
  approveADayOff,
  addMission,
  fetchMissions,
  addAgent,
  approveMission,
  approveAgent,
  fetchAgents,
} = require('../controllers/stats.js');

const verifyAuth = require('../middlewares/verifyAuth.js');

const router = express.Router();

// Routes
router.post('/stats/fetch_stats', verifyAuth, fetchTodaysStats); // Actually a get
router.post('/stats/register', verifyAuth, register);
router.post('/stats/days_off/add', verifyAuth, setDaysOff);
router.get('/stats/days_off/list', verifyAuth, fetchDaysOff);
router.post('/stats/missions/add', verifyAuth, addMission);
router.get('/stats/missions/list', verifyAuth, fetchMissions);
router.post('/stats/agents/add', verifyAuth, addAgent);
router.get('/stats/agents/list', verifyAuth, fetchAgents);

router.post('/stats/approve', verifyAuth, approveStats);
router.post('/stats/approve/day_off', verifyAuth, approveADayOff);
router.post('/stats/approve/mission', verifyAuth, approveMission);
router.post('/stats/approve/agent', verifyAuth, approveAgent);

module.exports = router;

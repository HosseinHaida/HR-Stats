const express = require('express');

const { uploadExcel, fetchPeople } = require('../controllers/people.js');

const verifyAuth = require('../middlewares/verifyAuth.js');

const router = express.Router();

// Routes

router.post('/people/upload_excel', verifyAuth, uploadExcel);
router.get('/people/list', verifyAuth, fetchPeople);

module.exports = router;

module.exports = router;

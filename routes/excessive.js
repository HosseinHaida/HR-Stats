const express = require('express');

const { uploadDastoorMaddeExcel } = require('../controllers/excessive.js');

const verifyAuth = require('../middlewares/verifyAuth.js');

const router = express.Router();

// Routes
router.post(
  '/excessive/upload_dastoor_madde_excel',
  verifyAuth,
  uploadDastoorMaddeExcel
);

module.exports = router;

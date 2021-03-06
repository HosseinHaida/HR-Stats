const express = require('express');

const {
  uploadExcel,
  fetchPeople,
  insertPerson,
  changeDepartment,
  findPerson,
  changeShobe,
} = require('../controllers/people.js');

const verifyAuth = require('../middlewares/verifyAuth.js');

const router = express.Router();

// Routes
router.post('/people/upload_excel', verifyAuth, uploadExcel);
router.get('/people/list', verifyAuth, fetchPeople);
router.post('/people/insert', verifyAuth, insertPerson);
router.post('/people/change_department', verifyAuth, changeDepartment);
router.post('/people/change_shobe', verifyAuth, changeShobe);
router.get('/people/find', verifyAuth, findPerson);

module.exports = router;

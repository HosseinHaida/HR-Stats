const express = require('express');

const {
  siginUser,
  fetchUsers,
  fetchUser,
  insertUser,
  deleteAuth,
  uploadProfilePhoto,
} = require('../controllers/users.js');

const verifyAuth = require('../middlewares/verifyAuth.js');

const router = express.Router();

// Routes
router.post('/users/insert', verifyAuth, insertUser);
router.post('/auth/signin', siginUser);
router.get('/auth/fetch', verifyAuth, fetchUser);
router.delete(
  '/users/roles/delete/:user_id/:department_id/:role',
  verifyAuth,
  deleteAuth
);
router.post('/auth/upload/profile_photo', verifyAuth, uploadProfilePhoto);
router.get('/users/list', verifyAuth, fetchUsers);

module.exports = router;

module.exports = router;

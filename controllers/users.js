const moment = require('moment');
const {
  hashString,
  validatePassword,
  isEmpty,
  generateUserToken,
  comparePassword,
  doArraysContainTheSame,
} = require('../helpers/validations');
const { catchError } = require('./catchError');
const { errMessages } = require('../helpers/error-messages');
const { successMessage, status } = require('../helpers/status');
var sql = require('msnodesqlv8');

// const multer = require("multer");
// const { upload } = require("./usersPhotoUpload");
// const { userHasScope } = require("./scopesController");

/**
 * Signin
 * @param {object} req
 * @param {object} res
 * @returns {object} user object
 */
const siginUser = async (req, res) => {
  const { userID, password } = req.body;

  if (isEmpty(userID) || isEmpty(password)) {
    return catchError(errMessages.invalidCredentials, 'bad', res);
  }
  if (!validatePassword(password)) {
    return catchError(errMessages.enterValidPassword, 'bad', res);
  }
  try {
    // Find user in DB
    const thisUser = await fetchThisUser(userID, res);
    if (!thisUser) return catchError(errMessages.userNotFound, 'notfound', res);
    // Check if the right password
    if (!comparePassword(thisUser.PasswordHash, password)) {
      return catchError(errMessages.invalidPassword, 'bad', res);
    }
    // Generate token for user
    const token = generateUserToken(
      thisUser.PerNo,
      thisUser.Name,
      thisUser.Family,
      thisUser.NationalID
    );

    delete thisUser.PasswordHash;
    // Create user obj with token && send to client
    // const userRequests = await fetchThisUserRequests(thisUser.id);
    // const userRequestsInbound = await fetchThisUserRequestsInbound(thisUser.id);

    successMessage.user = thisUser;
    // successMessage.user.outbound_requests = userRequests;
    // successMessage.user.inbound_requests = userRequestsInbound;
    successMessage.user.token = token;
    return res.status(status.success).send(successMessage);
  } catch (error) {
    return catchError(errMessages.couldNotFetchUser, 'error', res);
  }
};

/**
 * Fetch User
 * @param {object} req
 * @param {object} res
 * @returns {object} user object
 */
const fetchUser = async (req, res) => {
  const { NationalID, PerNo } = req.user;
  const id = NationalID ? NationalID : PerNo;
  try {
    // Find user in DB
    const thisUser = await fetchThisUser(id);
    // const userRequests = await fetchThisUserRequests(user_id);
    // const userRequestsInbound = await fetchThisUserRequestsInbound(user_id);
    // Check if no one was found
    if (!thisUser) return catchError(errMessages.userNotFound, 'notfound', res);

    delete thisUser.PasswordHash;
    // Create user obj with token && send to client
    successMessage.user = thisUser;
    // successMessage.user.outbound_requests = userRequests;
    // successMessage.user.inbound_requests = userRequestsInbound;
    return res.status(status.success).send(successMessage);
  } catch (error) {
    return catchError(errMessages.operationFailed, 'error', res);
  }
};

/**
 * Fetch user from DB
 * @param {integer} id
 * @returns {object} user
 */
const fetchThisUser = async (id, res) => {
  const query = `select * from Users where PerNo = ${id} or NationalID = ${id}`;
  const connection = await sql.promises.open(process.env.DB_CONNECTION);
  const data = await connection.promises.query(query);
  await connection.promises.close();
  if (data.results[0].length > 0) return data.results[0][0];
  else if (data.results[0].length < 1) return null;
};

module.exports = {
  siginUser,
  fetchUser,
};

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
    // Fetch user permissions
    const thisUserPermissions = await fetchThisUserPermissions(userID);
    // Fetch all departments
    const availDepartments = await fetchDepartments();

    let permissions = {
      permittedDepartments: [],
    };
    thisUserPermissions.forEach((loopPermission) => {
      permissions.permittedDepartments.push({
        label: loopPermission.Label,
        value: loopPermission.DepartmentID,
        permissions: loopPermission.Permissions,
      });
    });

    let departments = [];
    availDepartments.forEach((loopDepartment) => {
      departments.push({
        label: loopDepartment.Label,
        value: loopDepartment.ID,
      });
    });

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
    successMessage.user = thisUser;
    successMessage.user.permissions = permissions;
    successMessage.departments = departments;
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
    const thisUserPermissions = await fetchThisUserPermissions(id);
    const availDepartments = await fetchDepartments();

    let permissions = {
      permittedDepartments: [],
    };
    thisUserPermissions.forEach((loopPermission) => {
      permissions.permittedDepartments.push({
        label: loopPermission.Label,
        value: loopPermission.DepartmentID,
        permissions: loopPermission.Permissions,
      });
    });

    let departments = [];
    availDepartments.forEach((loopDepartment) => {
      departments.push({
        label: loopDepartment.Label,
        value: loopDepartment.ID,
      });
    });

    if (!thisUser) return catchError(errMessages.userNotFound, 'notfound', res);

    delete thisUser.PasswordHash;
    // Create user obj with token && send to client
    successMessage.user = thisUser;
    successMessage.user.permissions = permissions;
    successMessage.departments = departments;
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
  const connection = await sql.promises.open(process.env.STATS_DB_CONNECTION);
  const data = await connection.promises.query(query);
  await connection.promises.close();
  if (data.results[0].length > 0) return data.results[0][0];
  else if (data.results[0].length < 1) return null;
};

/**
 * Fetch user permissions from DB
 * @param {integer} id
 * @returns {object} array of permissions
 */
const fetchThisUserPermissions = async (id, res) => {
  const query = `select * from Auth inner join Departments ON Auth.DepartmentID=Departments.ID where Auth.UserID = ${id}`;
  const connection = await sql.promises.open(process.env.STATS_DB_CONNECTION);
  const data = await connection.promises.query(query);
  await connection.promises.close();
  if (data.results[0].length > 0) return data.results[0];
  else if (data.results[0].length < 1) return null;
};

/**
 * Fetch departments from DB
 * @param {integer} id
 * @returns {object} array of departments
 */
const fetchDepartments = async (res) => {
  const query = `select * from Departments`;
  const connection = await sql.promises.open(process.env.STATS_DB_CONNECTION);
  const data = await connection.promises.query(query);
  await connection.promises.close();
  if (data.results[0].length > 0) return data.results[0];
  else if (data.results[0].length < 1) return null;
};

module.exports = {
  siginUser,
  fetchUser,
};

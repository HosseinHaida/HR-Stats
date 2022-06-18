// const moment = require('moment');
const {
  hashString,
  validatePassword,
  isEmpty,
  generateUserToken,
  comparePassword,
  // doArraysContainTheSame,
} = require('../helpers/validations');
const { catchError } = require('./catchError');
const { errMessages } = require('../helpers/error-messages');
const { successMessage, status } = require('../helpers/status');
var sql = require('msnodesqlv8');

const multer = require('multer');
const { upload } = require('./profilePhotoUpload');
const { signatureUpload } = require('./signatureUpload');

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
    const thisUser = await fetchThisUser(userID);

    if (!thisUser) return catchError(errMessages.userNotFound, 'bad', res);

    // Fetch user permissions
    const thisUserRoles = await fetchThisUserRoles(userID);
    // Fetch all departments
    const availDepartments = await fetchDepartments();

    let departments = [];
    availDepartments.forEach((loopDepartment) => {
      departments.push({
        label: loopDepartment.Label,
        value: loopDepartment.ID,
      });
    });

    let permissions = {
      permittedDepartments: [],
      authedDepartments: [],
    };

    // console.log('salam: ', thisUserRoles);
    if (!thisUserRoles) catchError(errMessages.noAuthFound, 'notfound', res);

    thisUserRoles.forEach((loopPermission) => {
      permissions.authedDepartments.push({
        label: loopPermission.Label,
        value: loopPermission.DepartmentID,
        role: loopPermission.Role,
      });
    });
    if (thisUser.Department !== process.env.HR_DEPARTMENT_ID) {
      permissions.permittedDepartments = permissions.authedDepartments;
    } else {
      permissions.permittedDepartments = departments;
    }

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
    console.log('Signin Error: ', error);
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
  const id = PerNo ? PerNo : NationalID;
  try {
    // Find user in DB
    const thisUser = await fetchThisUser(id);

    if (!thisUser) return catchError(errMessages.userNotFound, 'bad', res);

    const thisUserRoles = await fetchThisUserRoles(id);
    const availDepartments = await fetchDepartments();

    let departments = [];
    availDepartments.forEach((loopDepartment) => {
      departments.push({
        label: loopDepartment.Label,
        value: loopDepartment.ID,
      });
    });

    let permissions = {
      permittedDepartments: [],
      authedDepartments: [],
    };

    thisUserRoles.forEach((loopPermission) => {
      permissions.authedDepartments.push({
        label: loopPermission.Label,
        value: loopPermission.DepartmentID,
        role: loopPermission.Role,
      });
    });
    if (thisUser.Department !== process.env.HR_DEPARTMENT_ID) {
      permissions.permittedDepartments = permissions.authedDepartments;
    } else {
      permissions.permittedDepartments = departments;
    }
    // fetch department head from Auth and Users tables
    const headFetchQuery = `SELECT * FROM Users INNER JOIN Auth on Auth.UserID = Users.PerNo WHERE Auth.Role = 'head' AND Auth.DepartmentID = '${thisUser.Department}'`;
    let depHead = null;
    try {
      const connection = await sql.promises.open(
        process.env.STATS_DB_CONNECTION
      );
      const result = await connection.promises.query(headFetchQuery);
      if (result.first.length > 0) depHead = result.first[0];
      await connection.promises.close();
    } catch (error) {}

    delete thisUser.PasswordHash;
    // Create user obj with token && send to client
    successMessage.user = thisUser;
    successMessage.user.head = depHead;
    successMessage.user.permissions = permissions;
    successMessage.departments = departments;
    return res.status(status.success).send(successMessage);
  } catch (error) {
    return catchError(errMessages.operationFailed, 'error', res);
  }
};

/**
 * Insert new User
 * @param {object} req
 * @param {object} res
 * @returns {object} return success message
 */
const insertUser = async (req, res) => {
  const { NationalID, PerNo } = req.user;
  const id = PerNo ? PerNo : NationalID;
  try {
    const thisUser = await fetchThisUser(id);
    if (thisUser.Department !== process.env.HR_DEPARTMENT_ID)
      return catchError(errMessages.notAuthorizedToInsertUser, 'error', res);
  } catch (error) {
    return catchError(errMessages.couldNotFetchUser, 'error', res);
  }
  const {
    isSoldier,
    Name,
    Family,
    NewPerNo,
    NewNationalID,
    Rank,
    Department,
    Role,
    Password,
  } = req.body;
  // const created_at = moment(new Date());

  if (
    (isEmpty(NewPerNo) && !isSoldier) ||
    isEmpty(NewNationalID) ||
    isEmpty(Rank) ||
    isEmpty(Department) ||
    isEmpty(Password) ||
    isEmpty(Role)
  ) {
    return catchError(errMessages.emptyFields, 'bad', res);
  }

  // If User isSoldier make NID his PerNo
  let userPerNo = '';
  if (isSoldier) userPerNo = NewNationalID;
  else userPerNo = NewPerNo;

  let PersonIsSoldier = isSoldier ? '1' : '0';

  const password_hash = hashString(Password);

  try {
    const query = `INSERT INTO Users (Name, Family, PerNo, NationalID, Department, Rank, IsSoldier, PasswordHash) VALUES (N'${Name}', N'${Family}', '${userPerNo}', '${NewNationalID}', '${Department}', '${Rank}', '${PersonIsSoldier}', '${password_hash}')`;
    const authQuery = `INSERT INTO Auth (UserID, DepartmentID, Role) VALUES (N'${userPerNo}', N'${Department}', '${Role}')`;
    const connection = await sql.promises.open(process.env.STATS_DB_CONNECTION);
    await connection.promises.query(query);
    await connection.promises.query(authQuery);
    await connection.promises.close();

    return res.status(status.success).send();
  } catch (error) {
    if (error.code === 2627)
      return catchError(errMessages.userPerNoDubplicate, 'bad', res);
    console.log(error);
    return catchError(errMessages.userInsertFailed, 'error', res);
  }
};

/**
 * Delete Auth
 * @param {object} req
 * @param {object} res
 * @returns {object} comments array
 */
const deleteAuth = async (req, res) => {
  const { NationalID, PerNo } = req.user;
  const id = PerNo ? PerNo : NationalID;
  const { user_id, department_id, role } = req.params;

  if (isEmpty(user_id) || isEmpty(department_id) || isEmpty(role)) {
    return catchError(errMessages.emptyFieldsDetected, 'bad', res);
  }
  try {
    const thisUser = await fetchThisUser(id);
    if (!thisUser)
      return catchError(errMessages.couldNotFetchUser, 'error', res);

    // Check if user has permission to delete Auth
    if (thisUser.Department === process.env.HR_DEPARTMENT_ID) {
      const rolesInThisDep = await fetchUserAuthInDepartment(
        id,
        process.env.HR_DEPARTMENT_ID
      );

      if (!rolesInThisDep)
        return catchError(errMessages.couldNotFetchUser, 'bad', res);

      let userRoles = [];
      rolesInThisDep.forEach((role) => {
        userRoles.push(role.Role);
      });

      if (
        userRoles.indexOf('can_do_all') === -1 &&
        userRoles.indexOf('head') === -1 &&
        userRoles.indexOf('succ') === -1
      ) {
        return catchError(errMessages.permissionDeniedOnAuthDelete, 'bad', res);
      }
    } else {
      return catchError(errMessages.permissionDeniedOnAuthDelete, 'bad', res);
    }

    try {
      // Query to delete the Auth
      const query = `delete from Auth where UserID='${user_id}' and DepartmentID='${department_id}' and Role='${role}'`;
      const connection = await sql.promises.open(
        process.env.STATS_DB_CONNECTION
      );
      await connection.promises.query(query);
      // Count user roles from Auth
      let usrRlesCntQ = `select count(*) from Auth where UserID=${user_id}`;
      const userRolesCount = await connection.promises.query(usrRlesCntQ);
      // Delete the user if there are no roles for him anymore
      if (Number(userRolesCount.first[0]['']) < 1) {
        const userDeleteQuery = `delete from Users where PerNo='${user_id}'`;
        await connection.promises.query(userDeleteQuery);
      }
      await connection.promises.close();
    } catch (err) {
      console.log(err);
      return catchError(errMessages.authDeleteFailed, 'error', res);
    }
    // await db("location_comments").where({ id: comment_id }).del();
    // successMessage.message = "Comment deleted";
    // Create comments array && send to client
    await fetchUsers(req, res);
    // return res.status(status.success).send(successMessage);
  } catch (error) {
    return catchError(errMessages.operationFailed, 'error', res);
  }
};

/**
 * Fetch users list (+ [search])
 * @param {object} req
 * @param {object} res
 * @returns {object} people array
 */
const fetchUsers = async (req, res) => {
  const { department, search_text } = req.query;
  const { NationalID, PerNo } = req.user;
  const userId = PerNo ? PerNo : NationalID;

  try {
    // Query to fetch people from DB
    let query =
      'select Users.Name, Users.Family, Users.Father, Users.NationalID, Users.Signature, Users.SuccessorSignature, Users.Rank, Users.Department, Users.IsSoldier, Users.PerNo, Users.Photo, Auth.Role, Auth.DepartmentID as AuthDepartmentID from Auth inner join Users on Auth.UserID=Users.PerNo';

    let queryHasWhere = false;

    if (!isEmpty(search_text)) {
      query += ' where(';
      queryHasWhere = true;
      const where = (column) => ` ${column} LIKE N'%${search_text}%' or`;
      const whereWithoutOr = (column) => ` ${column} LIKE N'%${search_text}%')`;
      // Change query to fetch users based on search_text
      query += where('Name');
      query += where('Family');
      query += where('PerNo');
      query += whereWithoutOr('NationalID');
    }

    if (!isEmpty(department)) {
      if (queryHasWhere) {
        query += ` and Department = '${department}'`;
      } else {
        query += ` where Department = '${department}'`;
      }
    }

    const connection = await sql.promises.open(process.env.STATS_DB_CONNECTION);

    // Actually query the DB for users
    const data = await connection.promises.query(query);
    const users = data.results[0].length > 0 ? data.results[0] : [];

    await connection.promises.close();

    // Send response
    successMessage.users = users;
    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.log(error);
    return catchError(errMessages.peopleFetchFailed, 'error', res);
  }
};

/**
 * Upload user profile photo
 * @param {object} req
 * @param {object} res
 * @returns {object} success message
 */
const uploadProfilePhoto = async (req, res) => {
  const { NationalID, PerNo } = req.user;
  const id = PerNo ? PerNo : NationalID;
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return catchError(errMessages.uploadFailed, 'error', res);
    } else if (err) {
      return catchError(errMessages.errWhileUpload, 'error', res);
    }
    // Everything went fine with multer and uploading
    const photoName = req.photo_name;
    if (!photoName) {
      return catchError(errMessages.failedSavingPhoto, 'error', res);
    }
    try {
      const photoPath =
        process.env.SERVER_URL +
        ':' +
        process.env.PORT +
        '/' +
        process.env.UPLOAD_DIR_PROFILES +
        photoName;

      let query = `UPDATE Users SET Photo='${photoPath}' WHERE PerNo='${id}'`;
      const connection = await sql.promises.open(
        process.env.STATS_DB_CONNECTION
      );
      await connection.promises.query(query);
      await connection.promises.close();

      successMessage.photo_path = photoPath;
      return res.status(status.success).send(successMessage);
    } catch (error) {
      if (error.message)
        return catchError(
          error.message.substring(error.message.lastIndexOf(']') + 1),
          'error',
          res
        );
      else return catchError(errMessages.operationFailed, 'error', res);
    }
  });
};

/**
 * Upload user signature photo
 * @param {object} req
 * @param {object} res
 * @returns {object} success message
 */
const uploadSignature = async (req, res) => {
  const { NationalID, PerNo } = req.user;
  const id = PerNo ? PerNo : NationalID;
  signatureUpload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return catchError(errMessages.uploadFailed, 'error', res);
    } else if (err) {
      return catchError(errMessages.errWhileUpload, 'error', res);
    }
    // Everything went fine with multer and uploading
    const photoName = req.photo_name;
    if (!photoName) {
      return catchError(errMessages.failedSavingPhoto, 'error', res);
    }
    try {
      const photoPath =
        process.env.SERVER_URL +
        ':' +
        process.env.PORT +
        '/' +
        process.env.UPLOAD_DIR_SIGNATURES +
        photoName;

      let query = `UPDATE Users SET Signature='${photoPath}' WHERE PerNo='${id}'`;
      const connection = await sql.promises.open(
        process.env.STATS_DB_CONNECTION
      );
      await connection.promises.query(query);
      await connection.promises.close();

      successMessage.signature_path = photoPath;
      return res.status(status.success).send(successMessage);
    } catch (error) {
      if (error.message)
        return catchError(
          error.message.substring(error.message.lastIndexOf(']') + 1),
          'error',
          res
        );
      else return catchError(errMessages.operationFailed, 'error', res);
    }
  });
};

/**
 * Update user password
 * @param {object} req
 * @param {object} res
 * @returns {object} success message
 */
const updatePassword = async (req, res) => {
  const { NationalID, PerNo } = req.user;
  const id = PerNo ? PerNo : NationalID;
  const { oldPass, newPass } = req.body;
  try {
    const thisUser = await fetchThisUser(id);

    if (isEmpty(oldPass) || isEmpty(newPass)) {
      return catchError(errMessages.emptyFields, 'bad', res);
    }

    if (!thisUser) return catchError(errMessages.userNotFound, 'bad', res);

    if (!comparePassword(thisUser.PasswordHash, oldPass))
      return catchError(errMessages.invalidPassword, 'bad', res);

    const newHashedPassword = hashString(newPass);
    console.log(oldPass, newPass);
    const query = `update Users set PasswordHash = N'${newHashedPassword}' where PerNo = N'${id}' or NationalID = N'${id}'`;
    const connection = await sql.promises.open(process.env.STATS_DB_CONNECTION);
    const data = await connection.promises.query(query);
    await connection.promises.close();

    return res.status(status.success).send();
  } catch (error) {
    if (error.message) return catchError(error.message, 'error', res);
    else return catchError(errMessages.updatePassFailed, 'error', res);
  }
};

/**
 * Fetch user from DB
 * @param {integer} id
 * @returns {object} user
 */
const fetchThisUser = async (id) => {
  const query = `select * from Users where PerNo = N'${id}' or NationalID = N'${id}'`;
  const connection = await sql.promises.open(process.env.STATS_DB_CONNECTION);
  const data = await connection.promises.query(query);
  await connection.promises.close();
  if (data.results[0].length > 0) return data.results[0][0];
  else if (data.results[0].length < 1) return null;
};

/**
 * Fetch user roles from DB
 * @param {integer} id
 * @returns {object} array of permissions
 */
const fetchThisUserRoles = async (id) => {
  const query = `select * from Auth inner join Departments ON Auth.DepartmentID=Departments.ID where Auth.UserID = N'${id}'`;
  const connection = await sql.promises.open(process.env.STATS_DB_CONNECTION);
  const data = await connection.promises.query(query);
  await connection.promises.close();
  if (data.results[0].length > 0) return data.results[0];
  else if (data.results[0].length < 1) return null;
};

/**
 * Fetch user permissions from DB
 * @param {integer} id
 * @returns {object} array of permissions
 */
const fetchUserAuthInDepartment = async (id, depID, res) => {
  const query = `select Role from Auth where UserID = N'${id}' and DepartmentID = N'${depID}'`;
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
  fetchUsers,
  insertUser,
  deleteAuth,
  uploadProfilePhoto,
  uploadSignature,
  updatePassword,
};

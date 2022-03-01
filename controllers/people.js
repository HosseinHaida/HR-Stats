const moment = require('moment');
const readXlsxFile = require('read-excel-file/node');
const {
  isEmpty,
  //   doArraysContainTheSame,
} = require('../helpers/validations');
const { catchError } = require('./catchError');
const { errMessages } = require('../helpers/error-messages');
const { successMessage, status } = require('../helpers/status');
var sql = require('msnodesqlv8');

const multer = require('multer');
const { upload } = require('./excelUpload');
// const { userHasScope } = require("./scopesController");

/**
 * Upload and add people from excel
 * @param {object} req
 * @param {object} res
 * @returns {object} success message
 */
const uploadExcel = async (req, res) => {
  const { NationalID, PerNo } = req.user;
  const id = NationalID ? NationalID : PerNo;
  try {
    // Fetch user photo column from users to see
    // if the user already has a photo assigned
    const thisUser = await fetchThisUser(id, res);
    if (thisUser.Department !== '1')
      return catchError(errMessages.notAuthorizedToInsertExcel, 'error', res);
  } catch (error) {
    return catchError(errMessages.couldNotFetchUser, 'error', res);
  }
  // Actually do the upload
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return catchError(errMessages.uploadFailed, 'error', res);
    } else if (err) {
      return catchError(errMessages.errWhileUpload, 'error', res);
    }
    // Everything went fine with multer and uploading
    const excelName = req.uploaded_excel_file_name;
    if (!excelName) {
      return catchError(errMessages.failedSavingExcel, 'error', res);
    }
    try {
      // Generate photo URL to be saved with user in DB
      //   const path =
      //     process.env.SERVER_URL +
      //     // ':' +
      //     // process.env.PORT +
      //     '/static/' +
      //     process.env.UPLOAD_DIR_EXCEL +
      //     excelName;
      //   const updated_at = moment(new Date());

      // File path.
      readXlsxFile(
        UPLOAD_DIR + UPLOAD_DIR_EXCEL + uploaded_excel_file_name
      ).then((rows) => {
        // `rows` is an array of rows
        // each row being an array of cells.
        console.log('rows in excel are: ', rows);
      });

      //   successMessage.excel_path = path;
      return res.status(status.success).send(successMessage);
    } catch (error) {
      return catchError(errMessages.operationFailed, 'error', res);
    }
  });
};

/**
 * Fetch people list ( + [search] implemented)
 * @param {object} req
 * @param {object} res
 * @returns {object} people array
 */
const fetchPeople = async (req, res) => {
  const { page, search_text } = req.query;
  const { NationalID, PerNo } = req.user;
  //   const userId = NationalID ? NationalID : PerNo;

  //   let userPermissions;

  //   try {
  //     userPermissions = await fetchThisUserPermissions(userId);

  //     console.log('user permissions are: ', userPermissions);
  //   } catch (error) {
  //     return catchError(errMessages.userAuthorizationFailed, 'error', res);
  //   }

  try {
    // Query to fetch people from DB
    let query = `select PerNo as PerNo, ShRank as Rank, Acp_Name as Name, Acp_Fami as Family, NID as NationalID, Yegan as Department from NameList`;
    // Query for number of people
    let peopleCountQuery = `select count(*) from NameList`;

    if (search_text !== 'null' && !isEmpty(search_text)) {
      const where = (column) => ` ${column} LIKE N'%${search_text}%' or`;
      const whereWithoutOr = (column) => ` ${column} LIKE N'%${search_text}%'`;
      query += ' where';
      peopleCountQuery += ' where';
      // Change query to fetch users based on search_text
      query += where('Acp_Name');
      peopleCountQuery += where('Acp_Name');
      query += where('Acp_Fami');
      peopleCountQuery += where('Acp_Fami');
      query += where('PerNo');
      peopleCountQuery += where('PerNo');
      query += whereWithoutOr('NID');
      peopleCountQuery += whereWithoutOr('NID');
    }

    const connection = await sql.promises.open(process.env.DAST_DB_CONNECTION);
    const dataCount = await connection.promises.query(peopleCountQuery);

    // If type of users is set to 'friends'
    // if (type === 'friends') {
    //   const { user_id } = req.user;
    //   const user = await db
    //     .select('friends')
    //     .from('users')
    //     .where({ id: user_id })
    //     .first();
    //   query.whereIn('id', user.friends);
    // }
    // If type of users is set to 'close'
    // if (type === 'close') {
    //   const { user_id } = req.user;
    //   const user = await db
    //     .select('close_friends')
    //     .from('users')
    //     .where({ id: user_id })
    //     .first();
    //   query.whereIn('id', user.close_friends);
    // }
    // If type of users is set to 'requests'
    // if (type === 'requests') {
    //   const { user_id } = req.user;
    //   const userInRequests = await fetchThisUserRequestsInbound(user_id);
    //   query.whereIn('id', userInRequests);
    // }

    // Calculate number of users and pages
    const totalCount = Number(dataCount.first[0]['']);

    // Actually query the DB for users
    const data = await connection.promises.query(query);
    query += ' order by Acp_Name';
    const people = data.results[0].length > 0 ? data.results[0] : [];
    await connection.promises.close();

    // Send response
    successMessage.people = people;
    successMessage.total = totalCount;
    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.log(error);
    return catchError(errMessages.peopleFetchFailed, 'error', res);
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
  const query = `select * from Auth where UserID = ${id}`;
  const connection = await sql.promises.open(process.env.STATS_DB_CONNECTION);
  const data = await connection.promises.query(query);
  await connection.promises.close();
  if (data.results[0].length > 0) return data.results[0];
  else if (data.results[0].length < 1) return null;
};

module.exports = {
  uploadExcel,
  fetchPeople,
};

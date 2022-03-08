// const moment = require('moment');
const xlsxj = require('xlsx-to-json');
var path = require('path');
// const readXlsxFile = require('read-excel-file/node');
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
    const thisUser = await fetchThisUser(id, res);
    if (thisUser.Department !== process.env.HR_DEPARTMENT_ID)
      return catchError(
        errMessages.notAuthorizedToInsertPersonnel,
        'error',
        res
      );
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
      const excelPath =
        process.env.SERVER_URL +
        ':' +
        process.env.PORT +
        '/' +
        process.env.UPLOAD_DIR_EXCEL +
        excelName;

      let query = '';

      xlsxj(
        {
          input:
            path.join(__dirname, '../') +
            process.env.EXCELS_STATIC_PATH +
            excelName,
          output:
            path.join(__dirname, '../') +
            process.env.EXCELS_STATIC_PATH +
            excelName +
            '.json',
        },
        function (err, result) {
          if (err) {
            console.error(err);
          } else {
            // File is turned into a json and
            // now we are creating a query for DB
            const columns = [];
            Object.keys(result[0]).forEach((excelColumnName) => {
              columns.push(excelColumnName);
            });

            const columnsInQuery = '(' + columns.join(',') + ')';
            let rowsInQuery = '';

            // Loop through excel rows and get values
            result.forEach((excelRow) => {
              let queryColumnValues = [];
              Object.values(excelRow).forEach((rowColumnValue) => {
                queryColumnValues.push(`N'${rowColumnValue}'`);
              });
              rowsInQuery += '(' + queryColumnValues.join(',') + '),';
            });

            rowsInQuery = rowsInQuery.slice(0, -1);
            query = `INSERT INTO NameList ${columnsInQuery} VALUES ${rowsInQuery}`;
          }
        }
      );

      const connection = await sql.promises.open(
        process.env.DAST_DB_CONNECTION
      );
      await connection.promises.query(query);
      await connection.promises.close();

      successMessage.excel_path = excelPath;
      return res.status(status.success).send(successMessage);
    } catch (error) {
      console.log(error);
      return catchError(errMessages.operationFailed, 'error', res);
    }
  });
};

/**
 * Insert new person
 * @param {object} req
 * @param {object} res
 * @returns {object} return success message
 */
const insertPerson = async (req, res) => {
  const { NationalID, PerNo } = req.user;
  const id = NationalID ? NationalID : PerNo;
  try {
    const thisUser = await fetchThisUser(id, res);
    if (thisUser.Department !== process.env.HR_DEPARTMENT_ID)
      return catchError(
        errMessages.notAuthorizedToInsertPersonnel,
        'error',
        res
      );
  } catch (error) {
    return catchError(errMessages.couldNotFetchUser, 'error', res);
  }
  const { isSoldier, Name, Family, NewPerNo, NewNationalID, Rank, Department } =
    req.body;
  // const created_at = moment(new Date());

  if (
    (isEmpty(NewPerNo) && !isSoldier) ||
    isEmpty(NewNationalID) ||
    isEmpty(Rank) ||
    isEmpty(Department)
  ) {
    return catchError(errMessages.emptyFields, 'bad', res);
  }

  // If person isSoldier make NID his PerNo
  let personPerNo = '';
  if (isSoldier) personPerNo = NewNationalID;
  else personPerNo = NewPerNo;

  let PersonIsSoldier = isSoldier ? '1' : '0';

  try {
    const query = `INSERT INTO NameList (Acp_Name, Acp_Fami, PerNo, NID, Department, ShRank, IsSoldier) VALUES (N'${Name}', N'${Family}', '${personPerNo}', '${NewNationalID}', '${Department}', '${Rank}', '${PersonIsSoldier}')`;
    const connection = await sql.promises.open(process.env.DAST_DB_CONNECTION);
    await connection.promises.query(query);
    await connection.promises.close();

    return res.status(status.success).send();
  } catch (error) {
    if (error.code === 2627)
      return catchError(errMessages.personPerNoDubplicate, 'bad', res);
    console.log(error);
    return catchError(errMessages.personInsertFailed, 'error', res);
  }
};

/**
 * Fetch people list (+ [search] + [filter department])
 * @param {object} req
 * @param {object} res
 * @returns {object} people array
 */
const fetchPeople = async (req, res) => {
  const { search_text, departments } = req.query;
  const { NationalID, PerNo } = req.user;
  const id = NationalID ? NationalID : PerNo;

  const thisUserRoles = await fetchThisUserRoles(id);
  const thisUser = await fetchThisUser(id);

  let permittedDepartments = [];

  thisUserRoles.forEach((loopPermission) => {
    permittedDepartments.push(loopPermission.DepartmentID);
  });

  try {
    // Query to fetch people from DB
    let query = `select PerNo as PerNo, ShRank as Rank, Acp_Name as Name, Acp_Fami as Family, NID as NationalID, Department as Department, IsSoldier as IsSoldier from NameList`;
    // Query for number of people
    let peopleCountQuery = `select count(*) from NameList`;
    let queryHasWhere = false;

    // If user is not in HR
    if (thisUser.Department !== process.env.HR_DEPARTMENT_ID) {
      // Check if user has no permittedDepartments then return nothing
      if (permittedDepartments.length === 0)
        return catchError(errMessages.noPermittedDepartments, 'bad', res);
      else {
        query += ` where (Department in (${permittedDepartments.join(',')})`;
        peopleCountQuery += ` where (Department in (${permittedDepartments.join(
          ','
        )})`;
        queryHasWhere = true;
      }
    }

    // Check if user wants to see personnel in a particular department
    if (!isEmpty(departments)) {
      if (queryHasWhere) {
        query += ` and Department in (${departments}))`;
        peopleCountQuery += ` and Department in (${departments}))`;
      } else {
        query += ` where Department in (${departments})`;
        peopleCountQuery += ` where Department in (${departments})`;
      }
    } else {
      // Check to close paranthesis on permittedDepartments where clause
      if (queryHasWhere) {
        query += ')';
        peopleCountQuery += ')';
      }
    }

    // Where clause for the search text
    if (!isEmpty(search_text)) {
      if (queryHasWhere) {
        query += ' and(';
        peopleCountQuery += ' and(';
      } else {
        query += ' where(';
        peopleCountQuery += ' where(';
        queryHasWhere = true;
      }

      const where = (column) => ` ${column} LIKE N'%${search_text}%' or`;
      const whereWithoutOr = (column) => ` ${column} LIKE N'%${search_text}%')`;

      // Change query to fetch people based on search_text
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

    // Calculate number of people and pages
    const totalCount = Number(dataCount.first[0]['']);

    // Actually query the DB for people
    const data = await connection.promises.query(query);
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
 * Fetch user roles from DB
 * @param {integer} id
 * @returns {object} array of permissions
 */
const fetchThisUserRoles = async (id, res) => {
  const query = `select * from Auth inner join Departments ON Auth.DepartmentID=Departments.ID where Auth.UserID = ${id}`;
  const connection = await sql.promises.open(process.env.STATS_DB_CONNECTION);
  const data = await connection.promises.query(query);
  await connection.promises.close();
  if (data.results[0].length > 0) return data.results[0];
  else if (data.results[0].length < 1) return null;
};

module.exports = {
  uploadExcel,
  fetchPeople,
  insertPerson,
};

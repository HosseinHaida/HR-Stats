// const { isEmpty } = require('../helpers/validations');
const { catchError } = require('./catchError');
const { errMessages } = require('../helpers/error-messages');
const { successMessage, status } = require('../helpers/status');
var sql = require('msnodesqlv8');

const xlsxj = require('xlsx-to-json');
var path = require('path');

const multer = require('multer');
const { upload } = require('./excelUpload');

/**
 * Upload and add dastoor madde content from excel
 * @param {object} req
 * @param {object} res
 * @returns {object} success message
 */
const uploadDastoorMaddeExcel = async (req, res) => {
  const { NationalID, PerNo } = req.user;
  const id = NationalID ? NationalID : PerNo;
  const { madde } = req.query;
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
            query = `INSERT INTO ${madde} ${columnsInQuery} VALUES ${rowsInQuery}`;
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
  uploadDastoorMaddeExcel,
};

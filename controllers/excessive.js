// const { isEmpty } = require('../helpers/validations');
const { catchError } = require('./catchError');
const { errMessages } = require('../helpers/error-messages');
const { successMessage, status } = require('../helpers/status');
const { maddeHaCols, maddeHaNumbers, ranks } = require('../helpers/variables');
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
  const id = PerNo ? PerNo : NationalID;
  const { madde } = req.query;
  // Check user department ID
  let thisUser = null;
  try {
    thisUser = await fetchThisUser(id);
    if (thisUser.Department !== process.env.HR_DEPARTMENT_ID)
      return catchError(errMessages.notInHR, 'error', res);
  } catch (error) {
    return catchError(errMessages.couldNotFetchUser, 'error', res);
  }

  // Check user permission
  try {
    const thisUserRoles = await fetchThisUserRoles(id);
    let isPermitted = false;
    thisUserRoles.forEach((loopPermission) => {
      if (
        loopPermission.Role === 'can_upload_dastoor' ||
        loopPermission.Role === 'can_do_all'
      )
        isPermitted = true;
    });
    if (!isPermitted)
      return catchError(errMessages.notPermittedToUploadDastoor, 'bad', res);
  } catch (error) {
    console.log(error);
    return catchError(errMessages.authFetchFailed, 'error', res);
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

      let queries = [];
      let columnsInQuery = '';
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
        async function (err, result) {
          if (err) {
            console.error(err);
          } else {
            // File is turned into a json and
            // now we are creating a query for DB
            const columns = [];
            Object.keys(result[0]).forEach((excelColumnName) => {
              if (excelColumnName !== 'متن نامه')
                columns.push(
                  maddeHaCols[maddeHaNumbers[madde].number][excelColumnName]
                );
            });
            // Common Extra columns to be filled for all rows
            columns.push('Dastoor');
            columns.push('Madde');
            columns.push('Eghdamgar');
            columns.push('TarikhSabt');
            columns.push('Date');
            columns.push('TaidEghdamgar');
            columns.push('TaidRaisShobe');
            columns.push('TaidJaneshin');
            columns.push('TaidRais');
            columns.push('TaidRaisDastoor');
            columns.push('Janeshin');
            columns.push('Rais');
            columns.push('RaisDastoor');
            columns.push('OnvanShobe');
            columns.push('Shobe');
            columns.push('EmzaEghdamgar');
            columns.push('EmzaRaisShobe');
            columns.push('EmzaJaneshin');
            columns.push('EmzaRais');
            columns.push('EmzaRaisDastoor');
            columns.push('NamoNeshan');
            columns.push('GirandeCheck');
            columns.push('Girande2Check');
            columns.push('Girande3Check');
            columns.push('Girande4Check');
            columns.push('Girande5Check');
            columns.push('Girande6Check');
            columns.push('Girande7Check');
            columns.push('Girande8Check');
            columns.push('ToReport');
            columns.push('TozihatGozareshDastoor');

            columnsInQuery = '(' + columns.join(',') + ')';

            // Extra column values for all the rows (from DB)
            let dastoorVal,
              maddeVal,
              eghdamgarVal,
              TarikhSabtVal,
              TaidEghdamgarVal,
              TaidRaisShobeVal,
              TaidJaneshinVal,
              TaidRaisVal,
              TaidRaisDastoor,
              OnvanShobeVal,
              EmzaEghdamgarVal,
              JaneshinVal,
              EmzaJaneshinVal,
              RaisVal,
              EmzaRaisVal,
              RaisDastoorVal,
              EmzaRaisDastoorVal,
              EmzaRaisShobeVal;

            try {
              const connection = await sql.promises.open(
                process.env.DAST_DB_CONNECTION
              );
              const tblSabetRes = await connection.promises.query(
                `SELECT * FROM tblSabet`
              );
              const tblSelseleRes = await connection.promises.query(
                `SELECT * FROM Selsele`
              );
              const userFetchedFromMembers = await connection.promises.query(
                `SELECT * FROM member WHERE idp = N'${id}'`
              );
              await connection.promises.close();
              if (userFetchedFromMembers.first.length < 1)
                return catchError(
                  errMessages.couldNotFetchUser,
                  'notfound',
                  res
                );
              dastoorVal = tblSabetRes.first[0]['dastoorMamoriat'];
              maddeVal = maddeHaNumbers[madde].number;
              eghdamgarVal = ranks[thisUser.Rank] + ' ' + thisUser.Family;
              TarikhSabtVal = new Date().toLocaleDateString('fa-IR');
              TaidEghdamgarVal = 1;
              TaidRaisShobeVal = 0;
              TaidJaneshinVal = 0;
              TaidRaisVal = 0;
              TaidRaisDastoor = 0;
              OnvanShobeVal = thisUser.Branch;
              EmzaEghdamgarVal =
                'file:///C:\\\\Online\\\\Images\\\\Emza\\\\' +
                userFetchedFromMembers.first[0].Emza;

              tblSelseleRes.first.forEach((selseleMember) => {
                // Set rais shobe emza
                if (selseleMember.Shobe === thisUser.Branch)
                  EmzaRaisShobeVal =
                    'file:///C:\\\\Online\\\\Images\\\\Emza\\\\' +
                    selseleMember.EmzaRais;

                // Set props for Head
                if (selseleMember.SematRias === 'مدیریت نیروی انسانی') {
                  RaisVal = selseleMember.KhatEmzaRais;
                  EmzaRaisVal =
                    'file:///C:\\\\Online\\\\Images\\\\Emza\\\\' +
                    selseleMember.EmzaRais;
                }
                // Set props for Successor
                if (selseleMember.SematRias === 'جانشین نیروی انسانی') {
                  JaneshinVal = selseleMember.KhatEmzaRais;
                  EmzaJaneshinVal =
                    'file:///C:\\\\Online\\\\Images\\\\Emza\\\\' +
                    selseleMember.EmzaRais;
                }
                // Set props for Dastoor head
                if (selseleMember.SematRias === 'رئیس شعبه دستور') {
                  RaisDastoorVal = selseleMember.KhatEmzaRais;
                  EmzaRaisDastoorVal =
                    'file:///C:\\\\Online\\\\Images\\\\Emza\\\\' +
                    selseleMember.EmzaRais;
                }
              });
            } catch (error) {
              return catchError(
                errMessages.metaFetchForDastoorFailed,
                'error',
                res
              );
            }
            // Fetch people in excel rows from NameList
            let people = [];
            for (const excelRow of result) {
              people.push(excelRow['شماره پرسنلی']);
            }
            let listOfPerNos = people.join("','");
            const connection = await sql.promises.open(
              process.env.DAST_DB_CONNECTION
            );
            const namONeshanHaResult = await connection.promises.query(
              `SELECT ShRank, Acp_Name, Acp_Fami, PerNo FROM NameList WHERE PerNo in ('${listOfPerNos}')`
            );
            await connection.promises.close();
            // Create a map with an index of peoples perNos
            let namONeshanMap = Object.assign(
              {},
              ...namONeshanHaResult.first.map((a) => ({
                [a['PerNo']]: a,
              }))
            );
            const chunkSize = 50;
            for (let i = 0; i <= result.length; i += chunkSize) {
              const chunk = result.slice(i, i + chunkSize);
              let rowsInQuery = '';
              // Loop through excel rows and get values
              for (const excelRow of chunk) {
                let queryColumnValues = [];
                Object.entries(excelRow).forEach(([key, val]) => {
                  if (key !== 'متن نامه') queryColumnValues.push(`N'${val}'`);
                });

                const rowPerNo = excelRow['شماره پرسنلی'];
                let personRank = '';
                if (namONeshanMap[rowPerNo])
                  personRank = namONeshanMap[rowPerNo]['ShRank'];
                else
                  return catchError(
                    errMessages.personWithPerNo +
                      rowPerNo +
                      ' یافت نشد [درج اکسل ناموفق]',
                    'error',
                    res
                  );
                // const rowPerNo = '254159857';
                // Assign the NamoNeshan from the namONeshanMap that we created
                let NamoNeshan =
                  ranks[personRank] +
                  ' ' +
                  namONeshanMap[rowPerNo]['Acp_Name'] +
                  ' ' +
                  namONeshanMap[rowPerNo]['Acp_Fami'];

                // Check if there are recievers and set booleans
                let recieverCheck,
                  recieverCheck2,
                  recieverCheck3,
                  recieverCheck4,
                  recieverCheck5,
                  recieverCheck6,
                  recieverCheck7,
                  recieverCheck8;

                const letterText =
                  NamoNeshan +
                  ' به شماره پرسنلی ' +
                  rowPerNo +
                  ' ' +
                  excelRow['متن نامه'];

                const tgd = excelRow['زیرماده'];

                excelRow['گیرنده۱'] ? (recieverCheck = 1) : (recieverCheck = 0);
                excelRow['گیرنده۲']
                  ? (recieverCheck2 = 1)
                  : (recieverCheck2 = 0);
                excelRow['گیرنده۳']
                  ? (recieverCheck3 = 1)
                  : (recieverCheck3 = 0);
                excelRow['گیرنده۴']
                  ? (recieverCheck4 = 1)
                  : (recieverCheck4 = 0);
                excelRow['گیرنده۵']
                  ? (recieverCheck5 = 1)
                  : (recieverCheck5 = 0);
                excelRow['گیرنده۶']
                  ? (recieverCheck6 = 1)
                  : (recieverCheck6 = 0);
                excelRow['گیرنده۷']
                  ? (recieverCheck7 = 1)
                  : (recieverCheck7 = 0);
                excelRow['گیرنده۸']
                  ? (recieverCheck8 = 1)
                  : (recieverCheck8 = 0);

                queryColumnValues.push(dastoorVal);
                queryColumnValues.push(`N'${maddeVal}'`);
                queryColumnValues.push(`N'${eghdamgarVal}'`);
                queryColumnValues.push(`N'${TarikhSabtVal}'`);
                queryColumnValues.push(`N'${TarikhSabtVal}'`);
                queryColumnValues.push(TaidEghdamgarVal);
                queryColumnValues.push(TaidRaisShobeVal);
                queryColumnValues.push(TaidJaneshinVal);
                queryColumnValues.push(TaidRaisVal);
                queryColumnValues.push(TaidRaisDastoor);
                queryColumnValues.push(`N'${JaneshinVal}'`);
                queryColumnValues.push(`N'${RaisVal}'`);
                queryColumnValues.push(`N'${RaisDastoorVal}'`);
                queryColumnValues.push(`N'${OnvanShobeVal}'`);
                queryColumnValues.push(`N'${OnvanShobeVal}'`);
                queryColumnValues.push(`N'${EmzaEghdamgarVal}'`);
                queryColumnValues.push(`N'${EmzaRaisShobeVal}'`);
                queryColumnValues.push(`N'${EmzaJaneshinVal}'`);
                queryColumnValues.push(`N'${EmzaRaisVal}'`);
                queryColumnValues.push(`N'${EmzaRaisDastoorVal}'`);
                queryColumnValues.push(`N'${NamoNeshan}'`);
                queryColumnValues.push(recieverCheck);
                queryColumnValues.push(recieverCheck2);
                queryColumnValues.push(recieverCheck3);
                queryColumnValues.push(recieverCheck4);
                queryColumnValues.push(recieverCheck5);
                queryColumnValues.push(recieverCheck6);
                queryColumnValues.push(recieverCheck7);
                queryColumnValues.push(recieverCheck8);
                queryColumnValues.push(`N'${letterText}'`);
                queryColumnValues.push(`N'${tgd}'`);

                rowsInQuery += '(' + queryColumnValues.join(',') + '),';
              }

              // Remove the last comma in query (fixing the syntax)
              rowsInQuery = rowsInQuery.slice(0, -1);

              queries.push({
                count: i,
                qString: `INSERT INTO ${maddeHaNumbers[madde].table} ${columnsInQuery} VALUES ${rowsInQuery}`,
              });
            }
            try {
              const connection = await sql.promises.open(
                process.env.DAST_DB_CONNECTION
              );
              // Actually insert rows in splitted chunks
              for await (const query of queries) {
                // console.log(query.count);
                await connection.promises.query(query.qString);
                // console.log('inserted');
              }
              await connection.promises.close();

              successMessage.excel_path = excelPath;
              return res.status(status.success).send(successMessage);
            } catch (error) {
              console.log(error);
              return catchError(
                errMessages.excelImportFailedAtSomePoint,
                'error',
                res
              );
            }
          }
        }
      );
    } catch (error) {
      if (error.message) {
        console.log(error);
        return catchError(
          error.message.substring(error.message.lastIndexOf(']') + 1),
          'error',
          res
        );
      } else return catchError(errMessages.operationFailed, 'error', res);
    }
  });
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

module.exports = {
  uploadDastoorMaddeExcel,
};

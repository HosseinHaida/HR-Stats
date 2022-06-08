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
  const id = PerNo ? PerNo : NationalID;
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
 * Change department for a person
 * @param {object} req
 * @param {object} res
 * @returns {object} return success message
 */
const changeDepartment = async (req, res) => {
  const { NationalID, PerNo } = req.user;
  const id = PerNo ? PerNo : NationalID;
  const { department, perNo } = req.body;

  let thisPerson;
  // Try fetching person from DB
  try {
    thisPerson = await fetchThisPerson(perNo, res);
  } catch (err) {
    return catchError(errMessages.couldNotFetchPerson, 'error', res);
  }
  if (!thisPerson)
    return catchError(errMessages.personNotFound, 'notfound', res);

  let thisUser;
  // Try fetching user from DB
  try {
    thisUser = await fetchThisUser(id, res);
  } catch (error) {
    return catchError(errMessages.couldNotFetchUser, 'error', res);
  }
  if (!thisPerson) return catchError(errMessages.userNotFound, 'notfound', res);

  const thisUserRoles = await fetchThisUserRoles(id);
  let authedDepartments = [];

  thisUserRoles.forEach((loopPermission) => {
    authedDepartments.push({
      label: loopPermission.Label,
      value: loopPermission.DepartmentID,
      role: loopPermission.Role,
    });
  });

  // If user and person are not in the same department
  if (thisPerson.Department !== thisUser.Department) {
    // Check if user is not in HR
    if (thisUser.Department !== process.env.HR_DEPARTMENT_ID) {
      return catchError(errMessages.notAuthorizedToChangeDep, 'error', res);
    } else {
      let isPermitted = false;
      // Check if no auth found at all
      if (authedDepartments.length < 1)
        return catchError(errMessages.noAuthFound, 'error', res);
      // Check if user has the role in HR
      authedDepartments.forEach((loopAuthDep) => {
        if (loopAuthDep.value === process.env.HR_DEPARTMENT_ID) {
          if (
            loopAuthDep.role === 'can_do_all' ||
            loopAuthDep.role === 'head' ||
            loopAuthDep.role === 'succ' ||
            loopAuthDep.role === 'operator'
          ) {
            isPermitted = true;
          }
        }
      });
      if (!isPermitted)
        return catchError(errMessages.notAuthorizedToChangeDep, 'bad', res);
    }
  } else {
    // If user is not in HR
    // Check if user has minimum auth in the department
    let isPermitted = false;
    authedDepartments.forEach((loopAuthDep) => {
      if (loopAuthDep.value === thisPerson.Department) {
        if (
          loopAuthDep.role === 'can_do_all' ||
          loopAuthDep.role === 'head' ||
          loopAuthDep.role === 'succ' ||
          loopAuthDep.role === 'operator'
        ) {
          isPermitted = true;
        }
      }
    });
    if (!isPermitted)
      return catchError(errMessages.noAuthInDepToChangeDep, 'bad', res);
    // if user is trying to change personnel department to sth else than nowhere
    if (
      department !== process.env.NOWHERE_DEPARTMENT_ID &&
      thisUser.Department !== process.env.HR_DEPARTMENT_ID
    ) {
      return catchError(errMessages.canOnlyUnsetPersonDep, 'bad', res);
    }
  }

  // Actually update the DB and set or unset person department
  try {
    const query = `UPDATE NameList SET Department = '${department}' WHERE PerNo = '${perNo}' or NID = '${perNo}'`;
    const connection = await sql.promises.open(process.env.DAST_DB_CONNECTION);
    await connection.promises.query(query);
    await connection.promises.close();

    return res.status(status.success).send();
  } catch (err) {
    return catchError(errMessages.couldNotUpdatePersonDep, 'error', res);
  }
};

/**
 * Insert new person
 * @param {object} req
 * @param {object} res
 * @returns {object} return success message
 */
const insertPerson = async (req, res) => {
  const { NationalID, PerNo } = req.user;
  const id = PerNo ? PerNo : NationalID;
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
  const { search_text, departments, nooffs } = req.query;
  const { NationalID, PerNo } = req.user;
  const id = PerNo ? PerNo : NationalID;

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
    let parsedDepartments;
    if (!isEmpty(departments) && departments !== 'based_on_auth')
      parsedDepartments = departments.split(',').join("','");
    // Check if user wants to see personnel in a particular department
    if (!isEmpty(departments) && departments !== 'based_on_auth') {
      if (queryHasWhere) {
        query += ` and Department in ('${parsedDepartments}'))`;
        peopleCountQuery += ` and Department in ('${parsedDepartments}'))`;
      } else {
        query += ` where Department in ('${parsedDepartments}')`;
        peopleCountQuery += ` where Department in ('${parsedDepartments}')`;
        queryHasWhere = true;
      }
    }
    if (departments === 'based_on_auth') {
      if (queryHasWhere) {
        query += ` and Department = '${thisUser.Department}')`;
        peopleCountQuery += ` and Department = '${thisUser.Department}')`;
      } else {
        query += ` where Department = '${thisUser.Department}'`;
        peopleCountQuery += ` where Department = '${thisUser.Department}'`;
        queryHasWhere = true;
      }
    }

    if (isEmpty(departments)) {
      // Check to close paranthesis on permittedDepartments where clause
      if (queryHasWhere) {
        query += ')';
        peopleCountQuery += ')';
      }
    }

    let peopleOnVaca = [];
    let offsRes = null;
    // Ommit people who are off today from the list when setting dailyStats
    if (nooffs && (nooffs === 'false' || nooffs === 'true')) {
      const irDate = new Date().toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      let tday = String(p2e(irDate));
      tday = tday.replace('/', '-').replace('/', '-');
      // Fetch records from Offs table for today
      // We know already that the ${departments} is a single department now!
      const todaysOffsQuery = `SELECT * FROM Offs o inner join NameList n on o.requester = n.PerNo WHERE o.department='${departments}' AND isApprovedByHead IS NOT NULL AND isApprovedByHead != '' AND isApprovedByHead != '0' AND DATEDIFF(day, off_to, '${tday}') <= 0 AND  DATEDIFF(day, '${tday}', off_from) <= 0 `;
      const dastConnection = await sql.promises.open(
        process.env.DAST_DB_CONNECTION
      );
      offsRes = await dastConnection.promises.query(todaysOffsQuery);
      await dastConnection.promises.close();

      // Alter the query if there are people on vaca today
      // and noOffs is set to true
      if (nooffs === 'true' && offsRes.first.length > 0) {
        offsRes.first.forEach((loopOffPerson) => {
          peopleOnVaca.push(loopOffPerson.requester);
        });

        const parsedPeopleOnVaca = peopleOnVaca.join("','");

        if (queryHasWhere) {
          query += ` and PerNo not in ('${parsedPeopleOnVaca}')`;
          peopleCountQuery += ` and PerNo not in ('${parsedPeopleOnVaca}')`;
        } else {
          query += ` where PerNo not in ('${parsedPeopleOnVaca}')`;
          peopleCountQuery += ` where PerNo not in ('${parsedPeopleOnVaca}')`;
          queryHasWhere = true;
        }
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
    successMessage.offs = offsRes ? offsRes.first : [];

    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.log(error);
    return catchError(errMessages.peopleFetchFailed, 'error', res);
  }
};

const p2e = (s) => s.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));

const findPerson = async (req, res) => {
  const { id } = req.query;
  const { NationalID, PerNo } = req.user;
  const perNo = PerNo ? PerNo : NationalID;

  const thisUserRoles = await fetchThisUserRoles(perNo);
  const thisUser = await fetchThisUser(perNo);
  const result = await fetchThisPerson(id, res);

  let permittedDepartments = [];

  thisUserRoles.forEach((loopPermission) => {
    permittedDepartments.push(loopPermission.DepartmentID);
  });

  if (thisUser.Department !== process.env.HR_DEPARTMENT_ID) {
    if (!permittedDepartments.includes(result.Department)) {
      return catchError(errMessages.notAuthorized, 'error', res);
    }
  }

  if (!result) catchError(errMessages.personNotFound, 'notfound', res);
  else {
    successMessage.person = result;
    return res.status(status.success).send(successMessage);
  }
};

/**
 * Fetch user from DB
 * @param {integer} id
 * @returns {object} user
 */
const fetchThisUser = async (id, res) => {
  const query = `select * from Users where PerNo = N'${id}' or NationalID = N'${id}'`;
  const connection = await sql.promises.open(process.env.STATS_DB_CONNECTION);
  const data = await connection.promises.query(query);
  await connection.promises.close();
  if (data.results[0].length > 0) return data.results[0][0];
  else if (data.results[0].length < 1) return null;
};

/**
 * Fetch person from DB
 * @param {integer} id
 * @returns {object} user
 */
const fetchThisPerson = async (id, res) => {
  const query = `select * from NameList where PerNo = N'${id}' or NID = N'${id}'`;
  const connection = await sql.promises.open(process.env.DAST_DB_CONNECTION);
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
  const query = `select * from Auth inner join Departments ON Auth.DepartmentID=Departments.ID where Auth.UserID = N'${id}'`;
  const connection = await sql.promises.open(process.env.STATS_DB_CONNECTION);
  const data = await connection.promises.query(query);
  await connection.promises.close();
  if (data.results[0].length > 0) return data.results[0];
  else if (data.results[0].length < 1) return null;
};

module.exports = {
  uploadExcel,
  fetchPeople,
  findPerson,
  insertPerson,
  changeDepartment,
};

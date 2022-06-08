const { isEmpty } = require('../helpers/validations');
const { catchError } = require('./catchError');
const { errMessages } = require('../helpers/error-messages');
const { successMessage, status } = require('../helpers/status');
var sql = require('msnodesqlv8');

/**
 * Approve a day off (admin, head, hr)
 * @param {object} req
 * @param {object} res
 * @returns {object} returns info of the approver
 */
const approveADayOff = async (req, res) => {
  const { NationalID, PerNo } = req.user;
  const { id, role, dep } = req.body;
  const userId = PerNo ? PerNo : NationalID;

  let isUserAuthed = false;
  try {
    const thisUserRoles = await fetchThisUserRoles(userId);
    let authedDepartments = [];

    thisUserRoles.forEach((loopPermission) => {
      authedDepartments.push({
        label: loopPermission.Label,
        value: loopPermission.DepartmentID,
        role: loopPermission.Role,
      });
    });

    // Check if user can not register auth for any department
    if (authedDepartments.length < 1)
      return catchError(errMessages.userHasNoAuth, 'bad', res);

    let roles = null;
    if (role === 'admin') roles = ['admin_head', 'admin_succ', 'can_do_all'];
    if (role === 'head') roles = ['head', 'succ', 'can_do_all'];
    if (role === 'hr') roles = ['head', 'succ', 'can_do_all'];

    let department = role === 'hr' ? process.env.HR_DEPARTMENT_ID : dep;

    // Check if user is authed for the requested department id
    authedDepartments.forEach((loopAuth) => {
      if (loopAuth.value === department && roles.indexOf(loopAuth.role) > -1)
        isUserAuthed = true;
    });
    if (!isUserAuthed) return catchError(errMessages.notAuthorized, 'bad', res);
  } catch (error) {
    console.log(error);
    return catchError(errMessages.authFetchFailed, 'error', res);
  }

  try {
    const irDate = p2e(
      new Date().toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    );

    //   Get time for update query
    const date = new Date();
    let timeHrs = date.getHours();
    let timeMins = date.getMinutes();

    console.log(role);

    let columnToSet = null;
    if (role === 'admin') columnToSet = 'isApprovedByAdmin';
    if (role === 'head') columnToSet = 'isApprovedByHead';
    if (role === 'hr') columnToSet = 'isApprovedByHR';

    const updateThisRecordQuery = `UPDATE Offs SET ${columnToSet} = '${userId},${timeHrs}:${timeMins}' WHERE id = '${id}'`;
    const fetchThisRecordQuery = `SELECT isApprovedByAdmin, isApprovedByHead, isApprovedByHR FROM Offs WHERE id = '${id}'`;
    const connection = await sql.promises.open(process.env.DAST_DB_CONNECTION);
    const thisOffRecord = await connection.promises.query(fetchThisRecordQuery);

    if (
      role === 'admin' &&
      thisOffRecord.first[0].isApprovedByAdmin &&
      thisOffRecord.first[0].isApprovedByAdmin !== '0'
    )
      return catchError(errMessages.alreadyApproved, 'bad', res);
    if (
      role === 'head' &&
      thisOffRecord.first[0].isApprovedByHead &&
      thisOffRecord.first[0].isApprovedByHead !== '0'
    )
      return catchError(errMessages.alreadyApproved, 'bad', res);
    if (
      role === 'hr' &&
      thisOffRecord.first[0].isApprovedByHR &&
      thisOffRecord.first[0].isApprovedByHR !== '0'
    )
      return catchError(errMessages.alreadyApproved, 'bad', res);

    await connection.promises.query(updateThisRecordQuery);
    await connection.promises.close();

    successMessage.approver = userId + ' , ' + timeHrs + ':' + timeMins;
    return res.status(status.success).send(successMessage);
  } catch (error) {
    if (error.message) return catchError(error.message, 'error', res);
    else return catchError(errMessages.approveFailed, 'error', res);
  }
};

/**
 * Approve today's Stats (operator, admin, head)
 * @param {object} req
 * @param {object} res
 * @returns {object} returns info of the approver
 */
const approveStats = async (req, res) => {
  const { NationalID, PerNo } = req.user;
  const { dep, role } = req.body;
  const id = PerNo ? PerNo : NationalID;

  let isUserAuthed = false;
  try {
    const thisUserRoles = await fetchThisUserRoles(id);
    let authedDepartments = [];

    thisUserRoles.forEach((loopPermission) => {
      authedDepartments.push({
        label: loopPermission.Label,
        value: loopPermission.DepartmentID,
        role: loopPermission.Role,
      });
    });

    // Check if user can not register auth for any department
    if (authedDepartments.length < 1)
      return catchError(errMessages.userHasNoAuth, 'bad', res);

    let roles = null;
    if (role === 'operator') roles = ['operator', 'can_do_all'];
    if (role === 'admin') roles = ['admin_head', 'admin_succ', 'can_do_all'];
    if (role === 'head') roles = ['head', 'succ', 'can_do_all'];

    // Check if user is authed for the requested department id
    authedDepartments.forEach((loopAuth) => {
      if (loopAuth.value === dep && roles.indexOf(loopAuth.role) > -1)
        isUserAuthed = true;
    });
    if (!isUserAuthed) return catchError(errMessages.notAuthorized, 'bad', res);
  } catch (error) {
    console.log(error);
    return catchError(errMessages.authFetchFailed, 'error', res);
  }

  try {
    const irDate = p2e(
      new Date().toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    );

    //   Get time for update query
    const date = new Date();
    let timeHrs = date.getHours();
    let timeMins = date.getMinutes();

    let columnToSet = null;
    if (role === 'operator') columnToSet = 'isApprovedOperator';
    if (role === 'admin') columnToSet = 'isApprovedAdmin';
    if (role === 'head') columnToSet = 'isApprovedHead';

    const updateTodaysStatsQuery = `UPDATE DailyStats SET ${columnToSet} = '${id},${timeHrs}:${timeMins}' WHERE Date = '${irDate}' AND DepartmentID = '${dep}'`;
    const fetchTodaysStatsQuery = `SELECT IsApprovedHR, IsApprovedOperator, IsApprovedAdmin, IsApprovedHead FROM DailyStats WHERE Date = '${irDate}' AND DepartmentID = '${dep}'`;
    const connection = await sql.promises.open(process.env.STATS_DB_CONNECTION);
    const todaysStats = await connection.promises.query(fetchTodaysStatsQuery);

    if (role === 'operator' && todaysStats.first[0].IsApprovedOperator)
      return catchError(errMessages.alreadyApproved, 'bad', res);
    if (role === 'admin' && todaysStats.first[0].IsApprovedAdmin)
      return catchError(errMessages.alreadyApproved, 'bad', res);
    if (role === 'head' && todaysStats.first[0].IsApprovedHead)
      return catchError(errMessages.alreadyApproved, 'bad', res);

    await connection.promises.query(updateTodaysStatsQuery);
    await connection.promises.close();

    successMessage.approver = id + ' , ' + timeHrs + ':' + timeMins;
    return res.status(status.success).send(successMessage);
  } catch (error) {
    if (error.message) return catchError(error.message, 'error', res);
    else return catchError(errMessages.approveFailed, 'error', res);
  }
};

/**
 * Insert today's Stats
 * @param {object} req
 * @param {object} res
 * @returns {object} return success message
 */
const register = async (req, res) => {
  const { NationalID, PerNo } = req.user;
  const { stats, department } = req.body;
  const id = PerNo ? PerNo : NationalID;
  try {
    // const thisUser = await fetchThisUser(id, res);
    // Fetch user permissions
    const thisUserRoles = await fetchThisUserRoles(id);
    let authedDepartments = [];

    thisUserRoles.forEach((loopPermission) => {
      authedDepartments.push({
        label: loopPermission.Label,
        value: loopPermission.DepartmentID,
        role: loopPermission.Role,
      });
    });

    // Check if user can not register auth for any department
    if (authedDepartments.length < 1)
      return catchError(errMessages.userHasNoAuth, 'bad', res);

    // Check if user is authed for the requested department id
    let isUserAuthed = false;
    authedDepartments.forEach((loopAuth) => {
      if (
        loopAuth.value === department &&
        process.env.AVAIL_ROLES.indexOf(loopAuth.role) > -1
      )
        isUserAuthed = true;
    });
    if (!isUserAuthed)
      return catchError(errMessages.userIsNotAuthedForThisDep, 'bad', res);
  } catch (error) {
    console.log(error);
    return catchError(errMessages.couldNotFetchUser, 'error', res);
  }

  const parsedStats = {
    Hazer: [],
    Negahban: [],
    EsterahatNegahbani: [],
    EsterahatTirandazi: [],
    EsterahatShift: [],
    MamoorDoor: [],
    MamoorNazdik: [],
    TasvieHesab: [],
    ModavematKar: [],
    EsterahatPezeshki: [],
    Morkhasi: [],
    Ghayeb: [],
    Farari: [],
    BazdashtGaah: [],
    TirandaziRoozane: [],
    Montaseb: [],
    RahDoor: [],
    Bimarestan: [],
  };

  //   Push PerNos of each status to the parsedStats object
  for (const [key, value] of Object.entries(stats)) {
    parsedStats[value.value].push(key);
  }

  //   Turn parsedStats each key value into strings of PerNos with commas
  for (const [key, value] of Object.entries(parsedStats)) {
    parsedStats[key] = value.join(',');
  }

  //   Create a date for today for insert query
  const irDate = new Date().toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  //   Extract time for insert query
  const date = new Date();
  let timeHrs = date.getHours();
  let timeMins = date.getMinutes();

  timeHrs = timeHrs < 10 ? '0' + timeHrs : timeHrs;
  timeMins = timeMins < 10 ? '0' + timeMins : timeMins;

  try {
    const query = `INSERT INTO DailyStats (Date,Time,DepartmentID,UserID,${Object.keys(
      parsedStats
    ).join(',')}) VALUES 
    (N'${p2e(
      irDate
    )}', N'${timeHrs}:${timeMins}', '${department.trim()}', '${id}', '${Object.values(
      parsedStats
    ).join("','")}')`;
    const statsConnection = await sql.promises.open(
      process.env.STATS_DB_CONNECTION
    );
    await statsConnection.promises.query(query);
    await statsConnection.promises.close();

    if (timeHrs > 9 || (timeHrs === 9 && timeMins > 10))
      successMessage.delay = true;
    else successMessage.delay = false;
    return res.status(status.success).send(successMessage);
  } catch (error) {
    // console.log(error);
    if (error.message) {
      if (error.message.includes('PK_DailyStats'))
        return catchError(errMessages.statsAlreadyInserted, 'bad', res);
      return catchError(
        error.message.substring(error.message.lastIndexOf(']') + 1),
        'error',
        res
      );
    }
    return catchError(errMessages.statsInsertFailed, 'error', res);
  }
};

/**
 * Fetch department's todays Stats from db if there are any
 * @param {*} req
 * @param {*} res
 * returns stats
 */
const fetchTodaysStats = async (req, res) => {
  const { NationalID, PerNo } = req.user;
  const id = PerNo ? PerNo : NationalID;
  const { department } = req.body;

  try {
    const irDate = new Date().toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const query = `SELECT * FROM DailyStats WHERE DepartmentID = '${department}' AND Date = N'${p2e(
      irDate
    )}'`;
    const connection = await sql.promises.open(process.env.STATS_DB_CONNECTION);
    let result = await connection.promises.query(query);
    await connection.promises.close();

    let tday = String(p2e(irDate));
    tday = tday.replace('/', '-').replace('/', '-');
    // Fetch records from Offs table for today
    const todaysOffsQuery = `SELECT * FROM Offs o inner join NameList n on o.requester = n.PerNo WHERE o.department='${department}' AND isApprovedByHead IS NOT NULL AND isApprovedByHead != '' AND isApprovedByHead != '0' AND DATEDIFF(day, off_to, '${tday}') <= 0 AND  DATEDIFF(day, '${tday}', off_from) <= 0 `;
    const dastConnection = await sql.promises.open(
      process.env.DAST_DB_CONNECTION
    );
    const offsRes = await dastConnection.promises.query(todaysOffsQuery);
    await dastConnection.promises.close();

    // let ipChain = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    // ipChain = ipChain.split(':');
    // const ip = ipChain[ipChain.length - 1];
    // console.log(ip);

    if (result.first.length < 1) {
      successMessage.stats = {};
      return res.status(status.success).send();
    }

    // Hazer ha
    let presents = result.first[0]['Hazer'].split(',');
    // Ghayeb ha
    let absents = result.first[0]['Ghayeb'].split(',');
    // Morkhasi ha
    let personnelThatAreOffToday = [];

    if (offsRes.first.length > 0)
      offsRes.first.forEach((loopOffRecord) => {
        personnelThatAreOffToday.push(loopOffRecord.requester);
      });

    // remove people that are off from the presents
    presents = presents.filter(
      (dudeNotOnVacation) =>
        !personnelThatAreOffToday.includes(dudeNotOnVacation)
    );

    // remove people that are off from the absents
    absents = absents.filter(
      (dudeNotOnVacation) =>
        !personnelThatAreOffToday.includes(dudeNotOnVacation)
    );

    result.first[0]['Hazer'] = presents.join(',');
    result.first[0]['Ghayeb'] = absents.join(',');
    result.first[0]['Morkhasi'] = personnelThatAreOffToday.join(',');

    successMessage.stats = result.first[0];
    successMessage.offs = offsRes.first;
    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.log(error);
    if (error.message) return catchError(error.message, 'error', res);
    return catchError(errMessages.statsFetchFailed, 'error', res);
  }
};

const p2e = (s) => s.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));

/**
 * Fetch daysOff records from users department
 * @param {*} req
 * @param {*} res
 * returns list of daysOff Records
 */
const fetchDaysOff = async (req, res) => {
  const { NationalID, PerNo } = req.user;
  const { search_text, departments } = req.query;
  const id = PerNo ? PerNo : NationalID;

  let thisUser = null;
  // the departments from which we have to fetch records
  let permittedDepartments = [];
  let isUserJustALogin = false;
  let isUserStaffFromHR = false;
  try {
    thisUser = await fetchThisUser(id, res);
    const thisUserRoles = await fetchThisUserRoles(id);
    thisUserRoles.forEach((loopPermission) => {
      permittedDepartments.push(loopPermission.DepartmentID);
      // if (thisUser.Department !== process.env.HR_DEPARTMENT_ID)
      if (
        loopPermission.DepartmentID === thisUser.Department &&
        process.env.AVAIL_ROLES.indexOf(loopPermission.Role) === -1
      )
        isUserJustALogin = true;

      if (
        loopPermission.DepartmentID === process.env.HR_DEPARTMENT_ID &&
        process.env.AVAIL_ROLES.indexOf(loopPermission.Role) > -1
      )
        isUserStaffFromHR = true;
    });
  } catch (error) {
    return catchError(errMessages.couldNotFetchUser, 'error', res);
  }

  // Initial query
  let query = `select 
  o.id as id,
  n.PerNo as PerNo,
  n.Acp_Name as Acp_Name,
  n.Acp_Fami as Acp_Fami,
  n.NID as NID,
  n.ShRank as ShRank,
  o.department as Department,
  n.IsSoldier as IsSoldier,
  o.requester as requester,
  o.successor as successor,
  o.off_from as off_from,
  o.off_to as off_to,
  o.transit_duration as transit_duration,
  o.type as type,
  o.loc as loc,
  o.spec_loc as spec_loc,
  o.creator as creator,
  o.isApprovedByHead as isApprovedByHead,
  o.isApprovedByHR as isApprovedByHR,
  o.isApprovedByAdmin as isApprovedByAdmin
  from Offs o inner join NameList n on o.requester = n.PerNo`;
  let daysOffCountQuery = `select count(*) from Offs o inner join NameList n on o.requester = n.PerNo`;
  let queryHasWhere = false;

  if (!isUserStaffFromHR && isUserJustALogin) {
    query += ` where (n.PerNo = '${thisUser.PerNo}'`;
    daysOffCountQuery += ` where (n.PerNo = '${thisUser.PerNo}'`;
    queryHasWhere = true;
  }

  // If user is not in HR
  if (thisUser.Department !== process.env.HR_DEPARTMENT_ID) {
    // Check if user has no permittedDepartments then return nothing
    if (permittedDepartments.length === 0)
      return catchError(errMessages.noPermittedDepartments, 'bad', res);
    else {
      if (queryHasWhere) {
        query += ` and n.Department in (${permittedDepartments.join(',')})`;
        daysOffCountQuery += ` and n.Department in (${permittedDepartments.join(
          ','
        )})`;
      } else {
        query += ` where (n.Department in (${permittedDepartments.join(',')})`;
        daysOffCountQuery += ` where (n.Department in (${permittedDepartments.join(
          ','
        )})`;
        queryHasWhere = true;
      }
    }
  }
  let parsedDepartments;
  if (!isEmpty(departments) && departments !== 'based_on_auth')
    parsedDepartments = departments.split(',').join("','");
  // Check if user wants to see personnel in a particular department
  if (!isEmpty(departments) && departments !== 'based_on_auth') {
    if (queryHasWhere) {
      query += ` and n.Department in ('${parsedDepartments}'))`;
      daysOffCountQuery += ` and n.Department in ('${parsedDepartments}'))`;
    } else {
      query += ` where n.Department in ('${parsedDepartments}')`;
      daysOffCountQuery += ` where n.Department in ('${parsedDepartments}')`;
      queryHasWhere = true;
    }
  }

  if (isEmpty(departments)) {
    // Check to close paranthesis on permittedDepartments where clause
    if (queryHasWhere) {
      query += ')';
      daysOffCountQuery += ')';
    }
  }

  // Where clause for the search text
  if (!isEmpty(search_text)) {
    if (queryHasWhere) {
      query += ' and(';
      daysOffCountQuery += ' and(';
    } else {
      query += ' where(';
      daysOffCountQuery += ' where(';
      queryHasWhere = true;
    }

    const where = (column) => ` ${column} LIKE N'%${search_text}%' or`;
    const whereWithoutOr = (column) => ` ${column} LIKE N'%${search_text}%')`;

    // Change query to fetch people based on search_text
    query += where('Acp_Name');
    daysOffCountQuery += where('Acp_Name');
    query += where('loc');
    daysOffCountQuery += where('loc');
    query += where('Acp_Fami');
    daysOffCountQuery += where('Acp_Fami');
    query += where('PerNo');
    daysOffCountQuery += where('PerNo');
    query += whereWithoutOr('NID');
    daysOffCountQuery += whereWithoutOr('NID');
  }

  // Now actually fetch daysOff Records
  try {
    const connection = await sql.promises.open(process.env.DAST_DB_CONNECTION);
    const results = await connection.promises.query(query);
    const dataCount = await connection.promises.query(daysOffCountQuery);
    await connection.promises.close();

    // Prepare body to send back to client
    successMessage.records = results.first;
    successMessage.countOfRecords = Number(dataCount.first[0]['']);
    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.log(error);
    return catchError(errMessages.daysOffFetchFailed);
  }
};

/**
 * Insert daysOff record for a person
 * @param {object} req
 * @param {object} res
 * @returns {object} return success message
 */
const setDaysOff = async (req, res) => {
  const { NationalID, PerNo } = req.user;
  const { data } = req.body;
  const id = PerNo ? PerNo : NationalID;

  // let isPermittedToInsertADayOff = false;
  let thisUser = null;
  try {
    // Fetch person and the permissions he has
    thisUser = await fetchThisUser(id, res);
    // const thisUserRoles = await fetchThisUserRoles(id);
    // thisUserRoles.forEach((loopPermission) => {
    //   isPermittedToInsertADayOff =
    //     process.env.AVAIL_ROLES.indexOf(loopPermission.Role) !== -1
    //       ? true
    //       : false;
    // });
  } catch (error) {
    return catchError(errMessages.couldNotFetchPerson, 'error', res);
  }

  // Do the insert if user has permission to insert daysOff
  // if (!isPermittedToInsertADayOff)
  //   return catchError(errMessages.notAuthorized, 'bad', res);

  try {
    const fromDate = data.daysOffDate
      ? data.daysOffDate
      : data.daysOffDurationFrom;
    const toDate = data.daysOffDate ? data.daysOffDate : data.daysOffDurationTo;
    const query = `insert into Offs (requester, successor, off_from, off_to, transit_duration, type, loc, spec_loc, department, creator, isApprovedByHead, isApprovedByHR) values (
    '${id}', 
    '${data.successor}', 
    '${fromDate}',
    '${toDate}',
    '${data.daysOffTransit}',
    '${data.daysOffType}',
    N'${data.daysOffLoc}',
    N'${data.daysOffSpecLoc}',
    '${thisUser.Department}',
    '${thisUser.PerNo}',
    '${0}',
    '${0}')`;
    const connection = await sql.promises.open(process.env.DAST_DB_CONNECTION);
    await connection.promises.query(query);
    await connection.promises.close();

    return res.status(status.success).send();
  } catch (error) {
    console.log(error);
    return catchError(errMessages.dayOffInsertFailed, 'error', res);
  }
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
  approveStats,
  register,
  setDaysOff,
  fetchDaysOff,
  fetchTodaysStats,
  approveADayOff,
};

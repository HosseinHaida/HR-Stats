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
  let thisUser = null;
  try {
    thisUser = await fetchThisUser(userId);
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

    let columnToSet = null;
    if (role === 'admin') columnToSet = 'isApprovedByAdmin';
    if (role === 'head') columnToSet = 'isApprovedByHead';
    if (role === 'hr') columnToSet = 'isApprovedByHR';

    const updateThisRecordQuery = `UPDATE Offs SET ${columnToSet} = N'${thisUser.Name} ${thisUser.Family} - ${userId} _ ${irDate} _ ${timeHrs}:${timeMins}' WHERE id = '${id}'`;
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
 * Approve a mission ( head )
 * @param {object} req
 * @param {object} res
 * @returns {object} returns info of the approver
 */
const approveMission = async (req, res) => {
  const { NationalID, PerNo } = req.user;
  const { id, role, dep } = req.body;
  const userId = PerNo ? PerNo : NationalID;

  let isUserAuthed = false;
  let thisUser = null;
  try {
    thisUser = await fetchThisUser(userId);
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
    if (role === 'head') roles = ['head', 'succ', 'can_do_all'];

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

    let columnToSet = null;
    if (role === 'head') columnToSet = 'is_approved_by_head';

    const updateThisRecordQuery = `UPDATE Missions SET ${columnToSet} = N'${thisUser.Name} ${thisUser.Family} - ${userId} _ ${irDate} _ ${timeHrs}:${timeMins}' WHERE id = '${id}'`;
    const fetchThisRecordQuery = `SELECT is_approved_by_head FROM Missions WHERE id = '${id}'`;
    const connection = await sql.promises.open(process.env.DAST_DB_CONNECTION);
    const thisOffRecord = await connection.promises.query(fetchThisRecordQuery);

    if (
      role === 'head' &&
      thisOffRecord.first[0].isApprovedByHead &&
      thisOffRecord.first[0].isApprovedByHead !== '0'
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
 * Approve an agent ( head )
 * @param {object} req
 * @param {object} res
 * @returns {object} returns info of the approver
 */
const approveAgent = async (req, res) => {
  const { NationalID, PerNo } = req.user;
  const { id, role, dep } = req.body;
  const userId = PerNo ? PerNo : NationalID;

  let isUserAuthed = false;
  let thisUser = null;
  try {
    thisUser = await fetchThisUser(userId);
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
    if (role === 'head') roles = ['head', 'succ', 'can_do_all'];

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

    let columnToSet = null;
    if (role === 'head') columnToSet = 'is_approved_by_head';

    const updateThisRecordQuery = `UPDATE Agents SET ${columnToSet} = N'${thisUser.Name} ${thisUser.Family} - ${userId} _ ${irDate} _ ${timeHrs}:${timeMins}' WHERE id = '${id}'`;
    const fetchThisRecordQuery = `SELECT is_approved_by_head FROM Agents WHERE id = '${id}'`;
    const connection = await sql.promises.open(process.env.DAST_DB_CONNECTION);
    const thisOffRecord = await connection.promises.query(fetchThisRecordQuery);

    if (
      role === 'head' &&
      thisOffRecord.first[0].isApprovedByHead &&
      thisOffRecord.first[0].isApprovedByHead !== '0'
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
  let thisUser = null;
  try {
    thisUser = await fetchThisUser(id);
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

    const updateTodaysStatsQuery = `UPDATE DailyStats SET ${columnToSet} = N'${thisUser.Name} ${thisUser.Family} - ${id} _ ${timeHrs}:${timeMins}' WHERE Date = '${irDate}' AND DepartmentID = '${dep}'`;
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
  // const { NationalID, PerNo } = req.user;
  // const id = PerNo ? PerNo : NationalID;
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

    // remove people that are off; from the absents
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

// convert persion string to english
const p2e = (s) => s.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));

// get array of all days between start and end
const getDatesInBetween = (start, end) => {
  var d = new Date(start);
  var e = new Date(end);

  for (var a = []; d <= e; d.setDate(d.getDate() + 1)) {
    let date = new Date(d);
    let s =
      date.getFullYear() +
      '/' +
      String(date.getMonth() + 1).padStart(2, '0') +
      '/' +
      String(date.getDate()).padStart(2, '0');
    a.push(s);
  }
  return a;
};

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

  let thisUser = null,
    // the departments from which we have to fetch records
    permittedDepartments = [],
    isUserJustALogin = false,
    isUserStaffFromHR = false;
  try {
    thisUser = await fetchThisUser(id);
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
  n.Department as Department,
  n.IsSoldier as IsSoldier,
  o.requester as requester,
  o.successor as successor,
  o.duration as duration,
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
  let queryHasWhere = false;

  if (!isUserStaffFromHR && isUserJustALogin) {
    query += ` where (n.PerNo = '${thisUser.PerNo}'`;
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
      } else {
        query += ` where (n.Department in (${permittedDepartments.join(',')})`;
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
    } else {
      query += ` where n.Department in ('${parsedDepartments}')`;
      queryHasWhere = true;
    }
  }

  if (isEmpty(departments)) {
    // Check to close paranthesis on permittedDepartments where clause
    if (queryHasWhere) {
      query += ')';
    }
  }

  // Where clause for the search text
  if (!isEmpty(search_text)) {
    if (queryHasWhere) {
      query += ' and(';
    } else {
      query += ' where(';
      queryHasWhere = true;
    }

    const where = (column) => ` ${column} LIKE N'%${search_text}%' or`;
    const whereWithoutOr = (column) => ` ${column} LIKE N'%${search_text}%')`;

    // Change query to fetch people based on search_text
    query += where('Acp_Name');
    query += where('loc');
    query += where('Acp_Fami');
    query += where('PerNo');
    query += whereWithoutOr('NID');
  }

  // Now actually fetch daysOff Records
  try {
    const connection = await sql.promises.open(process.env.DAST_DB_CONNECTION);
    const results = await connection.promises.query(query);
    await connection.promises.close();

    // Prepare body to send back to client
    successMessage.records = results.first;
    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.log(error);
    if (error.message) return catchError(error.message, 'error', res);
    return catchError(errMessages.daysOffFetchFailed);
  }
};

/**
 * Fetch mission records from users department
 * @param {*} req
 * @param {*} res
 * returns list of missions Records
 */
const fetchMissions = async (req, res) => {
  const { NationalID, PerNo } = req.user;
  const { search_text, departments } = req.query;
  const id = PerNo ? PerNo : NationalID;

  let thisUser = null,
    // the departments from which we have to fetch records
    permittedDepartments = [],
    isUserJustALogin = false,
    isUserStaffFromHR = false;
  try {
    thisUser = await fetchThisUser(id);
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
  m.id as id,
  n.PerNo as PerNo,
  n.Acp_Name as Acp_Name,
  n.Acp_Fami as Acp_Fami,
  n.NID as NID,
  n.ShRank as ShRank,
  n.Department as Department,
  n.IsSoldier as IsSoldier,
  m.person_id as person_id,
  m.duration as duration,
  m.start_date as start_date,
  m.end_date as end_date,
  m.transportation as transportation,
  m.is_approved_by_head as is_approved_by_head,
  m.location as location,
  m.created_by as created_by,
  m.created_at as created_at
  from Missions m inner join NameList n on m.person_id = n.PerNo`;
  let queryHasWhere = false;

  if (!isUserStaffFromHR && isUserJustALogin) {
    query += ` where (n.PerNo = '${thisUser.PerNo}'`;
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
      } else {
        query += ` where (n.Department in (${permittedDepartments.join(',')})`;
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
    } else {
      query += ` where n.Department in ('${parsedDepartments}')`;
      queryHasWhere = true;
    }
  }

  if (isEmpty(departments)) {
    // Check to close paranthesis on permittedDepartments where clause
    if (queryHasWhere) {
      query += ')';
    }
  }

  // Where clause for the search text
  if (!isEmpty(search_text)) {
    if (queryHasWhere) {
      query += ' and(';
    } else {
      query += ' where(';
      queryHasWhere = true;
    }

    const where = (column) => ` ${column} LIKE N'%${search_text}%' or`;
    const whereWithoutOr = (column) => ` ${column} LIKE N'%${search_text}%')`;

    // Change query to fetch people based on search_text
    query += where('Acp_Name');
    query += where('location');
    query += where('Acp_Fami');
    query += where('PerNo');
    query += whereWithoutOr('NID');
  }

  // Now actually fetch daysOff Records
  try {
    const connection = await sql.promises.open(process.env.DAST_DB_CONNECTION);
    const results = await connection.promises.query(query);
    await connection.promises.close();

    // Prepare body to send back to client
    successMessage.records = results.first;
    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.log(error);
    return catchError(errMessages.daysOffFetchFailed);
  }
};

/**
 * Fetch agents from users department
 * @param {*} req
 * @param {*} res
 * returns list of agents Records
 */
const fetchAgents = async (req, res) => {
  const { NationalID, PerNo } = req.user;
  const { search_text, departments } = req.query;
  const id = PerNo ? PerNo : NationalID;

  let thisUser = null,
    // the departments from which we have to fetch records
    permittedDepartments = [],
    isUserJustALogin = false,
    isUserStaffFromHR = false;
  try {
    thisUser = await fetchThisUser(id);
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
  a.id as id,
  n.PerNo as PerNo,
  n.Acp_Name as Acp_Name,
  n.Acp_Fami as Acp_Fami,
  n.NID as NID,
  n.ShRank as ShRank,
  n.Department as Department,
  n.IsSoldier as IsSoldier,
  a.person_id as person_id,
  a.duration as duration,
  a.start_date as start_date,
  a.end_date as end_date,
  a.is_approved_by_head as is_approved_by_head,
  a.location as location,
  a.created_by as created_by,
  a.created_at as created_at,
  a.has_end as has_end,
  a.is_external as is_external
  from Agents a inner join NameList n on a.person_id = n.PerNo`;
  let queryHasWhere = false;

  if (!isUserStaffFromHR && isUserJustALogin) {
    query += ` where (n.PerNo = '${thisUser.PerNo}'`;
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
      } else {
        query += ` where (n.Department in (${permittedDepartments.join(',')})`;
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
    } else {
      query += ` where n.Department in ('${parsedDepartments}')`;
      queryHasWhere = true;
    }
  }

  if (isEmpty(departments)) {
    // Check to close paranthesis on permittedDepartments where clause
    if (queryHasWhere) {
      query += ')';
    }
  }

  // Where clause for the search text
  if (!isEmpty(search_text)) {
    if (queryHasWhere) {
      query += ' and(';
    } else {
      query += ' where(';
      queryHasWhere = true;
    }

    const where = (column) => ` ${column} LIKE N'%${search_text}%' or`;
    const whereWithoutOr = (column) => ` ${column} LIKE N'%${search_text}%')`;

    // Change query to fetch people based on search_text
    query += where('Acp_Name');
    query += where('location');
    query += where('Acp_Fami');
    query += where('PerNo');
    query += whereWithoutOr('NID');
  }

  // Now actually fetch daysOff Records
  try {
    const connection = await sql.promises.open(process.env.DAST_DB_CONNECTION);
    const results = await connection.promises.query(query);
    await connection.promises.close();

    // Prepare body to send back to client
    successMessage.records = results.first;
    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.log(error);
    return catchError(errMessages.daysOffFetchFailed);
  }
};

/**
 * Insert daysOff record for a user
 * @param {object} req
 * @param {object} res
 * @returns {object} return success message
 */
const setDaysOff = async (req, res) => {
  const { NationalID, PerNo } = req.user;
  const { data } = req.body;
  const id = PerNo ? PerNo : NationalID;
  let thisUser = null;
  try {
    // Fetch person
    thisUser = await fetchThisUser(id);
  } catch (error) {
    return catchError(errMessages.couldNotFetchUser, 'error', res);
  }
  let duration = 1;
  // extract all dates in between from and to
  let dates = [];
  if (data.daysOffDurationFrom)
    dates = getDatesInBetween(data.daysOffDurationFrom, data.daysOffDurationTo);
  if (data.daysOffType === 's') {
    try {
      //   Create a date for today for insert query
      const irDate = new Date().toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      //   Extract year from date
      let year = p2e(irDate.slice(0, irDate.indexOf('/')));
      const query = `select * from Holidays where year = N'${year}'`;
      const connection = await sql.promises.open(
        process.env.STATS_DB_CONNECTION
      );
      const res = await connection.promises.query(query);
      const holidays = [];
      res.first.forEach((loopHoliday) => {
        holidays.push(
          `${loopHoliday.year}/${loopHoliday.month}/${loopHoliday.day}`
        );
      });
      // remove dates that are holidays
      let legitDays = dates.filter(
        (userSelectedOffDay) => !holidays.includes(userSelectedOffDay)
      );
      // if user has entered a span
      if (legitDays.length > 1) duration = legitDays.length;
      await connection.promises.close();
    } catch (error) {
      if (error.message) return catchError(error.message, 'error', res);
      return catchError(errMessages.fetchingHolidaysFailed, 'error', res);
    }
  } else {
    // if type of daysOff is else than Anual('s'aliane)
    duration = dates.length;
  }
  try {
    const fromDate = data.daysOffDate
      ? data.daysOffDate
      : data.daysOffDurationFrom;
    const toDate = data.daysOffDate ? data.daysOffDate : data.daysOffDurationTo;
    const query = `insert into Offs (requester, successor, off_from, off_to, transit_duration, type, loc, spec_loc, department, creator, isApprovedByAdmin, isApprovedByHead, isApprovedByHR, duration) values (
    '${id}',
    '${data.successor}',
    '${fromDate}',
    '${toDate}',
    '${data.daysOffTransit}',
    '${data.daysOffType}',
    N'${data.daysOffLoc}',
    N'${data.daysOffSpecLoc}',
    '${thisUser.Department}',
    '${id}',
    '${0}',
    '${0}',
    '${0}',
    '${duration}')`;
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
 * Insert Mission for a person
 * @param {object} req
 * @param {object} res
 * @returns {object} return success message
 */
const addMission = async (req, res) => {
  const { NationalID, PerNo } = req.user;
  const { data } = req.body;
  const id = PerNo ? PerNo : NationalID;
  // let thisUser = null,
  // try {
  //   // Fetch user
  //   thisUser = await fetchThisUser(id);
  // } catch (error) {
  //   if (error.message) return catchError(error.message, 'error', res);
  //   return catchError(errMessages.couldNotFetchUser, 'error', res);
  // }
  let duration = null;
  // extract all dates in between from and to
  let dates = getDatesInBetween(
    data.missionDurationFrom,
    data.missionDurationTo
  );
  duration = dates.length;
  try {
    const irDate = p2e(
      new Date().toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    );
    // Get time
    const date = new Date();
    let timeHrs = date.getHours();
    let timeMins = date.getMinutes();
    const fromDate = data.missionDate
      ? data.missionDate
      : data.missionDurationFrom;
    const toDate = data.missionDate ? data.missionDate : data.missionDurationTo;
    const query = `insert into Missions (person_id, location, start_date, end_date, transportation, created_by, created_at, duration) values (
    '${data.who}',
    N'${data.missionLoc}',
    '${fromDate}',
    '${toDate}',
    N'${data.transportationType}',
    '${id}',
    N'${irDate},${timeHrs}:${timeMins}',
    '${duration}')`;
    const connection = await sql.promises.open(process.env.DAST_DB_CONNECTION);
    await connection.promises.query(query);
    await connection.promises.close();
    return res.status(status.success).send();
  } catch (error) {
    console.log(error);
    return catchError(errMessages.missionInsertFailed, 'error', res);
  }
};

/**
 * Insert an Agent
 * @param {object} req
 * @param {object} res
 * @returns {object} return success message
 */
const addAgent = async (req, res) => {
  // false && console.log('hello');
  const { NationalID, PerNo } = req.user;
  const { data } = req.body;
  const id = PerNo ? PerNo : NationalID;
  // let thisUser = null,
  // try {
  //   // Fetch user
  //   thisUser = await fetchThisUser(id);
  // } catch (error) {
  //   if (error.message) return catchError(error.message, 'error', res);
  //   return catchError(errMessages.couldNotFetchUser, 'error', res);
  // }
  let duration = 1;
  // extract all dates in between from and to
  let dates = getDatesInBetween(
    data.missionDurationFrom,
    data.missionDurationTo
  );
  duration = dates.length;
  try {
    const irDate = p2e(
      new Date().toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    );
    // Get time
    const date = new Date();
    let timeHrs = date.getHours();
    let timeMins = date.getMinutes();

    const fromDate = data.missionDate
      ? data.missionDate
      : data.missionDurationFrom;
    const toDate = data.missionDate ? data.missionDate : data.missionDurationTo;
    const query = `insert into Agents (person_id, location, start_date, end_date, created_by, created_at, duration, is_external, has_end) values (
    '${data.who}',
    N'${data.missionLoc}',
    '${fromDate}',
    '${toDate}',
    '${id}',
    N'${irDate},${timeHrs}:${timeMins}',
    '${duration}',
    '${data.isExternal === true ? '1' : '0'}',
    '${data.hasEnd === true ? '1' : '0'}')`;
    const connection = await sql.promises.open(process.env.DAST_DB_CONNECTION);
    await connection.promises.query(query);
    await connection.promises.close();
    return res.status(status.success).send();
  } catch (error) {
    console.log(error);
    return catchError(errMessages.agentInsertionFailed, 'error', res);
  }
};

/**
 * Fetch person from DB
 * @param {integer} id
 * @returns {object} user
 */
// const fetchThisPerson = async (id, res) => {
//   const query = `select * from NameList where PerNo = N'${id}' or NID = N'${id}'`;
//   const connection = await sql.promises.open(process.env.DAST_DB_CONNECTION);
//   const data = await connection.promises.query(query);
//   await connection.promises.close();
//   if (data.results[0].length > 0) return data.results[0][0];
//   else if (data.results[0].length < 1) return null;
// };

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
  approveStats,
  register,
  fetchTodaysStats,
  fetchDaysOff,
  fetchMissions,
  fetchAgents,
  setDaysOff,
  addMission,
  addAgent,
  approveADayOff,
  approveMission,
  approveAgent,
};

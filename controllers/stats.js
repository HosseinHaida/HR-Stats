const { isEmpty } = require("../helpers/validations");
const { catchError } = require("./catchError");
const { errMessages } = require("../helpers/error-messages");
const { successMessage, status } = require("../helpers/status");
var sql = require("msnodesqlv8");

/**
 * Insert new User
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
      return catchError(errMessages.userHasNoAuth, "bad", res);

    // Check if user is authed for the requested department id
    let isUserAuthed = false;
    authedDepartments.forEach((loopAuth) => {
      if (loopAuth.value === department) isUserAuthed = true;
    });
    if (!isUserAuthed) return catchError(errMessages.userIsNotAuthedForThisDep);
  } catch (error) {
    return catchError(errMessages.couldNotFetchUser, "error", res);
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
    parsedStats[key] = value.join(",");
  }

  console.log("parsedStats are: ", parsedStats);

  //   Create a date for today for insert query
  const irDate = new Date().toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });

  //   Extract time for insert query
  const date = new Date();
  let timeHrs = date.getHours();
  let timeMins = date.getMinutes();

  timeHrs = timeHrs < 10 ? "0" + timeHrs : timeHrs;
  timeMins = timeMins < 10 ? "0" + timeMins : timeMins;

  //   console.log(irDate, timeHrs, timeMins);

  //   if (
  //     (isEmpty(NewPerNo) && !isSoldier) ||
  //     isEmpty(NewNationalID) ||
  //     isEmpty(Rank) ||
  //     isEmpty(Department) ||
  //     isEmpty(Password) ||
  //     isEmpty(Role)
  //   ) {
  //     return catchError(errMessages.emptyFields, 'bad', res);
  //   }

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
      return catchError(errMessages.userPerNoDubplicate, "bad", res);
    console.log(error);
    return catchError(errMessages.userInsertFailed, "error", res);
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
  register,
};

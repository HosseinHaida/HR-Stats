const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { errorMessage, status } = require('../helpers/status.js');

dotenv.config();

/**
 * Verify Token
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns {object|void} response object
 */

const verifyToken = async (req, res, next) => {
  const { token } = req.headers;
  if (!token) {
    errorMessage.error = 'Token not provided';
    return res.status(status.bad).send(errorMessage);
  }
  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    req.user = {
      NationalID: decoded.NationalID,
      PerNo: decoded.PerNo,
      Name: decoded.Name,
      Family: decoded.Family,
    };
    next();
  } catch (error) {
    errorMessage.error = 'Authentication Failed';
    return res.status(status.unauthorized).send(errorMessage);
  }
};

module.exports = verifyToken;

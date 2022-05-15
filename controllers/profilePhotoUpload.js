const multer = require('multer');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.env.UPLOAD_DIR + process.env.UPLOAD_DIR_PROFILES);
  },
  filename: function (req, file, cb) {
    const { NationalID, PerNo } = req.user;
    const userId = PerNo ? PerNo : NationalID;
    const fileNameSplitedByDots = file.originalname.split('.');
    const fileFormat = fileNameSplitedByDots[fileNameSplitedByDots.length - 1];
    const fileNameToBeSaved = userId + '.' + fileFormat;
    cb(null, fileNameToBeSaved);
    req.photo_name = fileNameToBeSaved;
  },
});

const upload = multer({
  limits: {
    fileSize: 2000000000,
  },
  storage,
}).single('photo');

module.exports = {
  upload,
};

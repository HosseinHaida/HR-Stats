const multer = require('multer');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.env.UPLOAD_DIR + process.env.UPLOAD_DIR_EXCEL);
  },
  filename: function (req, file, cb) {
    const { NationalID, PerNo } = req.user;
    const userId = NationalID ? NationalID : PerNo;
    const fileNameSplitedByDots = file.originalname.split('.');
    const fileFormat = fileNameSplitedByDots[fileNameSplitedByDots.length - 1];
    let weirdName = userId + '_' + Math.floor(Math.random() * 1000000000000000);
    const fileNameToBeSaved = weirdName + '.' + fileFormat;
    cb(null, fileNameToBeSaved);
    req.uploaded_excel_file_name = fileNameToBeSaved;
  },
});

const upload = multer({
  limits: {
    fileSize: 2000000000,
  },
  storage,
}).single('excel');

module.exports = {
  upload,
};

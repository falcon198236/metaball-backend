const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads' + req.baseUrl); // Upload directory
    },
    filename: (req, file, cb) => {
        const uploadFile = `${Date.now()}-${file.originalname}`;
        cb(null, uploadFile); // Unique filename
    }
  });
  
const upload = multer({ storage: storage });

module.exports = {
    upload,
};
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const url = req.baseUrl.replace('admin/','');
      cb(null, 'uploads' + url); // Upload directory
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
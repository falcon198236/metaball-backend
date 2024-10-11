const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let url = req.baseUrl.replace('admin/','');
      url = url.replace('blog','content');
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
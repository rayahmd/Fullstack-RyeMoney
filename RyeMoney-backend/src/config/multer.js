const multer = require("multer");
const path = require("path");

// simpan ke src/uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

// filter hanya gambar
const fileFilter = (req, file, cb) => {
  const allowed = /jpg|jpeg|png/;
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowed.test(file.mimetype);
  if (extOk && mimeOk) cb(null, true);
  else cb(new Error("Only jpg/jpeg/png allowed"));
};

module.exports = multer({ storage, fileFilter });

const path = require('path');
const fs = require('fs');
const multer = require('multer');

const destino = path.join(__dirname, '..', 'public', 'uploads', 'vehiculos');

fs.mkdirSync(destino, { recursive: true });

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, destino);
  },
  filename(req, file, cb) {
    const extension = path.extname(file.originalname).toLowerCase();
    const nombre = `${Date.now()}-${Math.round(Math.random() * 1E9)}${extension}`;
    cb(null, nombre);
  }
});

function fileFilter(req, file, cb) {
  if (/^image\/(jpeg|png|webp)$/.test(file.mimetype)) {
    return cb(null, true);
  }

  const error = new Error('Formato de imagen no permitido. Usá JPG, JPEG, PNG o WEBP.');
  error.fromMulter = true;
  return cb(error);
}

const uploadVehiculos = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 8
  }
}).array('imagenes', 8);

module.exports = uploadVehiculos;

const fs = require('fs');
const path = require('path');

function urlDeArchivo(file) {
  return '/uploads/vehiculos/' + file.filename;
}

function eliminarArchivos(files) {
  (files || []).forEach((file) => {
    try {
      fs.unlinkSync(file.path);
    } catch (error) {
      void error;
    }
  });
}

function eliminarUrl(url, directorio) {
  if (!url || !url.startsWith('/uploads/vehiculos/')) return;
  try {
    fs.unlinkSync(path.join(directorio, path.basename(url)));
  } catch (error) {
    void error;
  }
}

module.exports = { urlDeArchivo, eliminarArchivos, eliminarUrl };

const db = require('../db/database');

function buscarPorEmail(email) {
  return db.prepare('SELECT id, nombre, email, password, rol FROM usuarios WHERE lower(email) = ?').get(email);
}

function buscarPorId(id) {
  return db.prepare('SELECT id, nombre, email, rol FROM usuarios WHERE id = ?').get(id);
}

function existeEmail(email) {
  return Boolean(db.prepare('SELECT 1 FROM usuarios WHERE lower(email) = ?').get(email));
}

function crear(datos) {
  return db.prepare(`
    INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)
  `).run(datos.nombre, datos.email, datos.password, datos.rol);
}

module.exports = { buscarPorEmail, buscarPorId, existeEmail, crear };

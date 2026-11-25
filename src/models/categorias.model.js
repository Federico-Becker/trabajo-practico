const db = require('../db/database');

function listar() {
  return db.prepare('SELECT id, nombre FROM categorias ORDER BY nombre').all();
}

function listarConConteo() {
  return db.prepare(`
    SELECT c.id, c.nombre, c.created_at, COUNT(v.id) AS total_vehiculos
    FROM categorias c
    LEFT JOIN vehiculos v ON v.categoria_id = c.id
    GROUP BY c.id
    ORDER BY c.nombre
  `).all();
}

function buscarPorId(id) {
  return db.prepare('SELECT id FROM categorias WHERE id = ?').get(id);
}

function crear(nombre) {
  return db.prepare('INSERT INTO categorias (nombre) VALUES (?)').run(nombre);
}

function actualizar(id, nombre) {
  return db.prepare('UPDATE categorias SET nombre = ? WHERE id = ?').run(nombre, id);
}

function eliminar(id) {
  return db.prepare('DELETE FROM categorias WHERE id = ?').run(id);
}

module.exports = { listar, listarConConteo, buscarPorId, crear, actualizar, eliminar };

const db = require('../db/database');

function listar() {
  return db.prepare('SELECT id, nombre FROM marcas ORDER BY nombre').all();
}

function listarConConteo() {
  return db.prepare(`
    SELECT m.id, m.nombre, m.created_at, COUNT(v.id) AS total_vehiculos
    FROM marcas m
    LEFT JOIN vehiculos v ON v.marca_id = m.id
    GROUP BY m.id
    ORDER BY m.nombre
  `).all();
}

function buscarPorId(id) {
  return db.prepare('SELECT id FROM marcas WHERE id = ?').get(id);
}

function crear(nombre) {
  return db.prepare('INSERT INTO marcas (nombre) VALUES (?)').run(nombre);
}

function actualizar(id, nombre) {
  return db.prepare('UPDATE marcas SET nombre = ? WHERE id = ?').run(nombre, id);
}

function eliminar(id) {
  return db.prepare('DELETE FROM marcas WHERE id = ?').run(id);
}

module.exports = { listar, listarConConteo, buscarPorId, crear, actualizar, eliminar };

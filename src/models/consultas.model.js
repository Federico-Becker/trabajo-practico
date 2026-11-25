const db = require('../db/database');

const { ESTADOS_CONSULTA } = db;

function crear(datos) {
  return db.prepare(`
    INSERT INTO consultas (vehiculo_id, nombre, email, telefono, mensaje, estado)
    VALUES (?, ?, ?, ?, ?, 'nueva')
  `).run(datos.vehiculoId, datos.nombre, datos.email, datos.telefono, datos.mensaje);
}

function listar(estado) {
  const filtros = [];
  const parametros = [];

  if (ESTADOS_CONSULTA.includes(estado)) {
    filtros.push('c.estado = ?');
    parametros.push(estado);
  }

  const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';

  return db.prepare(`
    SELECT c.*, v.modelo, m.nombre AS marca
    FROM consultas c
    JOIN vehiculos v ON v.id = c.vehiculo_id
    JOIN marcas m ON m.id = v.marca_id
    ${where}
    ORDER BY c.created_at DESC
  `).all(...parametros);
}

function cambiarEstado(id, estado) {
  return db.prepare('UPDATE consultas SET estado = ? WHERE id = ?').run(estado, id);
}

function contarNuevas() {
  return db.prepare("SELECT COUNT(*) AS total FROM consultas WHERE estado = 'nueva'").get().total;
}

function listarRecientes() {
  return db.prepare(`
    SELECT c.id, c.nombre, c.email, c.estado, c.created_at, v.modelo, m.nombre AS marca
    FROM consultas c
    JOIN vehiculos v ON v.id = c.vehiculo_id
    JOIN marcas m ON m.id = v.marca_id
    ORDER BY c.created_at DESC
    LIMIT 5
  `).all();
}

module.exports = { crear, listar, cambiarEstado, contarNuevas, listarRecientes };

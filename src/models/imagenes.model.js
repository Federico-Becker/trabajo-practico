const db = require('../db/database');

function listarPorVehiculo(vehiculoId) {
  return db.prepare(`
    SELECT id, url, orden, tipo FROM vehiculo_imagenes
    WHERE vehiculo_id = ?
    ORDER BY orden ASC, id ASC
  `).all(vehiculoId);
}

function listarUrlsPorVehiculo(vehiculoId) {
  return db.prepare('SELECT url FROM vehiculo_imagenes WHERE vehiculo_id = ?').all(vehiculoId);
}

function insertar(vehiculoId, url, orden, tipo) {
  return db.prepare(`
    INSERT INTO vehiculo_imagenes (vehiculo_id, url, orden, tipo) VALUES (?, ?, ?, ?)
  `).run(vehiculoId, url, orden, tipo);
}

function buscarParaEliminar(vehiculoId, ids) {
  if (!ids.length) return [];
  const marcadores = ids.map(() => '?').join(', ');
  return db.prepare(`
    SELECT id, url FROM vehiculo_imagenes
    WHERE vehiculo_id = ? AND id IN (${marcadores})
  `).all(vehiculoId, ...ids);
}

function eliminarPorIds(vehiculoId, ids) {
  if (!ids.length) return { changes: 0 };
  const marcadores = ids.map(() => '?').join(', ');
  return db.prepare(`
    DELETE FROM vehiculo_imagenes
    WHERE vehiculo_id = ? AND id IN (${marcadores})
  `).run(vehiculoId, ...ids);
}

function maxOrden(vehiculoId) {
  return db.prepare(`
    SELECT COALESCE(MAX(orden), -1) AS maximo FROM vehiculo_imagenes WHERE vehiculo_id = ?
  `).get(vehiculoId).maximo;
}

function eliminarPorVehiculo(vehiculoId) {
  return db.prepare('DELETE FROM vehiculo_imagenes WHERE vehiculo_id = ?').run(vehiculoId);
}

module.exports = {
  listarPorVehiculo,
  listarUrlsPorVehiculo,
  insertar,
  buscarParaEliminar,
  eliminarPorIds,
  maxOrden,
  eliminarPorVehiculo
};

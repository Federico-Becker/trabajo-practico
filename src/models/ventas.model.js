const db = require('../db/database');

function listar() {
  return db.prepare(`
    SELECT vta.*, v.modelo, v.anio, m.nombre AS marca
    FROM ventas vta
    JOIN vehiculos v ON v.id = vta.vehiculo_id
    JOIN marcas m ON m.id = v.marca_id
    ORDER BY vta.fecha_venta DESC, vta.id DESC
  `).all();
}

function registrar(datos) {
  return db.transaction(() => {
    db.prepare(`
      INSERT INTO ventas
        (vehiculo_id, comprador_nombre, comprador_email, comprador_telefono, metodo_pago, monto, observaciones)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      datos.vehiculoId,
      datos.compradorNombre,
      datos.compradorEmail || null,
      datos.compradorTelefono || null,
      datos.metodoPago,
      datos.monto,
      datos.observaciones || null
    );

    db.prepare("UPDATE vehiculos SET estado = 'vendido', updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .run(datos.vehiculoId);
  })();
}

function total() {
  return db.prepare('SELECT COUNT(*) AS total, COALESCE(SUM(monto), 0) AS monto FROM ventas').get();
}

module.exports = { listar, registrar, total };

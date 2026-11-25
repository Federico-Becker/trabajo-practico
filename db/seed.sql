INSERT OR IGNORE INTO usuarios (id, nombre, email, password, rol) VALUES
  (1, 'Administrador', 'admin@concesionaria.com', '$2a$10$VLirGXB98cNemvTOpItBS.w8ep3KVU.r4YOPFA4AQFdLbTFI9Rmgm', 'admin'),
  (2, 'Vendedor', 'vendedor@concesionaria.com', '$2a$10$VLirGXB98cNemvTOpItBS.w8ep3KVU.r4YOPFA4AQFdLbTFI9Rmgm', 'usuario');

INSERT OR IGNORE INTO marcas (id, nombre) VALUES
  (1, 'Toyota'),
  (2, 'Volkswagen'),
  (3, 'Ford'),
  (4, 'Chevrolet'),
  (5, 'Renault'),
  (6, 'Peugeot');

INSERT OR IGNORE INTO categorias (id, nombre) VALUES
  (1, 'Sedán'),
  (2, 'SUV'),
  (3, 'Hatchback'),
  (4, 'Pickup'),
  (5, 'Coupé');

INSERT OR IGNORE INTO vehiculos (id, marca_id, categoria_id, modelo, anio, precio, kilometraje, combustible, transmision, color, descripcion, estado, destacado) VALUES
  (1, 1, 1, 'Corolla XEi', 2022, 24500000, 32000, 'Nafta', 'Automático', 'Gris', 'Sedán compacto con bajo kilometraje, mantenimiento al día y dos años de garantía.', 'disponible', 1),
  (2, 2, 2, 'Tiguan Comfortline', 2021, 31800000, 41000, 'Nafta', 'Automático', 'Blanco', 'SUV familiar con techo panorámico, cámara trasera y sensores de estacionamiento.', 'disponible', 1),
  (3, 3, 4, 'F-150 XLT', 2020, 42500000, 68000, 'Diésel', 'Automático', 'Negro', 'Pickup doble cabina con tracción 4x4, caja larga y equipamiento completo.', 'reservado', 0),
  (4, 4, 1, 'Cruze LT', 2019, 19800000, 75000, 'Nafta', 'Manual', 'Plata', 'Sedán cómodo y económico, ideal para uso urbano y ruta.', 'disponible', 0),
  (5, 5, 3, 'Clio Intense', 2023, 21500000, 12000, 'Nafta', 'Manual', 'Rojo', 'Hatchback nuevo con pantalla táctil, Bluetooth y consumos muy bajos.', 'disponible', 1),
  (6, 6, 3, '208 Allure', 2022, 22400000, 24000, 'Nafta', 'Automático', 'Azul', 'Hatchback francés con diseño moderno y excelente estado general.', 'vendido', 0),
  (7, 1, 5, '86 GT', 2018, 28900000, 51000, 'Nafta', 'Manual', 'Naranja', 'Coupé deportivo con tracción trasera, escape deportivo y bajo kilometraje.', 'disponible', 0);

INSERT OR IGNORE INTO vehiculo_imagenes (id, vehiculo_id, url, orden) VALUES
  (1, 1, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==', 0),
  (2, 1, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==', 1),
  (3, 2, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==', 0),
  (4, 5, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==', 0);

INSERT OR IGNORE INTO consultas (id, vehiculo_id, nombre, email, telefono, mensaje, estado) VALUES
  (1, 1, 'Martina López', 'martina@example.com', '2615551101', '¿El precio es negociable?', 'nueva'),
  (2, 2, 'Facundo Ruiz', 'facundo@example.com', '2615551102', 'Quiero coordinar una prueba de manejo.', 'en_gestion'),
  (3, 5, 'Sofía Pérez', 'sofia@example.com', '2615551103', '¿Aceptan permuta?', 'cerrada');

INSERT OR IGNORE INTO ventas (id, vehiculo_id, comprador_nombre, comprador_email, comprador_telefono, metodo_pago, monto, fecha_venta, observaciones) VALUES
  (1, 6, 'Diego Fernández', 'diego@example.com', '2615551104', 'Transferencia', 22000000, '2026-11-10', 'Venta concretada con entrega en sucursal.');

# Beckars Concecionaria

Aplicación web de concesionaria con catálogo público, consultas de clientes y panel administrativo para gestión de vehículos, marcas, categorías, consultas y ventas.

## Stack

- Node.js + Express
- EJS para vistas
- SQLite con `better-sqlite3`
- `express-session` para autenticación
- `multer` para subida de imágenes
- `bcryptjs` para contraseñas

## Instalación

```bash
npm install
npm run seed
npm run dev
```

También podés iniciar sin watch con:

```bash
npm start
```

## URLs

- Catálogo público: http://localhost:3000
- Login: http://localhost:3000/login
- Panel admin: http://localhost:3000/admin

## Usuario administrador por defecto

- Email: `admin@concesionaria.com`
- Contraseña: `admin123`

## Base de datos

La base se crea automáticamente en `db/concesionaria.sqlite`.

Tablas: `usuarios`, `marcas`, `categorias`, `vehiculos`, `vehiculo_imagenes`, `consultas`, `ventas`.

El seed carga datos de prueba y usa `INSERT OR IGNORE`, por lo que no sobrescribe registros existentes.

## Imágenes

Las imágenes de vehículos se guardan en `public/uploads/vehiculos/` y se sirven desde `/uploads/vehiculos/`.

Formatos permitidos: JPG, JPEG, PNG y WEBP. Máximo 5 MB por imagen y hasta 8 imágenes por vehículo.

## Variables de entorno

- `PORT`: puerto del servidor, por defecto `3000`.
- `HOST` o `IP`: interfaz de escucha, por defecto `0.0.0.0`.
- `SESSION_SECRET`: secreto de sesión, por defecto `'secreto-desarrollo-cambiar'`.
- `NODEJS_VERSION`: versión de Node en AlwaysData, usar `22`.

## Deploy en AlwaysData

1. Subí el código a GitHub y clonalo en `~/www/concesionaria` por SSH.
2. Dentro del proyecto: `npm install` y `npm run seed`.
3. En Web > Sites creá un sitio de tipo Node.js con comando `node /home/<cuenta>/www/concesionaria/app.js` y directorio de trabajo `www/concesionaria`.
4. Elegí Node.js 22 y configurá `SESSION_SECRET` (y opcionalmente `NODEJS_VERSION=22`). `HOST` y `PORT` los inyecta AlwaysData.
5. Verificá que `db/` y `public/uploads/vehiculos/` sean escribibles.

El plan Free incluye 1 GB SSD, 256 MB RAM y 1/4 CPU. Para producción conviene Plus por la memoria y los backups.

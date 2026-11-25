function destinoConMensaje(destino, clave, mensaje) {
  return `${destino}?${clave}=${encodeURIComponent(mensaje)}`;
}

module.exports = { destinoConMensaje };

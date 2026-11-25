function renderConLayout(res, next, vista, datos = {}, opciones = {}) {
  res.render(vista, datos, (error, contenido) => {
    if (error) {
      console.error(error);
      return next(error);
    }

    return res.render('layout', {
      ...datos,
      titulo: datos.titulo || 'Beckars Concecionaria',
      contenido,
      scripts: opciones.scripts || []
    });
  });
}

module.exports = { renderConLayout };

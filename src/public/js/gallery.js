document.addEventListener('DOMContentLoaded', () => {
  const galeria = document.querySelector('[data-gallery]');
  if (!galeria) return;

  const imagen = galeria.querySelector('#imagenPrincipal');
  if (!imagen) return;

  const etiqueta = galeria.querySelector('[data-gallery-caption]');
  const contador = galeria.querySelector('[data-gallery-count]');
  const pestanas = Array.from(galeria.querySelectorAll('[data-gallery-tab]'));
  const paneles = Array.from(galeria.querySelectorAll('[data-gallery-panel]'));
  const miniaturas = Array.from(galeria.querySelectorAll('[data-gallery-image]'));
  const lightbox = document.querySelector('[data-lightbox]');
  const lightboxImagen = document.querySelector('[data-lightbox-image]');
  const lightboxEtiqueta = document.querySelector('[data-lightbox-caption]');
  const botonCerrar = document.querySelector('[data-lightbox-close]');
  let seleccionada = miniaturas[0];

  function activar(boton) {
    if (!boton) return;
    seleccionada = boton;
    imagen.src = boton.dataset.galleryImage;
    imagen.alt = boton.dataset.galleryLabel;
    if (etiqueta) etiqueta.textContent = boton.dataset.galleryLabel;

    const panel = boton.closest('[data-gallery-panel]');
    const lista = panel ? Array.from(panel.querySelectorAll('[data-gallery-image]')) : miniaturas;
    if (contador) contador.textContent = `${lista.indexOf(boton) + 1} / ${lista.length}`;

    miniaturas.forEach((miniatura) => miniatura.classList.toggle('activo', miniatura === boton));
  }

  pestanas.forEach((pestana) => {
    pestana.addEventListener('click', () => {
      pestanas.forEach((otra) => {
        otra.classList.toggle('activo', otra === pestana);
        otra.setAttribute('aria-selected', String(otra === pestana));
      });

      paneles.forEach((panel) => {
        panel.classList.toggle('activo', panel.dataset.galleryPanel === pestana.dataset.galleryTab);
      });

      const panelActivo = paneles.find((panel) => panel.dataset.galleryPanel === pestana.dataset.galleryTab);
      activar(panelActivo ? panelActivo.querySelector('[data-gallery-image]') : null);
    });
  });

  miniaturas.forEach((miniatura) => miniatura.addEventListener('click', () => activar(miniatura)));

  function abrir() {
    if (!lightbox || !lightboxImagen || !seleccionada) return;
    lightboxImagen.src = seleccionada.dataset.galleryImage;
    lightboxImagen.alt = seleccionada.dataset.galleryLabel;
    if (lightboxEtiqueta) lightboxEtiqueta.textContent = seleccionada.dataset.galleryLabel;
    lightbox.hidden = false;
    document.body.classList.add('lightbox-abierto');
  }

  function cerrar() {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.classList.remove('lightbox-abierto');
  }

  const botonAmpliar = galeria.querySelector('[data-gallery-zoom]');
  if (botonAmpliar) botonAmpliar.addEventListener('click', abrir);
  if (botonCerrar) botonCerrar.addEventListener('click', cerrar);
  if (lightbox) {
    lightbox.addEventListener('click', (evento) => {
      if (evento.target === lightbox) cerrar();
    });
  }

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape') cerrar();
  });

  activar(seleccionada);
});

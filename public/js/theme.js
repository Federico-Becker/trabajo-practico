(function () {
  const CLAVE = 'beckars-tema';
  let guardado = 'light';

  try {
    guardado = localStorage.getItem(CLAVE) || 'light';
  } catch (error) {
    void error;
  }

  const tema = guardado === 'dark' || guardado === 'light' ? guardado : 'light';
  document.documentElement.dataset.theme = tema;

  document.addEventListener('DOMContentLoaded', () => {
    const selector = document.querySelector('[data-theme-select]');
    if (!selector) return;

    selector.value = tema;
    selector.addEventListener('change', () => {
      document.documentElement.dataset.theme = selector.value;
      try {
        localStorage.setItem(CLAVE, selector.value);
      } catch (error) {
        void error;
      }
    });
  });
})();

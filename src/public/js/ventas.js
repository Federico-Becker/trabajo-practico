document.addEventListener('DOMContentLoaded', () => {
  const selectorVehiculo = document.getElementById('vehiculo-venta');
  const campoMonto = document.getElementById('monto-venta');
  if (!selectorVehiculo || !campoMonto) return;

  selectorVehiculo.addEventListener('change', function () {
    const opcion = this.options[this.selectedIndex];
    if (opcion && opcion.dataset.precio) {
      campoMonto.value = opcion.dataset.precio;
    }
  });
});

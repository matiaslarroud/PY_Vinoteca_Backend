const { round2 } = require('./http');

// Precio de lista de un producto: vinos e insumos = costo + ganancia; picadas = precio de venta.
const calcularPrecioProducto = (producto) => {
  if (
    producto.tipoProducto === "ProductoVino" ||
    producto.tipoProducto === "ProductoInsumo"
  ) {
    if (producto.precioCosto != null && producto.ganancia != null) {
      return round2(producto.precioCosto + (producto.precioCosto * producto.ganancia / 100));
    }
    return 0;
  }

  // Picadas
  if (producto.precioVenta != null) {
    return round2(producto.precioVenta);
  }

  return 0;
};

// Precio que paga el cliente de la tienda: el de oferta si el producto está en oferta.
const calcularPrecioEfectivo = (producto) =>
  producto.enOferta && producto.precioOferta != null
    ? round2(producto.precioOferta)
    : calcularPrecioProducto(producto);

// Ajuste máximo permitido sobre el total calculado (redondeo manual del vendedor).
const TOLERANCIA_AJUSTE_TOTAL = 0.05;

// Valida el total editado por el vendedor contra el total calculado por el servidor.
const validarTotalConAjuste = (totalIngresado, totalCalculado) => {
  const total = round2(totalIngresado);
  const margen = round2(totalCalculado * TOLERANCIA_AJUSTE_TOTAL);
  if (!Number.isFinite(total) || total <= 0) {
    throw Object.assign(new Error('❌ El total debe ser un número mayor a 0.'), { status: 400 });
  }
  if (Math.abs(total - totalCalculado) > margen) {
    throw Object.assign(new Error(
      `❌ El total ingresado ($${total}) difiere más del 5% del total calculado ($${totalCalculado}).`
    ), { status: 400 });
  }
  return total;
};

module.exports = { calcularPrecioProducto, calcularPrecioEfectivo, validarTotalConAjuste, TOLERANCIA_AJUSTE_TOTAL };

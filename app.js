const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const auth = require('./middleware/auth.js');
const sanitizeBody = require('./middleware/sanitizeBody.js');
const { staff } = require('./middleware/requireRole.js');
const { errorClaveDuplicada } = require('./utils/http.js');

const routerProductVino = require('./routes/productVino_Router.js');
const routerProductVinoDetalle = require('./routes/productVinoDetalle_Router.js');
const routerProductVinoCrianza = require('./routes/productVino_crianza_Router.js');
const routerBodega = require('./routes/bodega_Router.js');
const routerParaje = require('./routes/bodega-paraje_Router.js');
const routerPais = require('./routes/pais_Router.js');
const routerProvincia = require('./routes/provincia_Router.js');
const routerLocalidad = require('./routes/localidad_Router.js');
const routerBarrio = require('./routes/barrio_Router.js');
const routerCalle = require('./routes/calle_Router.js');
const routerProductVinoUva = require('./routes/productVino_uva_Router.js');
const routerProductVinoTipo = require('./routes/productVino_VinoTipo_Router.js');
const routerProductVinoVarietal = require('./routes/productVino_varietal_Router.js');
const routerDeposito = require('./routes/deposito_Router.js');
const routerVolumen = require('./routes/productVino_volumen_Router.js');
const routerMedioPago = require('./routes/medioPago_Router.js');
const routerCondicionIva = require('./routes/condicionIva_Router.js');
const routerCliente = require('./routes/cliente_Router.js');
const routerEmpleado = require('./routes/empleado_Router.js');
const routerCliente_Presupuesto = require('./routes/clientePresupuesto_Router.js');
const routerCliente_PresupuestoDetalle = require('./routes/clientePresupuestoDetalle_Router.js');
const routerProducts = require('./routes/product_Router.js');
const routerPicadas = require('./routes/productPicada_Router.js');
const routerPicadasDetalle = require('./routes/productPicadaDetalle_Router.js');
const routerProveedor = require('./routes/proveedor_Router.js');
const routerInsumos = require('./routes/productInsumo_Router.js');
const routerCliente_NotaPedido = require('./routes/clienteNotaPedido_Router.js');
const routerCliente_NotaPedidoDetalle = require('./routes/clienteNotaPedidoDetalle_Router.js');
const routerCliente_ComprobanteVenta = require('./routes/clienteComprobanteVenta_Router.js');
const routerCliente_ComprobanteVentaDetalle = require('./routes/clienteComprobanteVentaDetalle_Router.js');
const routerCliente_Remito = require('./routes/clienteRemito_Router.js');
const routerCliente_RemitoDetalle = require('./routes/clienteRemitoDetalle_Router.js');
const routerTipoComprobante = require('./routes/tipoComprobante_Router.js');
const routerTransporte = require('./routes/transporte_Router.js');
const routerOrdenProduccion = require('./routes/ordenProduccion_Router.js');
const routerOrdenProduccionDetalle = require('./routes/ordenProduccionDetalle_Router.js');
const routerProveedor_Presupuesto = require('./routes/proveedorPresupuesto_Router.js');
const routerProveedor_PresupuestoDetalle = require('./routes/proveedorPresupuestoDetalle_Router.js');
const routerProveedor_SolicitudPresupuesto = require('./routes/proveedorSolicitudPresupuesto_Router.js');
const routerProveedor_SolicitudPresupuestoDetalle = require('./routes/proveedorSolicitudPresupuestoDetalle_Router.js');
const routerCliente_ReciboPago = require('./routes/clienteReciboPago_Router.js');
const routerProveedor_OrdenCompra = require('./routes/proveedorOrdenCompra_Router.js');
const routerProveedor_OrdenCompraDetalle = require('./routes/proveedorOrdenCompraDetalle_Router.js');
const routerProveedor_ComprobanteCompra = require('./routes/proveedorComprobanteCompra_Router.js');
const routerProveedor_ComprobanteCompraDetalle = require('./routes/proveedorComprobanteCompraDetalle_Router.js');
const routerProveedor_ComprobantePago = require('./routes/proveedorComprobantePago_Router.js');
const routerProveedor_Remito = require('./routes/proveedorRemito_Router.js');
const routerProveedor_RemitoDetalle = require('./routes/proveedorRemitoDetalle_Router.js');
const routerUsuario = require('./routes/usuario_Router.js');
const routerTienda_Presupuesto = require('./routes/tiendaPresupuesto_Router.js');
const pingServer = require('./routes/pingServer.js');
const routerProductofoto = require('./routes/productoFoto_Router.js');
const routerCaja = require('./routes/caja_Router.js');
const routerOferta = require('./routes/productOferta_Router.js');
const routerOfertaDetalle = require('./routes/productOfertaDetalle_Router.js');

const app = express();

const isProduction = process.env.NODE_ENV === 'production';

app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(sanitizeBody);
app.use(cors({
  origin: (origin, callback) => {
    const allowed = process.env.BASE_URL;
    const esLocalhost = /^http:\/\/localhost:\d+$/.test(origin || '');
    if (!origin || origin === allowed || (!isProduction && esLocalhost)) {
      callback(null, true);
    } else {
      callback(Object.assign(new Error(`CORS: origen no permitido: ${origin}`), { status: 403 }));
    }
  },
  credentials: true,
}));

const R = process.env.ROUTE || '';

// Limita los intentos de login para frenar ataques de fuerza bruta.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { ok: false, message: '❌ Demasiados intentos de inicio de sesión. Intente más tarde.' },
});

// Rutas públicas
app.use(`${R}/ping`, pingServer);
app.use(`${R}/usuario/login`, loginLimiter);
app.use(`${R}/usuario`, routerUsuario);

// Rutas que requieren sesión (cualquier rol, incluido "cliente" de la tienda online)
app.use(auth);

app.use(`${R}/tienda/presupuesto`, routerTienda_Presupuesto);
app.use(`${R}/products/productFoto`, routerProductofoto);

// Rutas del personal del negocio (administrador / vendedor)
app.use(staff);

app.use(`${R}/products/productVino`, routerProductVino);
app.use(`${R}/products/productVinoDetalle`, routerProductVinoDetalle);
app.use(`${R}/products/productPicada`, routerPicadas);
app.use(`${R}/products/productInsumo`, routerInsumos);
app.use(`${R}/products/productPicadaDetalle`, routerPicadasDetalle);
app.use(`${R}/products/ordenProduccion`, routerOrdenProduccion);
app.use(`${R}/products/ordenProduccionDetalle`, routerOrdenProduccionDetalle);
app.use(`${R}/products/oferta`, routerOferta);
app.use(`${R}/products/ofertaDetalle`, routerOfertaDetalle);

app.use(`${R}/gestion/bodega`, routerBodega);
app.use(`${R}/gestion/bodega-paraje`, routerParaje);
app.use(`${R}/gestion/pais`, routerPais);
app.use(`${R}/gestion/provincia`, routerProvincia);
app.use(`${R}/gestion/localidad`, routerLocalidad);
app.use(`${R}/gestion/barrio`, routerBarrio);
app.use(`${R}/gestion/calle`, routerCalle);
app.use(`${R}/gestion/crianza`, routerProductVinoCrianza);
app.use(`${R}/gestion/uva`, routerProductVinoUva);
app.use(`${R}/gestion/tipoVino`, routerProductVinoTipo);
app.use(`${R}/gestion/varietal`, routerProductVinoVarietal);
app.use(`${R}/gestion/deposito`, routerDeposito);
app.use(`${R}/gestion/volumen`, routerVolumen);
app.use(`${R}/gestion/mediopago`, routerMedioPago);
app.use(`${R}/gestion/condicioniva`, routerCondicionIva);
app.use(`${R}/gestion/cliente`, routerCliente);
app.use(`${R}/gestion/products`, routerProducts);
app.use(`${R}/gestion/empleado`, routerEmpleado);
app.use(`${R}/gestion/tipoComprobante`, routerTipoComprobante);
app.use(`${R}/gestion/transporte`, routerTransporte);
app.use(`${R}/gestion/proveedor`, routerProveedor);
app.use(`${R}/gestion/caja`, routerCaja);

app.use(`${R}/cliente/presupuesto`, routerCliente_Presupuesto);
app.use(`${R}/cliente/presupuestoDetalle`, routerCliente_PresupuestoDetalle);
app.use(`${R}/cliente/notaPedido`, routerCliente_NotaPedido);
app.use(`${R}/cliente/notaPedidoDetalle`, routerCliente_NotaPedidoDetalle);
app.use(`${R}/cliente/comprobanteVenta`, routerCliente_ComprobanteVenta);
app.use(`${R}/cliente/comprobanteVentaDetalle`, routerCliente_ComprobanteVentaDetalle);
app.use(`${R}/cliente/remito`, routerCliente_Remito);
app.use(`${R}/cliente/remitoDetalle`, routerCliente_RemitoDetalle);
app.use(`${R}/cliente/reciboPago`, routerCliente_ReciboPago);

app.use(`${R}/proveedor/solicitudPresupuesto`, routerProveedor_SolicitudPresupuesto);
app.use(`${R}/proveedor/solicitudPresupuestoDetalle`, routerProveedor_SolicitudPresupuestoDetalle);
app.use(`${R}/proveedor/presupuesto`, routerProveedor_Presupuesto);
app.use(`${R}/proveedor/presupuestoDetalle`, routerProveedor_PresupuestoDetalle);
app.use(`${R}/proveedor/ordenCompra`, routerProveedor_OrdenCompra);
app.use(`${R}/proveedor/ordenCompraDetalle`, routerProveedor_OrdenCompraDetalle);
app.use(`${R}/proveedor/comprobanteCompra`, routerProveedor_ComprobanteCompra);
app.use(`${R}/proveedor/comprobanteCompraDetalle`, routerProveedor_ComprobanteCompraDetalle);
app.use(`${R}/proveedor/comprobantePago`, routerProveedor_ComprobantePago);
app.use(`${R}/proveedor/remito`, routerProveedor_Remito);
app.use(`${R}/proveedor/remitoDetalle`, routerProveedor_RemitoDetalle);

// Ruta inexistente
app.use((req, res) => {
  res.status(404).json({ ok: false, message: '❌ Ruta no encontrada.' });
});

// Manejador de errores global: siempre responde JSON y no expone detalles internos.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  err = errorClaveDuplicada(err) || err;
  const status = err.status || err.statusCode
    || (['CastError', 'ValidationError', 'MulterError'].includes(err.name) ? 400 : 500);
  if (status >= 500) console.error(err);
  if (res.headersSent) return res.end();
  res.status(status).json({
    ok: false,
    message: status >= 500 ? '❌ Error interno del servidor.' : err.message,
  });
});

module.exports = app;

const express = require('express');
const path = require('path');
require('dotenv').config();
const cors = require('cors');
const connectDB = require('./db/db.js')


const routerProductVino = require('./routes/productVino_Router.js')
const routerProductVinoDetalle = require('./routes/productVinoDetalle_Router.js')
const routerProductVinoCrianza = require('./routes/productVino_crianza_Router.js')
const routerBodega = require('./routes/bodega_Router.js')
const routerParaje = require('./routes/bodega-paraje_Router.js')
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
const routerCliente_Remito= require('./routes/clienteRemito_Router.js');
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
const pingServer = require('./routes/pingServer.js');
const routerProductofoto = require('./routes/productoFoto_Router.js');
const routerCaja = require('./routes/caja_Router.js');

const app = express();

connectDB(app);

app.use(express.json());
app.use(cors());

app.use(`${process.env.ROUTE}/ping`,pingServer);

app.use(`${process.env.ROUTE}/usuario`, routerUsuario);

app.use(`${process.env.ROUTE}/products/productVino`, routerProductVino);
app.use(`${process.env.ROUTE}/products/productFoto`, routerProductofoto);
app.use(`${process.env.ROUTE}/products/productVinoDetalle`, routerProductVinoDetalle);
app.use(`${process.env.ROUTE}/products/productPicada`, routerPicadas);
app.use(`${process.env.ROUTE}/products/productInsumo`, routerInsumos);
app.use(`${process.env.ROUTE}/products/productPicadaDetalle`, routerPicadasDetalle);
app.use(`${process.env.ROUTE}/products/ordenProduccion` , routerOrdenProduccion);
app.use(`${process.env.ROUTE}/products/ordenProduccionDetalle` , routerOrdenProduccionDetalle);

app.use(`${process.env.ROUTE}/gestion/bodega` , routerBodega);
app.use(`${process.env.ROUTE}/gestion/bodega-paraje` , routerParaje);
app.use(`${process.env.ROUTE}/gestion/pais` , routerPais);
app.use(`${process.env.ROUTE}/gestion/provincia` , routerProvincia);
app.use(`${process.env.ROUTE}/gestion/localidad` , routerLocalidad);
app.use(`${process.env.ROUTE}/gestion/barrio` , routerBarrio);
app.use(`${process.env.ROUTE}/gestion/calle` , routerCalle);
app.use(`${process.env.ROUTE}/gestion/crianza` , routerProductVinoCrianza);
app.use(`${process.env.ROUTE}/gestion/uva` , routerProductVinoUva);
app.use(`${process.env.ROUTE}/gestion/tipoVino` , routerProductVinoTipo);
app.use(`${process.env.ROUTE}/gestion/varietal` , routerProductVinoVarietal);
app.use(`${process.env.ROUTE}/gestion/deposito` , routerDeposito);
app.use(`${process.env.ROUTE}/gestion/volumen` , routerVolumen);
app.use(`${process.env.ROUTE}/gestion/mediopago` , routerMedioPago);
app.use(`${process.env.ROUTE}/gestion/condicioniva` , routerCondicionIva);
app.use(`${process.env.ROUTE}/gestion/cliente` , routerCliente);
app.use(`${process.env.ROUTE}/gestion/products` , routerProducts);
app.use(`${process.env.ROUTE}/gestion/empleado` , routerEmpleado);
app.use(`${process.env.ROUTE}/gestion/tipoComprobante` , routerTipoComprobante);
app.use(`${process.env.ROUTE}/gestion/transporte` , routerTransporte);
app.use(`${process.env.ROUTE}/gestion/proveedor` , routerProveedor); 
app.use(`${process.env.ROUTE}/gestion/caja` , routerCaja); 

app.use(`${process.env.ROUTE}/cliente/presupuesto` , routerCliente_Presupuesto);
app.use(`${process.env.ROUTE}/cliente/presupuestoDetalle` , routerCliente_PresupuestoDetalle);
app.use(`${process.env.ROUTE}/cliente/notaPedido` , routerCliente_NotaPedido);
app.use(`${process.env.ROUTE}/cliente/notaPedidoDetalle` , routerCliente_NotaPedidoDetalle);
app.use(`${process.env.ROUTE}/cliente/comprobanteVenta` , routerCliente_ComprobanteVenta);
app.use(`${process.env.ROUTE}/cliente/comprobanteVentaDetalle` , routerCliente_ComprobanteVentaDetalle);
app.use(`${process.env.ROUTE}/cliente/remito` , routerCliente_Remito);
app.use(`${process.env.ROUTE}/cliente/remitoDetalle` , routerCliente_RemitoDetalle);
app.use(`${process.env.ROUTE}/cliente/reciboPago` , routerCliente_ReciboPago);

app.use(`${process.env.ROUTE}/proveedor/solicitudPresupuesto` , routerProveedor_SolicitudPresupuesto);
app.use(`${process.env.ROUTE}/proveedor/solicitudPresupuestoDetalle` , routerProveedor_SolicitudPresupuestoDetalle);
app.use(`${process.env.ROUTE}/proveedor/presupuesto` , routerProveedor_Presupuesto);
app.use(`${process.env.ROUTE}/proveedor/presupuestoDetalle` , routerProveedor_PresupuestoDetalle);
app.use(`${process.env.ROUTE}/proveedor/ordenCompra` , routerProveedor_OrdenCompra);
app.use(`${process.env.ROUTE}/proveedor/ordenCompraDetalle` , routerProveedor_OrdenCompraDetalle);
app.use(`${process.env.ROUTE}/proveedor/comprobanteCompra` , routerProveedor_ComprobanteCompra);
app.use(`${process.env.ROUTE}/proveedor/comprobanteCompraDetalle` , routerProveedor_ComprobanteCompraDetalle);
app.use(`${process.env.ROUTE}/proveedor/comprobantePago` , routerProveedor_ComprobantePago);
app.use(`${process.env.ROUTE}/proveedor/remito` , routerProveedor_Remito);
app.use(`${process.env.ROUTE}/proveedor/remitoDetalle` , routerProveedor_RemitoDetalle);
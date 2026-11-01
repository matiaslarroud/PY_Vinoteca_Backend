const NotaPedido = require("../models/clienteNotaPedido_Model");
const NotaPedidoDetalle = require("../models/clienteNotaPedidoDetalle_Model");
const PresupuestoDetalle = require("../models/clientePresupuestoDetalle_Model");
const Presupuesto = require("../models/clientePresupuesto_Model");
const ComprobanteVenta = require("../models/clienteComprobanteVenta_Model");
const Producto = require("../models/producto_Model");
const MedioPago = require("../models/medioPago_Model")
const Cliente = require("../models/cliente_Model")
const getNextSequence = require("../controllers/counter_Controller");
const mongoose = require('mongoose');

const { obtenerFechaHoy } = require('../utils/fecha');
const { httpError, round2 } = require('../utils/http');
const { descontarStock, sumarStock, validarCantidad } = require('../utils/stock');
const { calcularPrecioProducto, validarTotalConAjuste } = require('../utils/precios');
const { crearMovimientoCaja, buscarMovimientosDeOrigen, moverSaldoCuentaCorriente } = require('../utils/caja');
const { estaVigente } = require('../utils/presupuesto');
const { leerPaginacion, paginar } = require('../utils/paginacion');

const ORIGEN = 'NOTA_PEDIDO';
const referenciaNota = (id) => `Nota de Pedido Cliente N°: ${id}.`;
const referenciaAjuste = (id) => `Ajuste Nota de Pedido Cliente N°: ${id}.`;

const esCuentaCorriente = (nombre) => nombre === "Cuenta Corriente";
// Un medio de pago genera movimiento de caja en efectivo (ENTRADA/SALIDA) si no es CC ni "A coordinar".
const esCajaEfectivo = (nombre) => !!nombre && nombre !== "Cuenta Corriente" && nombre !== "A coordinar";

const responderError = (res, error) =>
  res.status(error.status && error.status < 500 ? error.status : 400).json({ ok: false, message: error.message });

// Una nota está facturada si tiene un Comprobante de Venta ACTIVO (se consulta en la BD,
// nunca se confía en lo que manda el cliente).
const estaFacturada = (notaID, session) =>
  ComprobanteVenta.exists({ notaPedido: notaID, estado: true }).session(session);

// Calcula precio e importe de cada línea en el servidor.
// Prioridad del precio: precio de la nota original (al editar) > precio negociado del presupuesto
// (solo si está vigente) > precio de lista actual.
const prepararDetalles = async ({ detalles, presupuesto, preciosPrevios = new Map(), session }) => {
  if (!Array.isArray(detalles) || detalles.length === 0) {
    throw httpError(400, "❌ La nota de pedido debe tener al menos un detalle.");
  }

  const preciosPresupuesto = new Map();
  if (presupuesto && estaVigente(presupuesto)) {
    const detPresupuesto = await PresupuestoDetalle
      .find({ presupuesto: presupuesto._id, estado: true }, 'producto precio')
      .session(session).lean();
    for (const d of detPresupuesto) preciosPresupuesto.set(Number(d.producto), d.precio);
  }

  const ids = detalles.map(d => Number(d.producto));
  const productos = await Producto.find({ _id: { $in: ids }, estado: true }).session(session).lean();
  const productosPorId = new Map(productos.map(p => [p._id, p]));

  let totalCalculado = 0;
  const lineas = detalles.map((det) => {
    const productoID = Number(det.producto);
    const producto = productosPorId.get(productoID);
    if (!producto) throw httpError(400, `❌ Producto no encontrado o inactivo (ID ${det.producto}).`);
    const cantidad = validarCantidad(det.cantidad);
    const precio = round2(
      preciosPrevios.get(productoID) ?? preciosPresupuesto.get(productoID) ?? calcularPrecioProducto(producto)
    );
    const importe = round2(precio * cantidad);
    totalCalculado += importe;
    return { producto: productoID, cantidad, precio, importe };
  });

  return { lineas, totalCalculado: round2(totalCalculado) };
};

// Total final de la nota: total ingresado (validado contra el calculado, ±5%) menos el descuento.
const calcularTotalNota = (totalIngresado, totalCalculado, descuento) => {
  const d = Number(descuento) || 0;
  if (d < 0 || d > 100) throw httpError(400, "❌ El descuento debe estar entre 0 y 100.");
  const total = validarTotalConAjuste(totalIngresado, totalCalculado);
  return { total: round2(total - (total * d) / 100), descuento: d };
};

// Guarda las líneas y descuenta stock (atómico: falla si no alcanza).
const guardarDetalles = async ({ lineas, notaID, session }) => {
  const primerId = await getNextSequence("Cliente_NotaPedidoDetalle", session, lineas.length);
  const docs = lineas.map((l, i) => ({ _id: primerId + i, ...l, notaPedido: notaID, estado: true }));
  for (const l of lineas) {
    await descontarStock(l.producto, l.cantidad, session);
  }
  await NotaPedidoDetalle.insertMany(docs, { session });
  return docs;
};

// Devuelve al stock las líneas activas de la nota y las da de baja.
const anularDetalles = async (notaID, session) => {
  const detalles = await NotaPedidoDetalle.find({ notaPedido: notaID, estado: true }).session(session).lean();
  for (const d of detalles) {
    await sumarStock(d.producto, d.cantidad, session);
  }
  await NotaPedidoDetalle.updateMany({ notaPedido: notaID, estado: true }, { estado: false }, { session });
  return detalles;
};

// Validaciones comunes de la cabecera (alta y modificación).
const validarCabecera = async (body, session) => {
  const { total, cliente, empleado, medioPago, fechaEntrega, envio } = body;
  if (!total || !cliente || !empleado || !medioPago || !fechaEntrega) {
    throw httpError(400, "❌ Faltan completar algunos campos obligatorios.");
  }
  const fecha = new Date(fechaEntrega);
  if (Number.isNaN(fecha.getTime())) throw httpError(400, "❌ Fecha de entrega inválida.");

  const [clienteDB, medioPagoDB] = await Promise.all([
    Cliente.findById(cliente).session(session).lean(),
    MedioPago.findById(medioPago).session(session).lean(),
  ]);
  if (!clienteDB || !medioPagoDB) throw httpError(400, "❌ Cliente o medio de pago inválido.");

  const direccion = {};
  if (envio) {
    const { provincia, localidad, barrio, calle, altura, deptoNumero, deptoLetra } = body;
    if (!provincia || !localidad || !barrio || !calle || !altura) {
      throw httpError(400, "❌ Dirección de envío incompleta.");
    }
    Object.assign(direccion, { provincia, localidad, barrio, calle, altura, deptoNumero, deptoLetra });
  }
  return { fechaEntrega: fecha, medioPagoDB, direccion };
};

// El presupuesto debe existir, estar activo, ser del mismo cliente y no estar usado
// en otra nota activa (un presupuesto se convierte en una sola nota de pedido).
const validarPresupuesto = async (presupuestoID, clienteID, session, notaID = null) => {
  if (!presupuestoID) return null;
  const presupuesto = await Presupuesto.findOne({ _id: presupuestoID, estado: true }).session(session).lean();
  if (!presupuesto) throw httpError(400, "❌ El presupuesto no existe o fue eliminado.");
  if (Number(presupuesto.cliente) !== Number(clienteID)) {
    throw httpError(400, "❌ El presupuesto pertenece a otro cliente.");
  }
  const filtroOtraNota = { presupuesto: presupuesto._id, estado: true };
  if (notaID != null) filtroOtraNota._id = { $ne: notaID };
  if (await NotaPedido.exists(filtroOtraNota).session(session)) {
    throw httpError(409, `❌ El presupuesto N° ${presupuesto._id} ya tiene una nota de pedido.`);
  }
  return presupuesto;
};

// Registra el movimiento de Caja (y el descuento de Cuenta Corriente) de una Nota de Pedido.
// La Caja nace al crear la nota; el Comprobante de Venta es solo facturación.
const registrarCajaNota = async ({ nota, medioPago, session }) => {
  // Una nota con "A coordinar" no genera Caja hasta que se elija el medio de pago real.
  if (medioPago.name === "A coordinar") return;

  const cc = esCuentaCorriente(medioPago.name);
  if (cc) await moverSaldoCuentaCorriente(nota.cliente, -nota.total, session);

  await crearMovimientoCaja({
    persona: nota.cliente,
    tipoPersona: 'CLIENTE',
    total: nota.total,
    medioPago: medioPago._id,
    referencia: referenciaNota(nota._id),
    tipo: cc ? 'CUENTA_CORRIENTE' : 'ENTRADA',
    origen: { tipo: ORIGEN, id: nota._id },
    session,
  });
};

// Registra los AJUSTES de Caja por la modificación de una nota, conservando los movimientos
// originales. Convención de los movimientos CUENTA_CORRIENTE: total positivo = cargo al cliente,
// negativo = reintegro. Cada movimiento queda a nombre del cliente al que afecta, así al
// eliminar la nota se puede revertir cliente por cliente.
const ajustarCajaNota = async ({ notaAnterior, notaNueva, medioViejo, medioNuevo, session }) => {
  const nombreViejo = medioViejo ? medioViejo.name : null;
  const nombreNuevo = medioNuevo.name;
  const referencia = referenciaAjuste(notaNueva._id);
  const origen = { tipo: ORIGEN, id: notaNueva._id };

  // --- Cuenta Corriente ---
  const ccViejo = esCuentaCorriente(nombreViejo);
  const ccNuevo = esCuentaCorriente(nombreNuevo);
  const mismoCliente = Number(notaAnterior.cliente) === Number(notaNueva.cliente);

  if (ccViejo && ccNuevo && mismoCliente) {
    const diff = round2(notaNueva.total - notaAnterior.total);
    if (diff !== 0) {
      await moverSaldoCuentaCorriente(notaNueva.cliente, -diff, session);
      await crearMovimientoCaja({
        persona: notaNueva.cliente, tipoPersona: 'CLIENTE', total: diff, medioPago: medioNuevo._id,
        referencia, tipo: 'CUENTA_CORRIENTE', origen, session,
      });
    }
  } else {
    if (ccViejo) {
      // Reintegro al cliente anterior.
      await moverSaldoCuentaCorriente(notaAnterior.cliente, notaAnterior.total, session);
      await crearMovimientoCaja({
        persona: notaAnterior.cliente, tipoPersona: 'CLIENTE', total: -notaAnterior.total, medioPago: medioViejo._id,
        referencia, tipo: 'CUENTA_CORRIENTE', origen, session,
      });
    }
    if (ccNuevo) {
      // Cargo al cliente nuevo.
      await moverSaldoCuentaCorriente(notaNueva.cliente, -notaNueva.total, session);
      await crearMovimientoCaja({
        persona: notaNueva.cliente, tipoPersona: 'CLIENTE', total: notaNueva.total, medioPago: medioNuevo._id,
        referencia, tipo: 'CUENTA_CORRIENTE', origen, session,
      });
    }
  }

  // --- Efectivo / contado: ajuste por la diferencia (ENTRADA si sube, SALIDA si baja) ---
  const cajaViejo = esCajaEfectivo(nombreViejo) ? notaAnterior.total : 0;
  const cajaNuevo = esCajaEfectivo(nombreNuevo) ? notaNueva.total : 0;
  const diffCaja = round2(cajaNuevo - cajaViejo);
  if (diffCaja !== 0) {
    const medioCaja = esCajaEfectivo(nombreNuevo) ? medioNuevo : medioViejo;
    await crearMovimientoCaja({
      persona: notaNueva.cliente, tipoPersona: 'CLIENTE', total: Math.abs(diffCaja), medioPago: medioCaja._id,
      referencia, tipo: diffCaja > 0 ? 'ENTRADA' : 'SALIDA', origen, session,
    });
  }
};

// Anula TODA la Caja de una nota (movimiento original + ajustes) y reintegra la Cuenta
// Corriente de cada cliente afectado. Se usa al ELIMINAR la nota.
const revertirCajaNota = async ({ notaId, session }) => {
  const movimientos = await buscarMovimientosDeOrigen(
    ORIGEN, notaId, [referenciaNota(notaId), referenciaAjuste(notaId)], session
  );

  for (const mov of movimientos) {
    if (mov.tipo === 'CUENTA_CORRIENTE') {
      await moverSaldoCuentaCorriente(mov.persona, mov.total, session);
    }
    mov.estado = false;
    await mov.save({ session });
  }
};

const setNotaPedido = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    let notaCreada;
    await session.withTransaction(async () => {
      const body = req.body;
      const { fechaEntrega, medioPagoDB, direccion } = await validarCabecera(body, session);
      const presupuesto = await validarPresupuesto(body.presupuesto, body.cliente, session);

      const { lineas, totalCalculado } = await prepararDetalles({
        detalles: body.detalles, presupuesto, session,
      });
      const { total, descuento } = calcularTotalNota(body.total, totalCalculado, body.descuento);

      const newId = await getNextSequence("Cliente_NotaPedido", session);
      const nota = new NotaPedido({
        _id: newId,
        fecha: obtenerFechaHoy(),
        cliente: body.cliente,
        empleado: body.empleado,
        medioPago: body.medioPago,
        fechaEntrega,
        envio: !!body.envio,
        total,
        estado: true,
        ...direccion,
      });
      if (descuento > 0) nota.descuento = descuento;
      if (body.presupuesto) nota.presupuesto = body.presupuesto;

      await nota.save({ session });
      await guardarDetalles({ lineas, notaID: newId, session });
      await registrarCajaNota({ nota, medioPago: medioPagoDB, session });
      notaCreada = nota;
    });

    return res.status(201).json({
      ok: true,
      message: "✔️ Nota de pedido creada correctamente",
      data: notaCreada
    });
  } catch (error) {
    return responderError(res, error);
  } finally {
    session.endSession();
  }
}

const getNotaPedido = async (req, res) => {
  const pag = leerPaginacion(req.query);
  try {
    const [{ data: notaPedidos, paginacion }, notasFacturadas] = await Promise.all([
      paginar(NotaPedido, { estado: true }, pag),
      // Solo cuentan los comprobantes activos: si se anuló la factura, la nota vuelve a estar pendiente.
      ComprobanteVenta.distinct("notaPedido", { estado: true }),
    ]);
    const facturadas = new Set(notasFacturadas.map(String));

    res.status(200).json({
      ok: true,
      data: notaPedidos.map(np => ({ ...np, facturado: facturadas.has(String(np._id)) })),
      ...(paginacion && { paginacion })
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "❌ Error interno al obtener las notas de pedido."
    });
  }
};

const getNotaPedidoID = async (req, res) => {
  const notaPedido = await NotaPedido.findById(req.params.id).lean();
  if (!notaPedido) {
    return res.status(404).json({
      ok: false,
      message: '❌ El id no corresponde a una Nota de pedido.'
    });
  }

  res.status(200).json({
    ok: true,
    data: notaPedido,
    message: "✔️ Nota de pedido obtenida correctamente."
  });
}

const getNotaPedidoByCliente = async (req, res) => {
  const notaPedidos = await NotaPedido.find({ cliente: req.params.id, estado: true }).lean();
  if (notaPedidos.length === 0) {
    return res.status(404).json({
      ok: false,
      message: '❌No se encontraron pedidos para el cliente especificado.'
    });
  }
  res.status(200).json({
    ok: true,
    data: notaPedidos,
    message: "✔️ Notas de pedido obtenidas correctamente."
  });
}

const updateNotaPedido = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    let notaActualizada;
    await session.withTransaction(async () => {
      const id = Number(req.params.id);
      const body = req.body;

      const notaAnterior = await NotaPedido.findById(id).session(session).lean();
      if (!notaAnterior || !notaAnterior.estado) {
        throw httpError(404, "❌ La nota de pedido no existe o fue eliminada.");
      }
      if (await estaFacturada(id, session)) {
        throw httpError(409, '❌ La nota de pedido ya está facturada y no se puede modificar.');
      }

      const { fechaEntrega, medioPagoDB, direccion } = await validarCabecera(body, session);
      const presupuestoID = body.presupuesto || notaAnterior.presupuesto;
      const presupuesto = await validarPresupuesto(presupuestoID, body.cliente, session, id);

      // Se devuelve el stock de las líneas anteriores y se conservan sus precios.
      const detallesViejos = await anularDetalles(id, session);
      const preciosPrevios = new Map(detallesViejos.map(d => [Number(d.producto), d.precio]));

      const { lineas, totalCalculado } = await prepararDetalles({
        detalles: body.detalles, presupuesto, preciosPrevios, session,
      });
      const { total, descuento } = calcularTotalNota(body.total, totalCalculado, body.descuento);

      const update = {
        total,
        descuento,
        cliente: body.cliente,
        empleado: body.empleado,
        medioPago: body.medioPago,
        fechaEntrega,
        envio: !!body.envio,
        ...direccion,
      };
      if (presupuestoID) update.presupuesto = presupuestoID;

      notaActualizada = await NotaPedido.findByIdAndUpdate(id, update, { new: true, runValidators: true, session });
      await guardarDetalles({ lineas, notaID: id, session });

      const medioViejo = await MedioPago.findById(notaAnterior.medioPago).session(session).lean();
      await ajustarCajaNota({ notaAnterior, notaNueva: notaActualizada, medioViejo, medioNuevo: medioPagoDB, session });
    });

    return res.status(200).json({
      ok: true,
      data: notaActualizada,
      message: "✔️ Nota de pedido actualizada correctamente."
    });
  } catch (error) {
    return responderError(res, error);
  } finally {
    session.endSession();
  }
};

const deleteNotaPedido = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const id = Number(req.params.id);

      const nota = await NotaPedido.findById(id).session(session).lean();
      if (!nota || !nota.estado) {
        throw httpError(404, '❌ La nota de pedido no fue encontrada.');
      }
      if (await estaFacturada(id, session)) {
        throw httpError(409, '❌ No se puede eliminar la nota de pedido porque está facturada.');
      }

      await anularDetalles(id, session);
      // Revertir la Caja (y reintegrar la Cuenta Corriente si correspondía).
      await revertirCajaNota({ notaId: id, session });
      await NotaPedido.updateOne({ _id: id }, { estado: false }, { session });
    });

    res.status(200).json({
      ok: true,
      message: '✔️ Nota de pedido eliminada correctamente y stock reintegrado.'
    });
  } catch (error) {
    return responderError(res, error);
  } finally {
    session.endSession();
  }
};

// Rango [inicio del día, inicio del día siguiente) para comparar fechas guardadas como día.
const rangoDia = (valor) => {
  const inicio = new Date(String(valor).slice(0, 10));
  if (Number.isNaN(inicio.getTime())) return null;
  return { $gte: inicio, $lt: new Date(inicio.getTime() + 24 * 60 * 60 * 1000) };
};

const buscarNotaPedido = async (req, res) => {
  const {
    notaPedidoID, cliente, empleado, total, detalles, fechaEntrega, medioPago,
    envio, presupuesto, provincia, localidad, barrio, calle, altura,
    deptoNumero, deptoLetra
  } = req.body;

  const query = { estado: true };

  // Filtro por productos: notas que contengan alguno de los productos buscados.
  const productosBuscados = Array.isArray(detalles)
    ? detalles.map(d => Number(d.producto)).filter(Boolean)
    : [];
  if (productosBuscados.length > 0) {
    const ids = await NotaPedidoDetalle.distinct("notaPedido", {
      producto: { $in: productosBuscados },
      estado: true,
    });
    query._id = { $in: ids };
  }

  if (notaPedidoID) {
    const idBuscado = Number(notaPedidoID);
    query._id = query._id ? { $in: query._id.$in.filter(id => id === idBuscado) } : idBuscado;
  }
  if (cliente) query.cliente = Number(cliente);
  if (empleado) query.empleado = Number(empleado);
  if (total) query.total = Number(total);
  if (medioPago) query.medioPago = Number(medioPago);
  if (presupuesto) query.presupuesto = Number(presupuesto);
  if (typeof envio === "boolean") query.envio = envio;
  if (provincia) query.provincia = Number(provincia);
  if (localidad) query.localidad = Number(localidad);
  if (barrio) query.barrio = Number(barrio);
  if (calle) query.calle = Number(calle);
  if (altura) query.altura = String(altura);
  if (deptoNumero) query.deptoNumero = String(deptoNumero);
  if (deptoLetra) query.deptoLetra = String(deptoLetra);
  if (fechaEntrega) {
    const rango = rangoDia(fechaEntrega);
    if (rango) query.fechaEntrega = rango;
  }

  const pedidos = await NotaPedido.find(query).lean();
  res.status(200).json({
    ok: true,
    message: pedidos.length ? "✔️ Notas de pedido obtenidas" : "Sin resultados.",
    data: pedidos
  });
};

module.exports = { setNotaPedido , getNotaPedido , getNotaPedidoID , getNotaPedidoByCliente , updateNotaPedido , deleteNotaPedido , buscarNotaPedido };

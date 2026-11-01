const ComprobantePago = require("../models/proveedorComprobantePago_Model");
const ComprobanteCompra = require("../models/proveedorComprobanteCompra_Model");
const OrdenCompra = require("../models/proveedorOrdenCompra_Model");
const getNextSequence = require("./counter_Controller");

const { obtenerFechaHoy } = require('../utils/fecha');

const mongoose = require('mongoose');
const { httpError, round2 } = require('../utils/http');
const { crearMovimientoCaja, buscarMovimientosDeOrigen } = require('../utils/caja');
const { leerPaginacion, datosPaginacion } = require('../utils/paginacion');

const ORIGEN = 'PAGO_PROVEEDOR';
// Los movimientos viejos se guardaron con y sin punto final.
const referenciasLegacy = (id) => [
    `Comprobante de Pago Proveedor N°: ${id}`,
    `Comprobante de Pago Proveedor N°: ${id}.`,
    `Ajuste Comprobante de Pago Proveedor N°: ${id}.`,
];

const responderError = (res, error) =>
  res.status(error.status && error.status < 500 ? error.status : 400).json({ ok: false, message: error.message });

// Comprobante de compra activo + proveedor + saldo pendiente de pago.
const obtenerCompraParaPago = async (comprobanteCompraID, session, excluirPagoID = null) => {
    const compra = await ComprobanteCompra.findOne({ _id: comprobanteCompraID, estado: true })
        .populate({ path: 'ordenCompra', select: 'proveedor' })
        .session(session).lean();
    if (!compra) throw httpError(400, '❌ El comprobante de compra no existe o fue anulado.');

    const filtro = { comprobanteCompra: compra._id, estado: true };
    if (excluirPagoID) filtro._id = { $ne: excluirPagoID };
    const pagos = await ComprobantePago.find(filtro, 'total').session(session).lean();
    const pagado = round2(pagos.reduce((acc, p) => acc + p.total, 0));

    return { compra, proveedorID: compra.ordenCompra?.proveedor, saldoPendiente: round2(compra.total - pagado) };
};

const validarTotalPago = (valor, saldoPendiente) => {
    const total = round2(valor);
    if (!Number.isFinite(total) || total <= 0) throw httpError(400, '❌ El total del pago debe ser mayor a 0.');
    if (total > saldoPendiente) {
        throw httpError(400, `❌ El pago ($${total}) supera el saldo pendiente del comprobante ($${saldoPendiente}).`);
    }
    return total;
};

const setComprobantePago = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        let newComprobantePago;
        await session.withTransaction(async () => {
            const { medioPago, comprobanteCompra } = req.body;
            if (!req.body.total || !medioPago || !comprobanteCompra) {
                throw httpError(400, "❌ Faltan completar algunos campos obligatorios.");
            }
            const { compra, proveedorID, saldoPendiente } = await obtenerCompraParaPago(comprobanteCompra, session);
            const total = validarTotalPago(req.body.total, saldoPendiente);

            const newId = await getNextSequence("Proveedor_ComprobantePago", session);
            newComprobantePago = new ComprobantePago({
                _id: newId,
                total,
                fecha: obtenerFechaHoy(),
                comprobanteCompra: compra._id,
                medioPago,
                estado: true
            });
            await newComprobantePago.save({ session });

            await crearMovimientoCaja({
                persona: proveedorID, tipoPersona: 'PROVEEDOR', total, medioPago,
                referencia: `Comprobante de Pago Proveedor N°: ${newId}.`, tipo: 'SALIDA',
                origen: { tipo: ORIGEN, id: newId }, session,
            });
        });

        res.status(201).json({
            ok: true,
            message: '✔️ Comprobante de pago agregado correctamente.',
            data: newComprobantePago
        });
    } catch (error) {
        return responderError(res, error);
    } finally {
        session.endSession();
    }
}

const getComprobantePago = async (req, res) => {
    const pag = leerPaginacion(req.query);
    try {
        const consulta = ComprobantePago.find({ estado: true });
        if (pag) consulta.sort({ _id: -1 }).skip(pag.skip).limit(pag.limit);
        const [comprobantes, total] = await Promise.all([
            consulta.populate({
                path: "comprobanteCompra",     // 1️⃣ Trae el comprobante de compra
                select: "ordenCompra",         // Solo necesito la orden
                populate: {
                    path: "ordenCompra",       // 2️⃣ Desde ahí traigo la orden
                    select: "proveedor",       // Solo necesito el proveedor
                    populate: {
                        path: "proveedor",     // 3️⃣ Finalmente traigo el proveedor
                    }
                }
            }),
            pag ? ComprobantePago.countDocuments({ estado: true }) : null,
        ]);

        // Agregar proveedorID directamente en la respuesta
        const respuesta = comprobantes.map(c => ({
            ...c.toObject(),
            proveedor: c.comprobanteCompra?.ordenCompra?.proveedor?._id || null
        }));

        res.status(200).json({
            ok: true,
            data: respuesta,
            ...(pag && { paginacion: datosPaginacion(pag, total) })
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            message: "❌ Error al obtener comprobantes de pago"
        });
    }
};



const getComprobantePagoID = async (req, res) => {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({
                ok: false,
                message: "❌ El id no llegó al controlador correctamente",
            });
        }

        // 1️⃣ Buscar ComprobantePago
        const comprobantePago = await ComprobantePago.findById(id);
        if (!comprobantePago) {
            return res.status(400).json({
                ok: false,
                message: "❌ El id no corresponde a un comprobante de pago.",
            });
        }

        // 2️⃣ Extraer el comprobanteCompra desde el comprobantePago
        const comprobanteCompraID = comprobantePago.comprobanteCompra;

        let proveedor = null;
        let comprobante = null;

        if (comprobanteCompraID) {
            // 3️⃣ Buscar ComprobanteCompra
            const comprobanteCompra = await ComprobanteCompra.findById(comprobanteCompraID);

            if (comprobanteCompra) {
                const ordenCompraID = comprobanteCompra.ordenCompra;

                if (ordenCompraID) {
                    // 4️⃣ Buscar OrdenCompra
                    const ordenCompra = await OrdenCompra.findById(ordenCompraID);

                    if (ordenCompra) {
                        proveedor = ordenCompra.proveedor;
                        comprobante = comprobanteCompra._id;
                    }
                }
            }
        }
        // 5️⃣ Devolver todo junto
        res.status(200).json({
            ok: true,
            data: {
                ...comprobantePago.toObject(),
                proveedor,
            },
            message: "✔️ Comprobante de pago obtenido correctamente.",
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            message: "❌ Error al obtener comprobante de pago",
        });
    }
};


// Neto de caja de un pago (egreso): SALIDA resta, ENTRADA suma.
// (Antes se comparaba `tipo === true`, que nunca es cierto porque tipo es un texto.)
const netoCaja = (movimientos) =>
    round2(movimientos.reduce((acc, mov) => mov.tipo === 'ENTRADA' ? acc + mov.total : acc - mov.total, 0));

const updateComprobantePago = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        let updatedComprobantePago;
        await session.withTransaction(async () => {
            const id = Number(req.params.id);
            const { medioPago, comprobanteCompra } = req.body;
            if (!req.body.total || !medioPago || !comprobanteCompra) {
                throw httpError(400, "❌ Faltan completar algunos campos obligatorios.");
            }

            const pagoOriginal = await ComprobantePago.findOne({ _id: id, estado: true }).session(session).lean();
            if (!pagoOriginal) throw httpError(404, '❌ Comprobante de pago no encontrado.');

            const { compra, proveedorID, saldoPendiente } = await obtenerCompraParaPago(comprobanteCompra, session, id);
            const total = validarTotalPago(req.body.total, saldoPendiente);

            // La fecha de emisión no cambia al editar.
            updatedComprobantePago = await ComprobantePago.findByIdAndUpdate(
                id,
                { total, comprobanteCompra: compra._id, medioPago },
                { new: true, runValidators: true, session }
            );

            // Caja: el neto de los movimientos del pago debe quedar en -total.
            const movimientos = await buscarMovimientosDeOrigen(ORIGEN, id, referenciasLegacy(id), session);
            const diferencia = round2(-total - netoCaja(movimientos));
            if (diferencia !== 0) {
                await crearMovimientoCaja({
                    persona: proveedorID, tipoPersona: 'PROVEEDOR', total: Math.abs(diferencia), medioPago,
                    referencia: `Ajuste Comprobante de Pago Proveedor N°: ${id}.`,
                    tipo: diferencia > 0 ? 'ENTRADA' : 'SALIDA',
                    origen: { tipo: ORIGEN, id }, session,
                });
            }
        });

        res.status(200).json({
            ok: true,
            data: updatedComprobantePago,
            message: '✔️ Comprobante de pago actualizado correctamente.',
        });
    } catch (error) {
        return responderError(res, error);
    } finally {
        session.endSession();
    }
}

// Anular un pago anula también sus movimientos de Caja.
const deleteComprobantePago = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            const id = Number(req.params.id);
            const pago = await ComprobantePago.findOneAndUpdate(
                { _id: id, estado: true }, { estado: false }, { new: true, session }
            );
            if (!pago) throw httpError(404, '❌ Comprobante de pago no encontrado.');

            const movimientos = await buscarMovimientosDeOrigen(ORIGEN, id, referenciasLegacy(id), session);
            for (const mov of movimientos) {
                mov.estado = false;
                await mov.save({ session });
            }
        });
        res.status(200).json({ ok: true, message: '✔️ Comprobante de pago eliminado correctamente.' });
    } catch (error) {
        return responderError(res, error);
    } finally {
        session.endSession();
    }
}

const buscarComprobantePago = async (req, res) => {
  try {
    const comprobanteID = Number(req.body.comprobanteID);
    const proveedor = req.body.proveedor;
    const comprobanteCompra = Number(req.body.comprobanteCompra);
    const medioPago = Number(req.body.medioPago);
    const total = Number(req.body.total) || 0;

    // 1) Traer los comprobantesPago
    const comprobantes = await ComprobantePago.find({ estado: true });

    // 2) Buscar ordenCompra por proveedor (si se filtró)
    let idsComprobantesCompra = [];

    if (proveedor) {
      const ordenes = await OrdenCompra.find({
        estado: true,
        proveedor: proveedor
      });

      const ordenesIDs = ordenes.map(o => o._id);

      const comprobantesCompraProveedor = await ComprobanteCompra.find({
        estado: true,
        ordenCompra: { $in: ordenesIDs }
      });

      idsComprobantesCompra = comprobantesCompraProveedor.map(c => c._id);
    }

    // 3) Chequeo de filtros activos
    const sinFiltros =
      !comprobanteID &&
      !proveedor &&
      !comprobanteCompra &&
      !medioPago &&
      total === 0;

    if (sinFiltros) {
      return res.status(200).json({ ok: true, data: comprobantes });
    }

    // 4) Aplicar filtros
    const comprobantesFiltrados = comprobantes.filter(p => {
      const coincideID = comprobanteID ? Number(p._id) === comprobanteID : true;

      const coincideTotal = total ? Number(p.total) === total : true;

      const coincideComprobanteCompra = comprobanteCompra
        ? Number(p.comprobanteCompra) === comprobanteCompra
        : true;

      const coincideProveedor = proveedor
        ? idsComprobantesCompra.includes(p.comprobanteCompra)
        : true;

      const coincideMedioPago = medioPago
        ? Number(p.medioPago) === medioPago
        : true;

      return (
        coincideID &&
        coincideTotal &&
        coincideComprobanteCompra &&
        coincideProveedor &&
        coincideMedioPago
      );
    });

    if (comprobantesFiltrados.length > 0) {
      res.status(200).json({ ok: true, message: "✔️ Comprobantes de pago obtenidos", data: comprobantesFiltrados });
    } else {
      res.status(200).json({
        ok: false,
        message: "❌ No se encontraron comprobantes con esos filtros"
      });
    }
  } catch (error) {
    console.error("❌ Error al buscar comprobantes:", error);
    res.status(500).json({ ok: false, message: "❌ Error interno del servidor" });
  }
};


module.exports = { setComprobantePago, buscarComprobantePago , getComprobantePago , getComprobantePagoID , updateComprobantePago , deleteComprobantePago };
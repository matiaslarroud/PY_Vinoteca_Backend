const ReciboPago = require("../models/clienteReciboPago_Model");
const Cliente = require("../models/cliente_Model");
const getNextSequence = require("./counter_Controller");
const mongoose = require('mongoose');

const { obtenerFechaHoy } = require('../utils/fecha');
const { httpError, round2 } = require('../utils/http');
const { crearMovimientoCaja, buscarMovimientosDeOrigen, moverSaldoCuentaCorriente } = require('../utils/caja');

const ORIGEN = 'RECIBO_PAGO';
const referenciaRecibo = (id) => `Recibo de Pago Cliente N°: ${id}.`;
const referenciaAjuste = (id) => `Ajuste Recibo de Pago Cliente N°: ${id}.`;

const responderError = (res, error) =>
  res.status(error.status && error.status < 500 ? error.status : 400).json({ ok: false, message: error.message });

const validarTotal = (valor) => {
    const total = round2(valor);
    if (!Number.isFinite(total) || total <= 0) {
        throw httpError(400, "❌ El total del recibo debe ser mayor a 0.");
    }
    return total;
};

// Un recibo de pago devuelve crédito disponible de Cuenta Corriente al cliente, sin superar
// su límite. Se hace con un único update atómico (sin leer y volver a guardar el cliente),
// así no se pisan con ventas en Cuenta Corriente simultáneas.
const acreditarPago = async (clienteID, monto, session) => {
    const res = await Cliente.updateOne(
        {
            _id: clienteID,
            cuentaCorriente: true,
            $expr: { $lte: [{ $add: [{ $ifNull: ['$saldoActualCuentaCorriente', 0] }, monto] }, '$saldoCuentaCorriente'] }
        },
        { $inc: { saldoActualCuentaCorriente: monto } },
        { session }
    );
    if (res.matchedCount === 0) {
        const cliente = await Cliente.findById(clienteID).session(session).lean();
        if (!cliente) throw httpError(400, '❌ Cliente no encontrado.');
        if (!cliente.cuentaCorriente) throw httpError(400, '❌ El cliente no tiene habilitada la Cuenta Corriente.');
        const maximo = round2((cliente.saldoCuentaCorriente || 0) - (cliente.saldoActualCuentaCorriente || 0));
        throw httpError(400, `❌ El total del recibo supera el límite de saldo del cliente.\n Su maximo a agregar es: ${maximo}`);
    }
};

const setReciboPago = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        let newReciboPago;
        await session.withTransaction(async () => {
            const { clienteID, medioPagoID } = req.body;
            if (!req.body.total || !clienteID || !medioPagoID) {
                throw httpError(400, "❌ Faltan completar algunos campos obligatorios.");
            }
            const total = validarTotal(req.body.total);

            await acreditarPago(clienteID, total, session);

            const newId = await getNextSequence("Cliente_ReciboPago", session);
            newReciboPago = new ReciboPago({
                _id: newId,
                total,
                fecha: obtenerFechaHoy(),
                clienteID,
                medioPagoID,
                estado: true
            });
            await newReciboPago.save({ session });

            await crearMovimientoCaja({
                persona: clienteID, tipoPersona: 'CLIENTE', total, medioPago: medioPagoID,
                referencia: referenciaRecibo(newId), tipo: 'ENTRADA',
                origen: { tipo: ORIGEN, id: newId }, session,
            });
        });

        return res.status(201).json({
            ok: true,
            message: '✔️ Recibo de pago agregado correctamente.',
            data: newReciboPago
        });
    } catch (err) {
        return responderError(res, err);
    } finally {
        session.endSession();
    }
};



const getReciboPago = async(req, res) => {
    const recibos = await ReciboPago.find({estado:true}).lean();
    res.status(200).json({
        ok:true,
        data: recibos
    })
}

const getReciboPagoID = async(req,res) => {
    const reciboPagoEncontrado = await ReciboPago.findById(req.params.id).lean();
    if(!reciboPagoEncontrado){
        return res.status(404).json({
            ok:false,
            message:'❌ El id no corresponde a un ReciboPago.'
        })
    }

    res.status(200).json({
        ok:true,
        message:"✔️ Recibo de pago obtenido.",
        data:reciboPagoEncontrado,
    })
}

// Neto de caja de un recibo: ENTRADA suma, SALIDA resta.
// (Antes se usaba `mov.tipo ? + : -`, que siempre sumaba porque tipo es un texto no vacío.)
const netoCaja = (movimientos) =>
    round2(movimientos.reduce((acc, mov) => mov.tipo === 'SALIDA' ? acc - mov.total : acc + mov.total, 0));

const updateReciboPago = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        let updatedReciboPago;
        await session.withTransaction(async () => {
            const id = Number(req.params.id);
            const { clienteID, medioPagoID } = req.body;
            if (!req.body.total || !clienteID || !medioPagoID) {
                throw httpError(400, "❌ Faltan completar algunos campos obligatorios.");
            }
            const totalNuevo = validarTotal(req.body.total);

            const reciboOriginal = await ReciboPago.findOne({ _id: id, estado: true }).session(session).lean();
            if (!reciboOriginal) throw httpError(404, '❌ Recibo no encontrado.');

            // Saldo de Cuenta Corriente: mismo cliente → se aplica solo la diferencia; si cambió
            // el cliente, se quita el crédito al original y se acredita el nuevo total al actual.
            if (Number(reciboOriginal.clienteID) === Number(clienteID)) {
                const diff = round2(totalNuevo - reciboOriginal.total);
                if (diff > 0) await acreditarPago(clienteID, diff, session);
                if (diff < 0) await moverSaldoCuentaCorriente(clienteID, diff, session);
            } else {
                await moverSaldoCuentaCorriente(reciboOriginal.clienteID, -reciboOriginal.total, session);
                await acreditarPago(clienteID, totalNuevo, session);
            }

            // La fecha de emisión no cambia al editar.
            updatedReciboPago = await ReciboPago.findByIdAndUpdate(
                id,
                { total: totalNuevo, clienteID, medioPagoID },
                { new: true, runValidators: true, session }
            );

            // Caja: ajuste por la diferencia entre lo registrado y el nuevo total.
            const movimientos = await buscarMovimientosDeOrigen(
                ORIGEN, id, [referenciaRecibo(id), referenciaAjuste(id)], session
            );
            const diferencia = round2(totalNuevo - netoCaja(movimientos));
            if (diferencia !== 0) {
                await crearMovimientoCaja({
                    persona: clienteID, tipoPersona: 'CLIENTE', total: Math.abs(diferencia), medioPago: medioPagoID,
                    referencia: referenciaAjuste(id), tipo: diferencia > 0 ? 'ENTRADA' : 'SALIDA',
                    origen: { tipo: ORIGEN, id }, session,
                });
            }
        });

        return res.status(200).json({
            ok: true,
            data: updatedReciboPago,
            message: '✔️ Recibo de pago actualizado correctamente.'
        });
    } catch (err) {
        return responderError(res, err);
    } finally {
        session.endSession();
    }
};


// Anular un recibo revierte el crédito otorgado al cliente y anula sus movimientos de Caja.
const deleteReciboPago = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            const id = Number(req.params.id);
            const recibo = await ReciboPago.findOneAndUpdate(
                { _id: id, estado: true }, { estado: false }, { new: true, session }
            );
            if (!recibo) throw httpError(404, '❌ Recibo no encontrado.');

            await moverSaldoCuentaCorriente(recibo.clienteID, -recibo.total, session);

            const movimientos = await buscarMovimientosDeOrigen(
                ORIGEN, id, [referenciaRecibo(id), referenciaAjuste(id)], session
            );
            for (const mov of movimientos) {
                mov.estado = false;
                await mov.save({ session });
            }
        });
        res.status(200).json({ ok: true, message: '✔️ Recibo de pago eliminado correctamente.' });
    } catch (error) {
        return responderError(res, error);
    } finally {
        session.endSession();
    }
}

const buscarReciboPago = async (req, res) => {
    const { clienteID, reciboID, medioPagoID, total, fecha } = req.body;

    const query = { estado: true };
    if (reciboID) query._id = Number(reciboID);
    if (clienteID) query.clienteID = Number(clienteID);
    if (medioPagoID) query.medioPagoID = Number(medioPagoID);
    if (total) query.total = Number(total);
    if (fecha) {
        const inicio = new Date(String(fecha).slice(0, 10));
        if (!Number.isNaN(inicio.getTime())) {
            query.fecha = { $gte: inicio, $lt: new Date(inicio.getTime() + 24 * 60 * 60 * 1000) };
        }
    }

    const recibos = await ReciboPago.find(query).lean();
    res.status(200).json({ ok: true, message: "✔️ Recibos de pago obtenidos", data: recibos });
};

module.exports = { setReciboPago , getReciboPago , getReciboPagoID , updateReciboPago , deleteReciboPago , buscarReciboPago };

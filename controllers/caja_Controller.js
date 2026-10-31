const Caja = require("../models/caja_Model.js");
const Cliente = require("../models/cliente_Model.js")
const Proveedor = require("../models/proveedor_Model.js")
const MedioPago = require("../models/medioPago_Model.js")
const getNextSequence = require("./counter_Controller.js");

const { obtenerFechaHoy } = require('../utils/fecha');

// Agrega nombre de persona y de medio de pago a cada movimiento con 3 consultas en lote
// (antes eran 2-3 consultas POR movimiento: miles de consultas por pedido).
const esProveedor = (m) => m.tipoPersona === 'PROVEEDOR' || (!m.tipoPersona && m.referencia?.toLowerCase().includes('proveedor'));
const esCliente = (m) => m.tipoPersona === 'CLIENTE' || (!m.tipoPersona && m.referencia?.toLowerCase().includes('cliente'));

const enriquecerMovimientos = async (movimientos) => {
  const idsProveedores = [...new Set(movimientos.filter(esProveedor).map(m => m.persona).filter(v => v != null))];
  const idsClientes = [...new Set(movimientos.filter(esCliente).map(m => m.persona).filter(v => v != null))];
  const idsMedios = [...new Set(movimientos.map(m => m.medioPago).filter(v => v != null))];

  const [proveedores, clientes, medios] = await Promise.all([
    Proveedor.find({ _id: { $in: idsProveedores } }, 'name').lean(),
    Cliente.find({ _id: { $in: idsClientes } }, 'name lastname').lean(),
    MedioPago.find({ _id: { $in: idsMedios } }, 'name').lean(),
  ]);
  const proveedorPorId = new Map(proveedores.map(p => [p._id, p]));
  const clientePorId = new Map(clientes.map(c => [c._id, c]));
  const medioPorId = new Map(medios.map(m => [m._id, m]));

  return movimientos.map((m) => {
    let personaNombre = null;
    if (esProveedor(m)) {
      personaNombre = proveedorPorId.get(m.persona)?.name || null;
    } else if (esCliente(m)) {
      const c = clientePorId.get(m.persona);
      personaNombre = c ? [c.name, c.lastname].filter(Boolean).join(' ') : null;
    }
    return { ...m, personaNombre, medioPagoNombre: medioPorId.get(m.medioPago)?.name || null };
  });
};

const setCaja = async(req,res) => {
    const fecha = obtenerFechaHoy();
    const total = req.body.total;
    const tipo = req.body.tipo;
    const persona = req.body.persona;
    const referencia = req.body.referencia;
    const medioPago = req.body.medioPago;
    if (!['ENTRADA', 'SALIDA'].includes(tipo) || !(Number(total) > 0)) {
        return res.status(400).json({
            ok:false,
            message:"❌ Un movimiento manual debe ser ENTRADA o SALIDA y tener un total mayor a 0."
        })
    }
    if( !tipo ||!total || !referencia || !medioPago){
        res.status(400).json({
            ok:false,
            message:"❌ Faltan completar algunos campos obligatorios."
        })
        return
    }
    const newId = await getNextSequence("Caja");
    const newCaja = await new Caja({
        _id: newId,
        fecha:fecha,
        tipo: tipo,
        total:total ,
        persona:persona ,
        tipoPersona: req.body.tipoPersona,
        referencia:referencia ,
        medioPago:medioPago ,
        estado:true
    });

    if(!newCaja){
        res.status(400).json({
            ok:false,
            message:"❌ Error al agregar movimiento de caja."
        })
        return
    }
    await newCaja.save()
        .then(()=>{
            res.status(201).json({
                ok:true,
                message:"✔️ Movimiento agregado correctamente."
            })
        })
        .catch((err) => {
            res.status(400).json({
                ok:false,
                message: err.message || '❌ Error al agregar movimiento.'
            })
        }) 
}

const getCaja = async (req, res) => {
  try {
    const movimientos = await Caja.find({ estado: true }).lean();

    const movimientosConPersona = await enriquecerMovimientos(movimientos);

    const movimientosNormalizados = movimientosConPersona.map(m => ({
      tipo: m.tipo,
      referencia: m.referencia,
      total: Number(m.total) || 0
    }));

    const totales = calcularTotales(movimientosNormalizados);

    res.status(200).json({
      ok: true,
      data: movimientosConPersona,
      resumen: totales
    });

  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'Error al obtener caja',
      error: error.message
    });
  }
};


function calcularTotales(movimientos = []) {
  let totalIngresos = 0;
  let totalEgresos = 0;
  let totalCuentaCorriente = 0;

  for (const mov of movimientos) {
    if (!mov?.total) continue;

    switch (mov.tipo) {
      case "ENTRADA":
        totalIngresos += mov.total;
        break;

      case "SALIDA":
        totalEgresos += mov.total;
        break;

      case "CUENTA_CORRIENTE":
        totalCuentaCorriente += mov.total;
        break;

      default:
        break;
    }
  }

  // Los recibos de pago (y sus ajustes) cancelan deuda de Cuenta Corriente: ENTRADA la reduce
  // y un ajuste SALIDA la vuelve a subir. Misma regla que calcularSaldoCuentaCorriente.
  for (const mov of movimientos) {
    if (!/recibo de pago/i.test(mov.referencia || '')) continue;
    if (mov.tipo === "ENTRADA") totalCuentaCorriente -= mov.total;
    if (mov.tipo === "SALIDA") totalCuentaCorriente += mov.total;
  }


  return {
    ingresos: totalIngresos,
    egresos: totalEgresos,
    saldoCaja: totalIngresos - totalEgresos,
    cuentaCorriente: totalCuentaCorriente,
  };
}


const getCajaID = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ Error con el id del movimiento de caja.'
        })
    }

    const cajaEncontrada = await Caja.findById(id).lean();
    
    if(!cajaEncontrada){
        res.status(400).json({
            ok:false,
            message:"❌ Error al obtener movimiento de caja."
        })
        return
    }

    res.status(200).json({
        ok:true,
        message:"✔️ Movimiento de caja encontrado correctamente.",
        data: cajaEncontrada
    })
}

function calcularSaldoCuentaCorriente(movimientos = []) {
  let totalCuentaCorriente = 0;
  let totalEntradas = 0;
  let totalSalidas = 0;

  for (const mov of movimientos) {
    if (!mov?.total) continue;

    switch (mov.tipo) {
      case "CUENTA_CORRIENTE":
        totalCuentaCorriente += mov.total;
        break;

      case "ENTRADA":
        totalEntradas += mov.total;
        break;

      case "SALIDA":
        totalSalidas += mov.total;
        break;

      default:
        break;
    }
  }

  const saldoRestante =
    totalCuentaCorriente - totalEntradas + totalSalidas;

  return {
    totalCuentaCorriente,
    pagosEntrada: totalEntradas,
    saldoCaja: totalEntradas - totalSalidas,
    pagosSalida: totalSalidas,
    saldoRestante,
  };
}


const getVentasByCliente = async (req, res) => {
  try {
    const { id: clienteID } = req.params;

    if (!clienteID) {
      return res.status(400).json({
        ok: false,
        message: "❌ Debe proporcionar un cliente válido."
      });
    }

    // Verificamos que exista el cliente
    const clienteEncontrado = await Cliente.findById(clienteID);

    if (!clienteEncontrado) {
      return res.status(404).json({
        ok: false,
        message: "❌ El cliente no existe."
      });
    }

    // Buscamos movimientos de caja
    const movimientos = await Caja.find({
      estado: true,
      persona: clienteID,
      tipoPersona: 'CLIENTE'
    }).sort({ createdAt: -1 }).lean();

    const movimientosConPersona = await enriquecerMovimientos(movimientos);  

    const movimientosNormalizados = movimientos.map(m => ({
      tipo: m.tipo,
      referencia: m.referencia,
      total: m.total
    }));

    const totales = calcularTotales(movimientosNormalizados);
  
    return res.status(200).json({
      ok: true,
      data: movimientosConPersona,
      resumen:totales,
      message: "✔️ Movimientos obtenidos correctamente."
    });

  } catch (error) {
    console.error("Error getVentasByCliente:", error);

    return res.status(500).json({
      ok: false,
      message: "❌ Error interno del servidor."
    });
  }
};

const getVentasByFecha = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;


    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({
        ok: false,
        message: "❌ Debe proporcionar una fecha de inicio y fin."
      });
    }

    // Convertimos a Date
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    // Ajuste importante: incluir TODO el día final
    fin.setHours(23, 59, 59, 999);

    const movimientos = await Caja.find({
      estado: true,
      fecha: {
        $gte: inicio,
        $lte: fin
      }
    }).sort({ fecha: -1 }).lean(); // más lógico ordenar por fecha  

    const movimientosConPersona = await enriquecerMovimientos(movimientos);  

    const movimientosNormalizados = movimientos.map(m => ({
      tipo: m.tipo,
      referencia: m.referencia,
      total: m.total
    }));

    const totales = calcularTotales(movimientosNormalizados);

    return res.status(200).json({
      ok: true,
      data: movimientosConPersona,
      resumen:totales,
      message: "✔️ Movimientos obtenidos correctamente."
    });

  } catch (error) {
    console.error("Error getVentasByCliente:", error);

    return res.status(500).json({
      ok: false,
      message: "❌ Error interno del servidor."
    });
  }
};

const getCuentaCorrienteByCliente = async (req, res) => {
  try {
    const { id: clienteID } = req.params;

    if (!clienteID) {
      return res.status(400).json({
        ok: false,
        message: "❌ Debe proporcionar un cliente válido."
      });
    }

    // Verificar existencia del cliente
    const cliente = await Cliente.findById(clienteID);

    if (!cliente) {
      return res.status(404).json({
        ok: false,
        message: "❌ El cliente no existe."
      });
    }

    if (!cliente.cuentaCorriente) {
      return res.status(400).json({
        ok: false,
        message: "❌ El cliente no posee cuenta corriente habilitada."
      });
    }

    // Buscar movimientos de caja relacionados a cuenta corriente
    const movimientos = await Caja.find({
      estado: true,
      persona: clienteID,
      tipoPersona: 'CLIENTE',
      $or: [
        { tipo: 'CUENTA_CORRIENTE' },
        { referencia: { $regex: /Recibo de Pago/i } }
      ]
    }).sort({ createdAt: -1 }).lean();

    const movimientosConPersona = await enriquecerMovimientos(movimientos);  

    const movimientosNormalizados = movimientos.map(m => ({
      tipo: m.tipo,
      total: m.total
    }));

    const totales = calcularSaldoCuentaCorriente(movimientosNormalizados);

    return res.status(200).json({
      ok: true,
      data: movimientosConPersona,
      resumen: totales,
      message: "✔️ Movimientos de cuenta corriente obtenidos correctamente."
    });

  } catch (error) {
    console.error("❌ Error :", error);

    return res.status(500).json({
      ok: false,
      message: "❌ Error interno del servidor."
    });
  }
};

const getCuentasCorrienteConDeuda = async (req, res) => {
  try {
    const movimientos = await Caja.find({
      estado: true,
      tipoPersona: { $ne: 'PROVEEDOR' }, // solo clientes (los IDs de proveedores pueden coincidir)
      $or: [
        { tipo: 'CUENTA_CORRIENTE' },
        { referencia: { $regex: /recibo de pago/i } }
      ]
    }).lean();

    const movimientosPorCliente = {};

    for (const m of movimientos) {
      if (!m.persona) continue; // ✅ evita null

      if (!movimientosPorCliente[m.persona]) {
        movimientosPorCliente[m.persona] = [];
      }
      movimientosPorCliente[m.persona].push(m);
    }

    const resultado = [];
    const clientes = await Cliente.find(
      { _id: { $in: Object.keys(movimientosPorCliente).map(Number).filter(n => !isNaN(n)) } },
      'name lastname'
    ).lean();
    const clientePorId = new Map(clientes.map(c => [c._id, c]));

    for (const personaId of Object.keys(movimientosPorCliente)) {
      if (!personaId || personaId === "null" || isNaN(personaId)) continue;

      const movimientosCliente = movimientosPorCliente[personaId];

      const movimientosNormalizados = movimientosCliente.map(m => ({
        tipo: m.tipo,
        total: m.total
      }));

      const totales = calcularSaldoCuentaCorriente(movimientosNormalizados);

      if (totales.saldoRestante > 0) {
        const cliente = clientePorId.get(Number(personaId));

        if (!cliente) continue;

        resultado.push({
          clienteId: Number(personaId),
          clienteNombre: `${cliente.name} ${cliente.lastname}`,
          saldoAdeudado: totales.saldoRestante
        });
      }
    }

    return res.status(200).json({
      ok: true,
      data: resultado,
      message: "✔️ Clientes con saldo adeudado obtenidos correctamente."
    });

  } catch (error) {
    console.error("❌ Error getCuentasCorrienteConDeuda:", error);
    return res.status(500).json({
      ok: false,
      message: "❌ Error interno del servidor."
    });
  }
};



const updateCaja = async(req,res) => {

    const total = req.body.total;
    const tipo = req.body.tipo;
    const persona = req.body.persona;
    const referencia = req.body.referencia;
    const medioPago = req.body.medioPago;

    const cajaID = req.params.id;
    if(!cajaID){
        res.status(400).json({
            ok:false,
            message:"❌ Error al validar id del movimiento de caja."
        })
        return
    }

    if(!total || !referencia || !medioPago || !tipo ){
        res.status(400).json({
            ok:false,
            message: "❌ Faltan completar algunos campos obligatorios."
        })
        return
    }

    // Los movimientos generados por notas, recibos o pagos se corrigen desde su documento:
    // editarlos acá desincronizaría la caja con la Cuenta Corriente.
    const movimientoActual = await Caja.findById(req.params.id).lean();
    if (!movimientoActual) {
        return res.status(404).json({ ok:false, message:'❌ Movimiento no encontrado.' });
    }
    if (movimientoActual.origen?.tipo || /^(Ajuste )?(Nota de Pedido|Recibo de Pago|Comprobante de Pago)/.test(movimientoActual.referencia || '')) {
        return res.status(409).json({ ok:false, message:'❌ Este movimiento lo generó un documento (nota, recibo o pago). Modifíquelo desde ese documento.' });
    }

    const updatedCaja = await Caja.findByIdAndUpdate(
        cajaID,
        {
            total:total,
            tipo:tipo,
            persona:persona,
            referencia:referencia,
            medioPago: medioPago
        },
        { new: true , runValidators: true }
    )
    if(!updatedCaja){
        res.status(400).json({
            ok:false,
            message:"❌ Error al actualizar movimiento."
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:"✔️ Movimiento actualizado correctamente."
    })
}

const deleteCaja = async(req,res) => {
    const movimientoID = req.params.id;
    if(!movimientoID){
        res.status(400).json({
            ok:false,
            message:"❌ Error validar ID del movimiento a eliminar."
        })
        return
    }

    // Los movimientos generados por notas, recibos o pagos se corrigen desde su documento:
    // editarlos acá desincronizaría la caja con la Cuenta Corriente.
    const movimientoActual = await Caja.findById(req.params.id).lean();
    if (!movimientoActual) {
        return res.status(404).json({ ok:false, message:'❌ Movimiento no encontrado.' });
    }
    if (movimientoActual.origen?.tipo || /^(Ajuste )?(Nota de Pedido|Recibo de Pago|Comprobante de Pago)/.test(movimientoActual.referencia || '')) {
        return res.status(409).json({ ok:false, message:'❌ Este movimiento lo generó un documento (nota, recibo o pago). Modifíquelo desde ese documento.' });
    }

    const deletedCaja = await Caja.findByIdAndUpdate(
        movimientoID,
        {estado:false},
        { new: true , runValidators: true }
    )
    if(!deletedCaja){
        res.status(400).json({
            ok:false,
            message:"❌ Error eliminar movimiento."
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:"✔️ Movimiento eliminado correctamente."
    })
}

module.exports = {setCaja,getVentasByFecha,getCaja,getVentasByCliente,updateCaja,deleteCaja,getCajaID,getCuentaCorrienteByCliente , getCuentasCorrienteConDeuda};
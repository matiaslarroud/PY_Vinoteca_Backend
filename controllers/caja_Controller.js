const Caja = require("../models/caja_Model.js");
const Cliente = require("../models/cliente_Model.js")
const Proveedor = require("../models/proveedor_Model.js")
const MedioPago = require("../models/medioPago_Model.js")
const getNextSequence = require("./counter_Controller.js");

const obtenerFechaHoy = () => {
  const hoy = new Date();
  return hoy.toISOString().split("T")[0];
}

const setCaja = async(req,res) => {
    const fecha = obtenerFechaHoy();
    const total = req.body.total;
    const tipo = req.body.tipo;
    const persona = req.body.persona;
    const referencia = req.body.referencia;
    const medioPago = req.body.medioPago;
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
                message:`❌  Error al agregar movimiento. ERROR:\n${err}`
            })
        }) 
}

const getCaja = async (req, res) => {
  try {
    const movimientos = await Caja.find({ estado: true }).lean();

    const movimientosConPersona = await Promise.all(
      movimientos.map(async (m) => {
        let personaNombre = null;

        if (m.referencia?.toLowerCase().includes('proveedor')) {
          const proveedor = await Proveedor.findById(m.persona).lean();
          personaNombre = proveedor?.name || null;
        }

        if (m.referencia?.toLowerCase().includes('cliente')) {
          const cliente = await Cliente.findById(m.persona).lean();
          personaNombre = cliente?.name + ' ' + cliente?.lastname || null;
        }

        const medioPagoEncontrado = await MedioPago.findById(m.medioPago).lean();
        const medioPagoNombre = medioPagoEncontrado?.name || null;

        return {
          ...m,
          personaNombre,
          medioPagoNombre
        };
      })
    );

    const movimientosNormalizados = movimientosConPersona.map(m => ({
      tipo: m.tipo,
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
            message:`❌  Error con el id del movimiento de caja. ERROR:\n${err}`
        })
    }

    const cajaEncontrada = await Caja.findById(id);
    
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
      persona: clienteID
    }).sort({ createdAt: -1 }).lean(); 

    const movimientosConPersona = await Promise.all(
      movimientos.map(async (m) => {
        let personaNombre = null;

        if (m.referencia?.toLowerCase().includes('proveedor')) {
          const proveedor = await Proveedor.findById(m.persona).lean();
          personaNombre = proveedor?.name || null;
        }

        if (m.referencia?.toLowerCase().includes('cliente')) {
          const cliente = await Cliente.findById(m.persona).lean();
          personaNombre = cliente?.name + ' ' + cliente?.lastname || null;
        }

        const medioPagoEncontrado = await MedioPago.findById(m.medioPago).lean();
        const medioPagoNombre = medioPagoEncontrado?.name || null;
        return {
          ...m,
          personaNombre,
          medioPagoNombre
        };
      })
    );  

    const movimientosNormalizados = movimientos.map(m => ({
      tipo: m.tipo,
      total: m.total
    }));

    const totales = calcularTotales(movimientosNormalizados);
    
        console.log(movimientosConPersona)
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

    const movimientosConPersona = await Promise.all(
      movimientos.map(async (m) => {
        let personaNombre = null;

        if (m.referencia?.toLowerCase().includes('proveedor')) {
          const proveedor = await Proveedor.findById(m.persona).lean();
          personaNombre = proveedor?.name || null;
        }

        if (m.referencia?.toLowerCase().includes('cliente')) {
          const cliente = await Cliente.findById(m.persona).lean();
          personaNombre = cliente?.name + ' ' + cliente?.lastname || null;
        }

        const medioPagoEncontrado = await MedioPago.findById(m.medioPago).lean();
        const medioPagoNombre = medioPagoEncontrado?.name || null;

        return {
          ...m,
          personaNombre,
          medioPagoNombre
        };
      })
    );  

    const movimientosNormalizados = movimientos.map(m => ({
      tipo: m.tipo,
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
      $or: [
        { tipo: 'CUENTA_CORRIENTE' },
        { referencia: { $regex: /Recibo de Pago/i } }
      ]
    }).sort({ createdAt: -1 }).lean();

    const movimientosConPersona = await Promise.all(
      movimientos.map(async (m) => {
        let personaNombre = null;

        if (m.referencia?.toLowerCase().includes('proveedor')) {
          const proveedor = await Proveedor.findById(m.persona).lean();
          personaNombre = proveedor?.name || null;
        }

        if (m.referencia?.toLowerCase().includes('cliente')) {
          const cliente = await Cliente.findById(m.persona).lean();
          personaNombre = cliente?.name + ' ' + cliente?.lastname || null;
        }

        const medioPagoEncontrado = await MedioPago.findById(m.medioPago).lean();
        const medioPagoNombre = medioPagoEncontrado?.name || null;

        return {
          ...m,
          personaNombre,
          medioPagoNombre
        };
      })
    );  

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
      $or: [
        { tipo: 'CUENTA_CORRIENTE' },
        { referencia: { $regex: /recibo de pago/i } }
      ]
    }).lean();

    const movimientosPorCliente = {};

    for (const m of movimientos) {
      if (!movimientosPorCliente[m.persona]) {
        movimientosPorCliente[m.persona] = [];
      }
      movimientosPorCliente[m.persona].push(m);
    }

    const resultado = [];

    for (const personaId of Object.keys(movimientosPorCliente)) {
      const movimientosCliente = movimientosPorCliente[personaId];

      const movimientosNormalizados = movimientosCliente.map(m => ({
        tipo: m.tipo,
        total: m.total
      }));

      const totales = calcularSaldoCuentaCorriente(movimientosNormalizados);

      if (totales.saldoRestante > 0) {
        const cliente = await Cliente.findById(personaId).lean();

        resultado.push({
          clienteId: personaId,
          clienteNombre: cliente
            ? `${cliente.name} ${cliente.lastname}`
            : null,
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
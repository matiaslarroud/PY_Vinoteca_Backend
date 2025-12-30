const Caja = require("../models/caja_Model.js");
const Cliente = require("../models/cliente_Model.js")
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

    // 1️⃣ Normalizar (por si el schema cambia)
    const movimientosNormalizados = movimientos.map(m => ({
      tipo: m.tipo,
      total: m.total
    }));

    // 2️⃣ Calcular totales
    const totales = calcularTotales(movimientosNormalizados);

    // 3️⃣ Responder todo junto
    res.status(200).json({
      ok: true,
      data: movimientos,
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
    cuentaCorriente: totalCuentaCorriente
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
    }).sort({ createdAt: -1 }); // opcional: últimos primero    

    const movimientosNormalizados = movimientos.map(m => ({
      tipo: m.tipo,
      total: m.total
    }));

    const totales = calcularTotales(movimientosNormalizados);

    return res.status(200).json({
      ok: true,
      data: movimientos,
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
    }).sort({ createdAt: -1 });

    const movimientosNormalizados = movimientos.map(m => ({
      tipo: m.tipo,
      total: m.total
    }));

    const totales = calcularTotales(movimientosNormalizados);

    return res.status(200).json({
      ok: true,
      data: movimientos,
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

module.exports = {setCaja,getCaja,getVentasByCliente,updateCaja,deleteCaja,getCajaID,getCuentaCorrienteByCliente};
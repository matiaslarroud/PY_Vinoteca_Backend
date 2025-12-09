const ReciboPago = require("../models/clienteReciboPago_Model");
const Cliente = require("../models/cliente_Model");
const getNextSequence = require("./counter_Controller");

const obtenerFechaHoy = () => {
  const hoy = new Date();
  return hoy.toISOString().split("T")[0];
}

const setReciboPago = async (req, res) => {
    try {
        const total = Number(req.body.total);
        const fecha = obtenerFechaHoy();
        const clienteID = req.body.clienteID;
        const medioPagoID = req.body.medioPagoID;

        if (!total || !clienteID || !medioPagoID) {
            return res.status(400).json({
                ok: false,
                message: "❌ Faltan completar algunos campos obligatorios."
            });
        }

        const newId = await getNextSequence("Cliente_ReciboPago");
        const cliente = await Cliente.findById(clienteID);
        if (!cliente) {
            return res.status(400).json({
                ok: false,
                message: '❌ Cliente no encontrado.'
            });
        }

        // ✔ Validación de límites
        const sumaSaldo = cliente.saldoActualCuentaCorriente + total;
        if (sumaSaldo > cliente.saldoCuentaCorriente) {
            return res.status(400).json({
                ok: false,
                message: `❌ El total del recibo supera el límite de saldo del cliente.\n Su maximo a agregar es: ${cliente.saldoCuentaCorriente-cliente.saldoActualCuentaCorriente} `
            });
        }

        // ✔ Actualizar el saldo del cliente
        cliente.saldoActualCuentaCorriente = sumaSaldo;
        await cliente.save();  // ⬅️ IMPORTANTE


        // Crear el recibo
        const newReciboPago = new ReciboPago({
            _id: newId,
            total: total,
            fecha: fecha,
            clienteID: clienteID,
            medioPagoID: medioPagoID,
            estado: true
        });

        await newReciboPago.save();

        return res.status(201).json({
            ok: true,
            message: '✔️ Recibo de pago agregado correctamente.',
            data: newReciboPago
        });

    } catch (err) {
        console.error("❌ Error en setReciboPago:", err);
        return res.status(500).json({
            ok: false,
            message: '❌ Error interno del servidor.'
        });
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
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente',
        })
        return
    }

    const reciboPagoEncontrado = await ReciboPago.findById(id);
    if(!reciboPagoEncontrado){
        res.status(400).json({
            ok:false,
            message:'❌ El id no corresponde a un ReciboPago.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        message:"✔️ Recibo de pago obtenido.",
        data:reciboPagoEncontrado,
    })
}

const updateReciboPago = async (req, res) => {
    try {
        const id = req.params.id;

        const totalNuevo = Number(req.body.total);
        const fecha = obtenerFechaHoy();
        const clienteID = req.body.clienteID;
        const medioPagoID = req.body.medioPagoID;

        if (!id) {
            return res.status(400).json({
                ok: false,
                message: '❌ El id no llegó al controlador correctamente.'
            });
        }

        if (!totalNuevo || !clienteID || !medioPagoID) {
            return res.status(400).json({
                ok: false,
                message: "❌ Faltan completar algunos campos obligatorios."
            });
        }

        // 1️⃣ Buscar recibo original
        const reciboOriginal = await ReciboPago.findById(id);
        if (!reciboOriginal) {
            return res.status(400).json({
                ok: false,
                message: '❌ Recibo no encontrado.'
            });
        }

        const totalAnterior = reciboOriginal.total;

        // 2️⃣ Buscar cliente
        const cliente = await Cliente.findById(clienteID);
        if (!cliente) {
            return res.status(400).json({
                ok: false,
                message: '❌ Cliente no encontrado.'
            });
        }


        // 3️⃣ Calcular saldo corregido
        const saldoActual = cliente.saldoActualCuentaCorriente;

        const saldoCorregido = saldoActual - totalAnterior + totalNuevo;

        // 4️⃣ Validar límites
        if (saldoCorregido > cliente.saldoCuentaCorriente) {
            return res.status(400).json({
                ok: false,
                message: `❌ El nuevo total supera el límite de saldo del cliente.\n Su maximo a agregar es: ${cliente.saldoCuentaCorriente-cliente.saldoActualCuentaCorriente} `
            });
        }

        // 5️⃣ Aplicar saldo modificado
        cliente.saldoActualCuentaCorriente = saldoCorregido;
        await cliente.save();


        // 6️⃣ Actualizar recibo
        const updatedReciboPago = await ReciboPago.findByIdAndUpdate(
            id,
            {
                total: totalNuevo,
                fecha: fecha,
                clienteID: clienteID,
                medioPagoID: medioPagoID
            },
            { new: true, runValidators: true }
        );

        if (!updatedReciboPago) {
            return res.status(400).json({
                ok: false,
                message: '❌ Error al actualizar el recibo de pago.'
            });
        }

        return res.status(200).json({
            ok: true,
            data: updatedReciboPago,
            message: '✔️ Recibo de pago actualizado correctamente.'
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            message: '❌ Error interno del servidor.'
        });
    }
};


const deleteReciboPago = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente.'
        })
        return
    }

    const deletedReciboPago = await ReciboPago.findByIdAndUpdate(
        id,
        {estado:false},
        { new: true , runValidators: true }
    )
    
    if(!deletedReciboPago){
        res.status(400).json({
            ok:false,
            message: '❌ Error durante el borrado.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'✔️ Recibo de pago eliminado correctamente.',
    })
}

const buscarReciboPago = async (req, res) => {
    const { clienteID, reciboID, medioPagoID , total } = req.body;
    const fechaP = req.body.fecha ? new Date(req.body.fecha) : null;
    
    const recibos = await ReciboPago.find({estado:true});
    
    const recibosFiltrados = recibos.filter(p => {
      const coincideEstado = p.estado === true;
      const coincideRecibo = reciboID ? (p._id) === Number(reciboID) : true;
      const coincideMedioPago = medioPagoID ? Number(p.medioPagoID) === medioPagoID : true;
      const coincideCliente = clienteID ? Number(p.clienteID) === clienteID : true;
      const coincideTotal = total ? Number(p.total) === Number(total) : true;
      const coincideFecha = fechaP
        ? String(p.fecha.toISOString().split("T")[0]) ===
          String(new Date(fechaP).toISOString().split("T")[0])
        : true;
      return coincideEstado && coincideCliente && coincideRecibo && coincideTotal && coincideFecha && coincideMedioPago;
    });

    if(recibosFiltrados.length > 0){
        res.status(200).json({ ok: true, message: "✔️ Recibos de pago obtenidos", data: recibosFiltrados });
    } else {
        res.status(500).json({ ok: false, message: "❌ Error al buscar recibos" });
    }
};

module.exports = { setReciboPago , getReciboPago , getReciboPagoID , updateReciboPago , deleteReciboPago , buscarReciboPago };
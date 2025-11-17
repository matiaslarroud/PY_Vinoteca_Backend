const ReciboPago = require("../models/clienteReciboPago_Model");
const getNextSequence = require("./counter_Controller");

const obtenerFechaHoy = () => {
  const hoy = new Date();
  return hoy.toISOString().split("T")[0];
}

const setReciboPago = async (req, res) => {
    
    try {
        const newId = await getNextSequence("Cliente_ReciboPago");
        const total = req.body.total;
        const fecha = obtenerFechaHoy();
        const clienteID = req.body.clienteID;
        const medioPagoID = req.body.medioPagoID;

        // Validar datos obligatorios
        if (!total || !fecha || !clienteID || !medioPagoID) {
            return res.status(400).json({
                ok: false,
                message: 'Error al cargar los datos.'
            });
        }

        const newReciboPago = new ReciboPago({
            _id: newId,
            total: total,
            fecha: fecha,
            clienteID: clienteID,
            medioPagoID: medioPagoID,
            estado:true
        });

        await newReciboPago.save();

        return res.status(201).json({
            ok: true,
            message: 'Recibo de pago agregado correctamente.',
            data: newReciboPago
        })

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            message: 'Error interno del servidor.'
        });
    }
};


const getReciboPago = async(req, res) => {
    const recibos = await ReciboPago.find({estado:true});

    res.status(200).json({
        ok:true,
        data: recibos,
    })
}

const getReciboPagoID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const reciboPagoEncontrado = await ReciboPago.findById(id);
    if(!reciboPagoEncontrado){
        res.status(400).json({
            ok:false,
            message:'El id no corresponde a un ReciboPago.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:reciboPagoEncontrado,
    })
}

const updateReciboPago = async(req,res) => {
    const id = req.params.id;
    
    const total = req.body.total;
    const fecha = obtenerFechaHoy();
    const clienteID = req.body.clienteID;
    const medioPagoID = req.body.medioPagoID;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.',
        })
        return
    }

    const updatedReciboPagoData = {
        total: total,
        fecha: fecha,
        clienteID: clienteID,
        medioPagoID: medioPagoID,
    };

    const updatedReciboPago = await ReciboPago.findByIdAndUpdate(
        id,
        updatedReciboPagoData,
        { new: true , runValidators: true }
    )

    if(!updatedReciboPago){
        res.status(400).json({
            ok:false,
            message:'Error al actualizar el recibo de pago.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:updatedReciboPago,
        message:'Recibo de pago actualizado correctamente.',
    })
}

const deleteReciboPago = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.'
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
            message: 'Error durante el borrado.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'Recibo de pago eliminado correctamente.',
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
        res.status(200).json({ ok: true, data: recibosFiltrados });
    } else {
        res.status(500).json({ ok: false, message: "Error al buscar recibos" });
    }
};

module.exports = { setReciboPago , getReciboPago , getReciboPagoID , updateReciboPago , deleteReciboPago , buscarReciboPago };
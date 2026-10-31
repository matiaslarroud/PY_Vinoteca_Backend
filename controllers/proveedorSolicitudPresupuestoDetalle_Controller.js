const SolicitudPresupuestoDetalle = require("../models/proveedorSolicitudPresupuestoDetalle_Model");
const getNextSequence = require("./counter_Controller");

const getSolicitudPresupuestoDetalle = async(req, res) => {
    const detallesPresupuesto = await SolicitudPresupuestoDetalle.find({estado:true}).lean();
     res.status(200).json({
        ok:true,
        data: detallesPresupuesto
    })
}

const getSolicitudPresupuestoDetalleBySolicitudPresupuesto = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente',
        })
        return
    }

    const presupuestoDetalle = await SolicitudPresupuestoDetalle.find({solicitudPresupuesto:id, estado:true});
    if(!presupuestoDetalle){
        res.status(400).json({
            ok:false,
            message:'❌ El id no corresponde al detalle de una solicitud de presupuesto.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:presupuestoDetalle,
        message:"✔️ Detalles de solicitudes de presupuesto obtenidos correctamente."
    })
}


const getSolicitudPresupuestoDetalleID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente',
        })
        return
    }

    const presupuestoDetalle = await SolicitudPresupuestoDetalle.findById(id);
    if(!presupuestoDetalle){
        res.status(400).json({
            ok:false,
            message:'❌ El id no corresponde al detalle de un presupuesto.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:presupuestoDetalle,
        message:"✔️ Detalles de solicitudes de presupuesto obtenidos correctamente."
    })
}

module.exports = { getSolicitudPresupuestoDetalle , getSolicitudPresupuestoDetalleID , getSolicitudPresupuestoDetalleBySolicitudPresupuesto };;;;
const PresupuestoDetalle = require("../models/clientePresupuestoDetalle_Model");
const getNextSequence = require("../controllers/counter_Controller");

const getPresupuestoDetalle = async(req, res) => {
    const detallesPresupuesto = await PresupuestoDetalle.find({estado:true}).lean();
    res.status(200).json({
        ok:true,
        data: detallesPresupuesto
    })
}

const getPresupuestoDetalleByPresupuesto = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente',
        })
        return
    }

    const presupuestoDetalle = await PresupuestoDetalle.find({presupuesto:id, estado:true});
    if(!presupuestoDetalle){
        res.status(400).json({
            ok:false,
            message:'❌ El id no corresponde al detalle de un presupuesto.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        message:"✔️ Detalles de presupuestos obtenidos correctamente.",
        data:presupuestoDetalle,
    })
}


const getPresupuestoDetalleID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente',
        })
        return
    }

    const presupuestoDetalle = await PresupuestoDetalle.findById(id);
    if(!presupuestoDetalle){
        res.status(400).json({
            ok:false,
            message:'❌El id no corresponde al detalle de un presupuesto.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:presupuestoDetalle,
        message:"✔️ Detalle de presupuesto obtenido correctamente."
    })
}

module.exports = { getPresupuestoDetalle , getPresupuestoDetalleID , getPresupuestoDetalleByPresupuesto };;;;
const OrdenProduccionDetalle = require("../models/ordenProduccionDetalle_Model");
const getNextSequence = require("../controllers/counter_Controller");

const getOrdenDetalle = async(req, res) => {
    const detallesOrden = await OrdenProduccionDetalle.find({estado:true}).lean();
    res.status(200).json({
        ok:true,
        data: detallesOrden,
    })
}

const getOrdenDetalleID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente',
        })
        return
    }

    const ordenDetalle = await OrdenProduccionDetalle.findById(id);
    if(!ordenDetalle){
        res.status(400).json({
            ok:false,
            message:'❌ El id no corresponde al detalle de una orden de produccion.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        message:"✔️ Detalle de orden obtenido correctamente.",
        data:ordenDetalle,
    })
}

const getOrdenDetalle_ByOrden = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente',
        })
        return
    }

    const ordenDetalle = await OrdenProduccionDetalle.find({ordenProduccion:id , estado:true});
    if(!ordenDetalle || ordenDetalle.length === 0){
        res.status(400).json({
            ok:false,
            message:'❌ El id no corresponde a los detalles de una orden de produccion.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        message:"✔️ Detalles de ordenes obtenidos correctamente.",
        data:ordenDetalle,
    })
}

module.exports = { getOrdenDetalle , getOrdenDetalleID , getOrdenDetalle_ByOrden };;;;
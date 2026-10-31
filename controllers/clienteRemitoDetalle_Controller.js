const RemitoDetalle = require("../models/clienteRemitoDetalle_Model");
const getNextSequence = require("../controllers/counter_Controller");

const getRemitoDetalle = async(req, res) => {
    const detallesRemito= await RemitoDetalle.find({estado:true}).lean();

    res.status(200).json({
        ok:true,
        data: detallesRemito
    })
}

const getRemitoDetalleByRemito = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente',
        })
        return
    }

    const remitoDetalleEncontrado = await RemitoDetalle.find({remitoID:id , estado:true});
    if(!remitoDetalleEncontrado){
        res.status(400).json({
            ok:false,
            message:'❌ El id no corresponde a un detalle de remito.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:remitoDetalleEncontrado,
        message:"✔️ Detalles de remito obtenidos correctamente."
    })
}


const getRemitoDetalleID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente',
        })
        return
    }

    const remitoDetalleEncontrado = await RemitoDetalle.findById(id);
    if(!remitoDetalleEncontrado){
        res.status(400).json({
            ok:false,
            message:'❌ El id no corresponde al detalle de un remito.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:remitoDetalleEncontrado,
        message:"✔️ Detalle de remito obtenido correctamente."
    })
}

module.exports = { getRemitoDetalle , getRemitoDetalleID , getRemitoDetalleByRemito };;;;
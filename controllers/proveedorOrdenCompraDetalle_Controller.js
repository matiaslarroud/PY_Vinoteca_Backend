const OrdenCompraDetalle = require("../models/proveedorOrdenCompraDetalle_Model");
const getNextSequence = require("./counter_Controller");

const getOrdenCompraDetalle = async(req, res) => {
    const ordenes = await OrdenCompraDetalle.find({estado:true}).lean();
    res.status(200).json({
        ok:true,
        data: ordenes,
    })
}

const getOrdenCompraDetalleID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente',
        })
        return
    }

    const ordenCompraDetalle = await OrdenCompraDetalle.findById(id);
    if(!ordenCompraDetalle){
        res.status(400).json({
            ok:false,
            message:'❌ El id no corresponde a un detalle de orden de compra.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        message:'✔️ Detalle de orden de compra obtenida correctamente.',
        data:ordenCompraDetalle,
    })
}

const getOrdenCompraDetalleByOrdenCompra = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente',
        })
        return
    }

    const ordenCompraDetalle = await OrdenCompraDetalle.find({ordenCompra:id , estado:true});
    if(!ordenCompraDetalle){
        res.status(400).json({
            ok:false,
            message:'❌ El id no corresponde al detalle de una orden de compra.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        message:'✔️ Detalles de orden de compra obtenidos correctamente.',
        data:ordenCompraDetalle,
    })
}

module.exports = { getOrdenCompraDetalleByOrdenCompra , getOrdenCompraDetalle , getOrdenCompraDetalleID };;;;
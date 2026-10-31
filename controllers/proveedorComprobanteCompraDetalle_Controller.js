const ComprobanteCompra = require("../models/proveedorComprobanteCompra_Model");
const ComprobanteCompraDetalle = require("../models/proveedorComprobanteCompraDetalle_Model");
const OrdenCompra = require("../models/proveedorOrdenCompra_Model");
const OrdenCompraDetalle = require("../models/proveedorOrdenCompraDetalle_Model");

const getNextSequence = require("./counter_Controller");

const getComprobanteCompraDetalle = async(req, res) => {
    const comprobantes = await ComprobanteCompraDetalle.find({estado:true}).lean();

    res.status(200).json({
        ok:true,
        data: comprobantes,
    })
}

const getComprobanteCompraDetalleByComprobanteCompra = async(req, res) => {
    const id = req.params.id;

    const comprobantes = await ComprobanteCompraDetalle.find({comprobanteCompra: id , estado:true}).lean();

    if(comprobantes.length === 0){
            res.status(400).json({
            ok:false,
            message: "❌ Error al obtener detalles de comprobante de compra.",
            data: comprobantes,
        })
    };

    res.status(200).json({
        ok:true,
        message: "✔️ Detalles de comprobantes de compra obtenidos correctamente.",
        data: comprobantes,
    })
}

const getComprobanteCompraDetalleID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente',
        })
        return
    }

    const comprobanteCompraDetalle = await ComprobanteCompraDetalle.findById(id);
    if(!comprobanteCompraDetalle){
        res.status(400).json({
            ok:false,
            message:'❌ El id no corresponde a un detalle de comprobante de compra.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:comprobanteCompraDetalle,
        message: "✔️ Detalle de comprobante de compra obtenido correctamente.",
    })
}

module.exports = { getComprobanteCompraDetalleByComprobanteCompra , getComprobanteCompraDetalle , getComprobanteCompraDetalleID };;;;;
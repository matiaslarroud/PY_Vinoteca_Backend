const ComprobanteVentaDetalle = require("../models/clienteComprobanteVentaDetalle_Model");
const ComprobanteVenta = require("../models/clienteComprobanteVenta_Model");
const ProductoVino = require("../models/productoVino_Model");
const getNextSequence = require("../controllers/counter_Controller");

const getComprobanteVentaDetalle = async(req, res) => {
    const detallesNotaPedido = await ComprobanteVentaDetalle.find({estado:true}).lean();

    res.status(200).json({
        ok:true,
        data: detallesNotaPedido
    })
}

const getComprobanteVentaDetalleByComprobanteVenta = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente',
        })
        return
    }

    const comprobanteVentaDetalleEncontrado = await ComprobanteVentaDetalle.find({comprobanteVenta:id , estado:true});
    if(!comprobanteVentaDetalleEncontrado){
        res.status(400).json({
            ok:false,
            message:'❌ El id no corresponde a un detalle de comprobante de venta.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        message:"✔️ Detalles de comprobantes de venta obtenidos correctamente.",
        data:comprobanteVentaDetalleEncontrado,
    })
}


const getComprobanteVentaDetalleID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'✔️ El id no llego al controlador correctamente',
        })
        return
    }

    const comprobanteVentaDetalleEncontrado = await ComprobanteVentaDetalle.findById(id);
    if(!comprobanteVentaDetalleEncontrado){
        res.status(400).json({
            ok:false,
            message:'❌ El id no corresponde al detalle de un comprobante de venta.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        message:"✔️ Detalle de comprobante de venta obtenido correctamente.",
        data:comprobanteVentaDetalleEncontrado,
    })
}

module.exports = { getComprobanteVentaDetalle , getComprobanteVentaDetalleID , getComprobanteVentaDetalleByComprobanteVenta };;;;
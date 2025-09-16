const ComprobanteVentaDetalle = require("../models/clienteComprobanteVentaDetalle_Model");
const getNextSequence = require("../controllers/counter_Controller");

const setComprobanteVentaDetalle = async (req,res) => {
    const newId = await getNextSequence("Cliente_ComprobanteVentaDetalle");
    const subtotalP = req.body.subtotal;
    const comprobanteVentaP = req.body.comprobanteVenta;
    const productoID = req.body.producto;
    const precioP = req.body.precio;
    const cantidadP = req.body.cantidad;

    if(!subtotalP || !comprobanteVentaP || !productoID || !precioP || !cantidadP){
        res.status(400).json({ok:false , message:'Error al cargar los datos.'})
        return
    }
    const newComprobanteVentaDetalle = new ComprobanteVentaDetalle ({
        _id: newId,
        subtotal: subtotalP , 
        comprobanteVenta: comprobanteVentaP , 
        producto: productoID , 
        precio:precioP , 
        cantidad:cantidadP
    });
    await newComprobanteVentaDetalle.save()
        .then( () => {
            res.status(201).json({ok:true, message:'Detalle de comprobante de venta agregado correctamente.', data: newComprobanteVentaDetalle})
        })
        .catch((err)=>{console.log(err)});

}

const getComprobanteVentaDetalle = async(req, res) => {
    const detallesNotaPedido = await ComprobanteVentaDetalle.find();

    res.status(200).json({
        ok:true,
        data: detallesNotaPedido,
    })
}

const getComprobanteVentaDetalleByComprobanteVenta = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const comprobanteVentaDetalleEncontrado = await ComprobanteVentaDetalle.find({comprobanteVenta:id});
    if(!comprobanteVentaDetalleEncontrado){
        res.status(400).json({
            ok:false,
            message:'El id no corresponde a un detalle de comprobante de venta.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:comprobanteVentaDetalleEncontrado,
    })
}


const getComprobanteVentaDetalleID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const comprobanteVentaDetalleEncontrado = await ComprobanteVentaDetalle.findByID(id);
    if(!comprobanteVentaDetalleEncontrado){
        res.status(400).json({
            ok:false,
            message:'El id no corresponde al detalle de un comprobante de venta.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:comprobanteVentaDetalleEncontrado,
    })
}

const updateComprobanteVentaDetalle = async(req,res) => {
    const id = req.params.id;
    
    const subtotalP = req.body.subtotal;
    const comprobanteVentaP = req.body.comprobanteVenta;
    const productoID = req.body.producto;
    const precioP = req.body.precio;
    const cantidadP = req.body.cantidad;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.',
        })
        return
    }

    const updatedComprobanteVentaDetalle = await ComprobanteVentaDetalle.findByIdAndUpdate(
        id,
        {   
            subtotal: subtotalP , 
            comprobanteVenta: comprobanteVentaP , 
            producto: productoID , 
            precio:precioP , 
            cantidad:cantidadP
        },
        { new: true , runValidators: true }
    )

    if(!updatedComprobanteVentaDetalle){
        res.status(400).json({
            ok:false,
            message:'Error al actualizar el detalle del comprobante de venta.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:updatedComprobanteVentaDetalle,
        message:'Detalle de comprobante de venta actualizado correctamente.',
    })
}

const deleteComprobanteVentaDetalle = async(req,res) => {
    const id = req.params.id;
    
    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.'
        })
        return
    }

    const deletedComprobanteVentaDetalle = await ComprobanteVentaDetalle.deleteMany({comprobanteVenta:id});
    if(!deletedComprobanteVentaDetalle){
        res.status(400).json({
            ok:false,
            message: 'Error durante el borrado.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'Detalle de comprobante de venta eliminado correctamente.'
    })
}

module.exports = { setComprobanteVentaDetalle , getComprobanteVentaDetalle , getComprobanteVentaDetalleID , updateComprobanteVentaDetalle , deleteComprobanteVentaDetalle , getComprobanteVentaDetalleByComprobanteVenta };
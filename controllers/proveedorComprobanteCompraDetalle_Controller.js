const ComprobanteCompraDetalle = require("../models/proveedorComprobanteCompraDetalle_Model");
const getNextSequence = require("./counter_Controller");

const setComprobanteCompraDetalle = async (req,res) => {
    const newId = await getNextSequence("Proveedor_OrdenCompraDetalle");
    const comprobanteCompra = req.body.comprobanteCompra;
    const producto = req.body.producto;
    const cantidad = req.body.cantidad;
    const importe = req.body.importe;
    const precio = req.body.precio;


    if(!comprobanteCompra || !producto || !cantidad || !importe || !precio ){
        res.status(400).json({ok:false , message:'Error al cargar los datos.'})
        return
    }
    
    const newComprobanteCompraDetalle = new ComprobanteCompraDetalle ({
        _id: newId,
        comprobanteCompra: comprobanteCompra , 
        producto: producto , 
        cantidad: cantidad , 
        importe: importe ,
        precio : precio,
        estado:true
    });

    await newComprobanteCompraDetalle.save()
        .then( () => {
            res.status(201).json({
                ok:true, 
                message:'Comprobante de compra agregada correctamente.',
                data: newComprobanteCompraDetalle
            })
        })
        .catch((err)=>{console.log(err)});

}

const getComprobanteCompraDetalle = async(req, res) => {
    const comprobantes = await ComprobanteCompraDetalle.find({estado:true});

    res.status(200).json({
        ok:true,
        data: comprobantes,
    })
}

const getComprobanteCompraDetalleID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const comprobanteCompraDetalle = await ComprobanteCompraDetalle.findById(id);
    if(!comprobanteCompraDetalle){
        res.status(400).json({
            ok:false,
            message:'El id no corresponde a un detalle de comprobante de compra.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:comprobanteCompraDetalle,
    })
}

const updateComprobanteCompraDetalle = async(req,res) => {
    const id = req.params.id;
    
    const comprobanteCompra = req.body.comprobanteCompra;
    const producto = req.body.producto;
    const cantidad = req.body.cantidad;
    const importe = req.body.importe;
    const precio = req.body.precio;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.',
        })
        return
    }

    const updatedComprobanteCompraDetalle = await ComprobanteCompraDetalle.findByIdAndUpdate(
        id,
        {   
            comprobanteCompra: comprobanteCompra , 
            producto: producto , 
            cantidad: cantidad , 
            importe: importe ,
            precio : precio,
        },
        { new: true , runValidators: true }
    )

    if(!updatedComprobanteCompraDetalle){
        res.status(400).json({
            ok:false,
            message:'Error al actualizar detalle del comprobante de compra.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:updatedComprobanteCompraDetalle,
        message:'Comprobante de compra actualizado correctamente.',
    })
}

const deleteComprobanteCompraDetalle = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.'
        })
        return
    }

    const deletedComprobanteCompraDetalle = await ComprobanteCompraDetalle.findByIdAndUpdate(
        id,
        {   
            estado:false
        },
        { new: true , runValidators: true }
    )
;
    if(!deletedComprobanteCompraDetalle){
        res.status(400).json({
            ok:false,
            message: 'Error durante el borrado.'
        })
        return
    }
    const deletedByComprobanteCompra = await ComprobanteCompraDetalle.updateMany(
        {comprobanteCompra:id},
        {   
            estado:false
        },
        { new: true , runValidators: true }
    )
    
    if(!deletedByComprobanteCompra){
        res.status(400).json({
            ok:false,
            message: 'Error durante el borrado del detalle.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'Comprobante de compra detalle eliminado correctamente.'
    })
}

module.exports = { setComprobanteCompraDetalle , getComprobanteCompraDetalle , getComprobanteCompraDetalleID , updateComprobanteCompraDetalle , deleteComprobanteCompraDetalle };
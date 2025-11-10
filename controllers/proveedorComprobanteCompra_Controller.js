const ComprobanteCompra = require("../models/proveedorComprobanteCompra_Model");
const ComprobanteCompraDetalle = require("../models/proveedorComprobanteCompraDetalle_Model");
const getNextSequence = require("./counter_Controller");

const obtenerFechaHoy = () => {
  const hoy = new Date();
  return hoy.toISOString().split("T")[0];
}

const setComprobanteCompra = async (req,res) => {
    const newId = await getNextSequence("Proveedor_ComprobanteCompra");
    const total = req.body.total;
    const fecha = obtenerFechaHoy();
    const ordenCompra = req.body.ordenCompra;


    if(!total || !fecha || !ordenCompra ){
        res.status(400).json({ok:false , message:'Error al cargar los datos.'})
        return
    }
    
    const newComprobanteCompra = new ComprobanteCompra ({
        _id: newId,
        total: total , 
        fecha: fecha , 
        ordenCompra : ordenCompra ,
        estado:true
    });

    await newComprobanteCompra.save()
        .then( () => {
            res.status(201).json({
                ok:true, 
                message:'Comprobante de compra agregada correctamente.',
                data: newComprobanteCompra
            })
        })
        .catch((err)=>{console.log(err)});

}

const getComprobanteCompra = async(req, res) => {
    const comprobantes = await ComprobanteCompra.find({estado:true});

    res.status(200).json({
        ok:true,
        data: comprobantes,
    })
}

const getComprobanteCompraID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const comprobanteCompra = await ComprobanteCompra.findById(id);
    if(!comprobanteCompra){
        res.status(400).json({
            ok:false,
            message:'El id no corresponde a una comprobante de compra.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:comprobanteCompra,
    })
}

const updateComprobanteCompra = async(req,res) => {
    const id = req.params.id;
    
    const total = req.body.total;
    const fecha = req.body.fecha;
    const ordenCompra = req.body.ordenCompra;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.',
        })
        return
    }

    const updatedComprobanteCompra = await ComprobanteCompra.findByIdAndUpdate(
        id,
        {   
            total: total , 
            fecha: fecha , 
            ordenCompra : ordenCompra ,
        },
        { new: true , runValidators: true }
    )

    if(!updatedComprobanteCompra){
        res.status(400).json({
            ok:false,
            message:'Error al actualizar la comprobante de compra.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:updatedComprobanteCompra,
        message:'Comprobante de compra actualizado correctamente.',
    })
}

const deleteComprobanteCompra = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.'
        })
        return
    }

    const deletedComprobanteCompra = await ComprobanteCompra.findByIdAndUpdate(
        id,
        {   
            estado:false
        },
        { new: true , runValidators: true }
    )
;
    if(!deletedComprobanteCompra){
        res.status(400).json({
            ok:false,
            message: 'Error durante el borrado.'
        })
        return
    }
    const deletedComprobanteCompraDetalle = await ComprobanteCompraDetalle.updateMany(
        {comprobanteCompra:id},
        {   
            estado:false
        },
        { new: true , runValidators: true }
    )
    
    if(!deletedComprobanteCompraDetalle){
        res.status(400).json({
            ok:false,
            message: 'Error durante el borrado del detalle.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'Comprobante de compra eliminado correctamente.'
    })
}

module.exports = { setComprobanteCompra , getComprobanteCompra , getComprobanteCompraID , updateComprobanteCompra , deleteComprobanteCompra };
const RemitoDetalle = require("../models/proveedorRemitoDetalle_Model");
const getNextSequence = require("./counter_Controller");

const setRemitoDetalle = async (req,res) => {
    const newId = await getNextSequence("Proveedor_RemitoDetalle");
    const remito = req.body.remito;
    const productoID = req.body.producto;
    const cantidad = req.body.cantidad;

    if(!remito || !productoID || !cantidad){
        res.status(400).json({ok:false , message:'Error al cargar los datos.'})
        return
    }
    const newRemitoDetalle = new RemitoDetalle ({
        _id: newId,
        remito: remito,
        producto: productoID,
        cantidad: cantidad,
        estado:true
    });
    await newRemitoDetalle.save()
        .then( () => {
            res.status(201).json({
                ok:true, 
                message:'Detalle de remito agregado correctamente.', 
                data: newRemitoDetalle})
        })
        .catch((err)=>{console.log(err)});

}

const getRemitoDetalle = async(req, res) => {
    const detallesRemito= await RemitoDetalle.find({estado:true});

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
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const remitoDetalleEncontrado = await RemitoDetalle.find({remito:id});
    if(!remitoDetalleEncontrado){
        res.status(400).json({
            ok:false,
            message:'El id no corresponde a un detalle de remito.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:remitoDetalleEncontrado,
    })
}


const getRemitoDetalleID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const remitoDetalleEncontrado = await RemitoDetalle.findByID(id);
    if(!remitoDetalleEncontrado){
        res.status(400).json({
            ok:false,
            message:'El id no corresponde al detalle de un remito.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:remitoDetalleEncontrado,
    })
}

const updateRemitoDetalle = async(req,res) => {
    const id = req.params.id;
    
    const remitoID = req.body.remito;
    const productoID = req.body.producto;
    const cantidad = req.body.cantidad;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.',
        })
        return
    }

    const updatedRemitoDetalle = await RemitoDetalle.findByIdAndUpdate(
        id,
        {   
            remito: remitoID,
            producto: productoID,
            cantidad: cantidad,
        },
        { new: true , runValidators: true }
    )

    if(!updatedRemitoDetalle){
        res.status(400).json({
            ok:false,
            message:'Error al actualizar el detalle del remito.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:updatedRemitoDetalle,
        message:'Detalle de remito actualizado correctamente.',
    })
}

const deleteRemitoDetalle = async(req,res) => {
    const id = req.params.id;
    
    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.'
        })
        return
    }

    const deletedRemitoDetalle = await RemitoDetalle.updateMany(
        {remito:id},
        {   
            estado:false
        },
        { new: true , runValidators: true }
    )
    
    if(!deletedRemitoDetalle){
        res.status(400).json({
            ok:false,
            message: 'Error durante el borrado.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'Detalle de remito eliminado correctamente.'
    })
}

module.exports = { setRemitoDetalle , getRemitoDetalle , getRemitoDetalleID , updateRemitoDetalle , deleteRemitoDetalle , getRemitoDetalleByRemito };
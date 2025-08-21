const RemitoDetalle = require("../models/clienteRemitoDetalle_Model");

const setRemitoDetalle = async (req,res) => {
    const remitoID = req.body.remitoID;
    const productoID = req.body.producto;
    const cantidad = req.body.cantidad;

    if(!remitoID || !productoID || !cantidad){
        res.status(400).json({ok:false , message:'Error al cargar los datos.'})
        return
    }
    const newRemitoDetalle = new RemitoDetalle ({
        remitoID: remitoID,
        producto: productoID,
        cantidad: cantidad,
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
    const detallesRemito= await RemitoDetalle.find();

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

    const remitoDetalleEncontrado = await RemitoDetalle.find({remitoID:id});
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
    
    const remitoID = req.body.remitoID;
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
            remitoID: remitoID,
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

    const deletedRemitoDetalle = await RemitoDetalle.deleteMany({remitoID:id});
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
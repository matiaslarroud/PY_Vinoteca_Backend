const PresupuestoDetalle = require("../models/clientePresupuestoDetalle_Model");

const setPresupuestoDetalle = async (req,res) => {
    const subtotalP = req.body.subtotal;
    const precioP = req.body.precio;
    const cantidadP = req.body.cantidad;
    const presupuestoP = req.body.presupuesto;
    const productoID = req.body.producto;

    if(!subtotalP || !presupuestoP || !productoID || !precioP || !cantidadP ){
        res.status(400).json({ok:false , message:'Error al cargar los datos.'})
        return
    }
    const newPresupuestoDetalle = new PresupuestoDetalle ({
        subtotal: subtotalP , presupuesto: presupuestoP , producto: productoID , precio:precioP , cantidad:cantidadP
    });
    await newPresupuestoDetalle.save()
        .then( () => {
            res.status(201).json({ok:true, message:'Presupuesto Detalle agregado correctamente.'})
        })
        .catch((err)=>{console.log(err)});

}

const getPresupuestoDetalle = async(req, res) => {
    const detallesPresupuesto = await PresupuestoDetalle.find();

    res.status(200).json({
        ok:true,
        data: detallesPresupuesto,
    })
}

const getPresupuestoDetalleByPresupuesto = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const presupuestoDetalle = await PresupuestoDetalle.find({presupuesto:id});
    if(!presupuestoDetalle){
        res.status(400).json({
            ok:false,
            message:'El id no corresponde al detalle de un presupuesto.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:presupuestoDetalle,
    })
}


const getPresupuestoDetalleID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const presupuestoDetalle = await PresupuestoDetalle.findByID(id);
    if(!presupuestoDetalle){
        res.status(400).json({
            ok:false,
            message:'El id no corresponde al detalle de un presupuesto.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:presupuestoDetalle,
    })
}

const updatePresupuestoDetalle = async(req,res) => {
    const id = req.params.id;
    
    const subtotalP = req.body.subtotal;
    const presupuestoP = req.body.presupuesto;
    const productoID = req.body.producto;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.',
        })
        return
    }

    const updatedPresupuestoDetalle = await PresupuestoDetalle.findByIdAndUpdate(
        id,
        {   
            subtotal: subtotalP , presupuesto: presupuestoP , producto: productoID
        },
        { new: true , runValidators: true }
    )

    if(!updatedPresupuestoDetalle){
        res.status(400).json({
            ok:false,
            message:'Error al actualizar el PresupuestoDetalle.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:updatedPresupuestoDetalle,
        message:'PresupuestoDetalle actualizado correctamente.',
    })
}

const deletePresupuestoDetalle = async(req,res) => {
    const id = req.params.id;
    
    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.'
        })
        return
    }

    const deletedPresupuestoDetalle = await PresupuestoDetalle.deleteMany({presupuesto:id});
    if(!deletedPresupuestoDetalle){
        res.status(400).json({
            ok:false,
            message: 'Error durante el borrado.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'PresupuestoDetalle eliminado correctamente.'
    })
}

module.exports = { setPresupuestoDetalle , getPresupuestoDetalle , getPresupuestoDetalleID , updatePresupuestoDetalle , deletePresupuestoDetalle , getPresupuestoDetalleByPresupuesto };
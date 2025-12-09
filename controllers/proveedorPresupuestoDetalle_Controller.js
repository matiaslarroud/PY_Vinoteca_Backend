const PresupuestoDetalle = require("../models/proveedorPresupuestoDetalle_Model");
const getNextSequence = require("./counter_Controller");

const setPresupuestoDetalle = async (req,res) => {
    const importeP = req.body.importe;
    const precioP = req.body.precio;
    const cantidadP = req.body.cantidad;
    const presupuestoP = req.body.presupuesto;
    const productoID = req.body.producto;

    if(!importeP || !presupuestoP || !productoID || !precioP || !cantidadP ){
        res.status(400).json({ok:false , message:"❌ Faltan completar algunos campos obligatorios."})
        return
    }
    const newId = await getNextSequence("Cliente_PresupuestoDetalle");
    const newPresupuestoDetalle = new PresupuestoDetalle ({
        _id: newId,
        importe: importeP , presupuesto: presupuestoP , producto: productoID , precio:precioP , cantidad:cantidadP , estado : true
    });
    await newPresupuestoDetalle.save()
        .then( () => {
            res.status(201).json({ok:true, message:'✔️Presupuesto Detalle agregado correctamente.'})
        })
        .catch((err) => {
            res.status(400).json({
                ok:false,
                message:`❌ Error al agregar presupuesto detalle. ERROR:\n${err}`
            })
        }) 

}

const getPresupuestoDetalle = async(req, res) => {
    const detallesPresupuesto = await PresupuestoDetalle.find({estado:true}).lean();
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
            message:'❌ El id no llego al controlador correctamente',
        })
        return
    }

    const presupuestoDetalle = await PresupuestoDetalle.find({presupuesto:id , estado:true});
    if(!presupuestoDetalle){
        res.status(400).json({
            ok:false,
            message:'❌ El id no corresponde al detalle de un presupuesto.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        message:"✔️ Detalles de presupuesto obtenidos correctamente.",
        data:presupuestoDetalle,
    })
}


const getPresupuestoDetalleID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente',
        })
        return
    }

    const presupuestoDetalle = await PresupuestoDetalle.findByID(id);
    if(!presupuestoDetalle){
        res.status(400).json({
            ok:false,
            message:'❌ El id no corresponde al detalle de un presupuesto.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        message:"✔️ Presupuesto detalle obtenido correctamente.",
        data:presupuestoDetalle,
    })
}

const updatePresupuestoDetalle = async(req,res) => {
    const id = req.params.id;
    
    const importeP = req.body.importe;
    const presupuestoP = req.body.presupuesto;
    const productoID = req.body.producto;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌El id no llego al controlador correctamente.',
        })
        return
    }

    if( !importeP || !presupuestoP || !productoID ){
        res.status(400).json({ok:false , message:"❌ Faltan completar algunos campos obligatorios."})
        return
    }

    const updatedPresupuestoDetalle = await PresupuestoDetalle.findByIdAndUpdate(
        id,
        {   
            importe: importeP , presupuesto: presupuestoP , producto: productoID
        },
        { new: true , runValidators: true }
    )

    if(!updatedPresupuestoDetalle){
        res.status(400).json({
            ok:false,
            message:'❌ Error al actualizar el detalle de presupuesto.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:updatedPresupuestoDetalle,
        message:'✔️ Detalle de presupuesto actualizado correctamente.',
    })
}

const deletePresupuestoDetalle = async(req,res) => {
    const id = req.params.id;
    
    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente.'
        })
        return
    }

    const deletedPresupuestoDetalle = await PresupuestoDetalle.updateMany(
        {presupuesto : id},
        {   
            estado:false
        },
        { new: true , runValidators: true }
    )
    if(!deletedPresupuestoDetalle){
        res.status(400).json({
            ok:false,
            message: '❌ Error durante el borrado.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'✔️ Detalle de presupuesto eliminado correctamente.'
    })
}

module.exports = { setPresupuestoDetalle , getPresupuestoDetalle , getPresupuestoDetalleID , updatePresupuestoDetalle , deletePresupuestoDetalle , getPresupuestoDetalleByPresupuesto };
const SolicitudPresupuestoDetalle = require("../models/proveedorSolicitudPresupuestoDetalle_Model");
const getNextSequence = require("./counter_Controller");

const setSolicitudPresupuestoDetalle = async (req,res) => {
    const newId = await getNextSequence("Proveedor_SolicitudPresupuestoDetalle");
    const cantidadP = req.body.cantidad;
    const solicitudPresupuestoP = req.body.solicitudPresupuesto;
    const productoID = req.body.producto;
    const importe = req.body.importe;

    if(!solicitudPresupuestoP || !productoID || !cantidadP ){
        res.status(400).json({ok:false , message:'Error al cargar los datos.'})
        return
    }
    const newPresupuestoDetalle = new SolicitudPresupuestoDetalle ({
        _id: newId,
        solicitudPresupuesto: solicitudPresupuestoP , producto: productoID , 
        cantidad:cantidadP , importe:importe , estado:true
    });
    await newPresupuestoDetalle.save()
        .then( () => {
            res.status(201).json({ok:true, message:'Solicitud de presupuesto detalle agregado correctamente.'})
        })
        .catch((err)=>{console.log(err)});

}

const getSolicitudPresupuestoDetalle = async(req, res) => {
    const detallesPresupuesto = await SolicitudPresupuestoDetalle.find({estado:true});

    res.status(200).json({
        ok:true,
        data: detallesPresupuesto,
    })
}

const getSolicitudPresupuestoDetalleBySolicitudPresupuesto = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const presupuestoDetalle = await SolicitudPresupuestoDetalle.find({solicitudPresupuesto:id, estado:true});
    if(!presupuestoDetalle){
        res.status(400).json({
            ok:false,
            message:'El id no corresponde al detalle de una solicitud de presupuesto.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:presupuestoDetalle,
    })
}


const getSolicitudPresupuestoDetalleID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const presupuestoDetalle = await SolicitudPresupuestoDetalle.findByID(id);
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

const updateSolicitudPresupuestoDetalle = async(req,res) => {
    const id = req.params.id;
    
    const cantidadP = req.body.cantidad;
    const solicitudPresupuestoP = req.body.solicitudPresupuesto;
    const productoID = req.body.producto;
    const importe = req.body.importe;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.',
        })
        return
    }

    const updatedPresupuestoDetalle = await SolicitudPresupuestoDetalle.findByIdAndUpdate(
        id,
        {   
            cantidad: cantidadP , solicitudPresupuesto: solicitudPresupuestoP , 
            producto: productoID , importe: importe
        },
        { new: true , runValidators: true }
    )

    if(!updatedPresupuestoDetalle){
        res.status(400).json({
            ok:false,
            message:'Error al actualizar el solicitud de presupuesto detalle.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:updatedPresupuestoDetalle,
        message:'Solicitud de presupuesto detalle actualizado correctamente.',
    })
}

const deleteSolicitudPresupuestoDetalle = async(req,res) => {
    const id = req.params.id;
    
    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.'
        })
        return
    }

    const deletedPresupuestoDetalle = await SolicitudPresupuestoDetalle.updateMany(
        { solicitudPresupuesto: id },
        { estado: false },
        { new: true, runValidators: true }
    );

    if(!deletedPresupuestoDetalle){
        res.status(400).json({
            ok:false,
            message: 'Error durante el borrado.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'Solicitud de presupuesto detalle eliminado correctamente.'
    })
}

module.exports = { setSolicitudPresupuestoDetalle , getSolicitudPresupuestoDetalle , getSolicitudPresupuestoDetalleID , updateSolicitudPresupuestoDetalle , deleteSolicitudPresupuestoDetalle , getSolicitudPresupuestoDetalleBySolicitudPresupuesto};
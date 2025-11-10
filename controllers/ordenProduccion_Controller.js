const OrdenProduccion = require('../models/ordenProduccion_Model');
const OrdenProduccionDetalle = require("../models/ordenProduccionDetalle_Model");
const getNextSequence = require("../controllers/counter_Controller");

const obtenerFechaHoy = () => {
  const hoy = new Date();
  return hoy.toISOString().split("T")[0];
}

const setOrdenProduccion =  async (req , res ) => {
    const newId = await getNextSequence("OrdenProduccion");
    const fechaOrden = obtenerFechaHoy();
    const fechaElaboracionOrden = req.body.fechaElaboracion;
    const fechaEntregaOrden = req.body.fechaEntrega;
    const empleadoOrden = req.body.empleado;
    
    if (!fechaOrden || !fechaElaboracionOrden || !fechaEntregaOrden || !empleadoOrden) {
        res.status(400).json({ok:false , message:'No se puede cargar la orden de produccion sin todos los datos.'});
        return
    }

    const newOrden = new OrdenProduccion({
        _id: newId,
        fecha: fechaOrden,
        fechaElaboracion: fechaElaboracionOrden,
        fechaEntrega: fechaEntregaOrden,
        empleado: empleadoOrden,
        estado:true
    });

    if(!newOrden){
        res.status(400).json({
            ok:false,
            message:"Error al cargar la orden de produccion."
        })
        return
    }
    await newOrden.save()
        .then(() => { 
            res.status(201).json({
                ok:true ,
                data: newOrden,
                message:'Orden de produccion agregada correctamente.'
            })
        })
        .catch((error) => { console.log(error) }) 
    
}

const getOrdenProduccion = async(req,res) => {
    const ordenes = await OrdenProduccion.find({estado:true});

    res.status(200).json({
        ok:true,
        data:ordenes,
    })
}

const getOrdenProduccionID = async(req,res) => {
    const id = req.params.id;
    if(!id) {
        res.status(400).json({ok:false, message:"El id no llego al controlador correctamente."})
        return
    }
    
    const orden = await OrdenProduccion.findById(id);
    if (!orden) {
        res.status(400).json({ok:false, message:"El id no corresponde a una orden de produccion."});
        return
    }
    res.status(200).json({
        ok:true,
        data: orden
    })
}
const updateOrdenProduccion =  async (req , res ) => {
    const id = req.params.id;
    
    const fechaOrden = obtenerFechaHoy();
    const fechaElaboracionOrden = req.body.fechaElaboracion;
    const fechaEntregaOrden = req.body.fechaEntrega;
    const empleadoOrden = req.body.empleado;
    
    if ( !fechaElaboracionOrden || !fechaEntregaOrden || !empleadoOrden) {
        res.status(400).json({ok:false , message:'No se puede actualizar una orden de produccion sin todos los datos.'});
        return
    }
    
    const updatedOrden = await OrdenProduccion.findByIdAndUpdate(
            id, 
            {
                fecha: fechaOrden,
                fechaElaboracion: fechaElaboracionOrden,
                fechaEntrega: fechaEntregaOrden,
                empleado: empleadoOrden
            },
            { new: true , runValidators: true }
        )
        
    if(!updatedOrden) {
        res.status(400).json({
            ok:false,
            message:"Error al actualizar orden de produccion."
        });
        return
    }
    res.status(200).json({
        ok:true , 
        data: updatedOrden,
        message:"Orden de produccion actualizada correctamente."
    })    
}

const deleteOrdenProduccion = async (req , res) => {
    const id = req.params.id;
    const deletedOrden = await OrdenProduccion.findByIdAndUpdate(
            id, 
            {
                estado:false
            },
            { new: true , runValidators: true }
        )
    if(!deletedOrden) {
        res.status(400).json({ok:false,message:"Error al eliminar orden de produccion."});
        return
    }
    const deletedOrdenDetalle = await OrdenProduccionDetalle.deleteMany({ordenProduccion:id});
    if(!deletedOrdenDetalle){
        res.status(400).json({
            ok:false,
            message: 'Error durante el borrado de los detalles de la orden de produccion.'
        })
        return
    }
    res.status(200).json({ok:true , message:"Orden de produccion eliminada correctamente."});
}

module.exports = {setOrdenProduccion , getOrdenProduccion , getOrdenProduccionID , updateOrdenProduccion , deleteOrdenProduccion};
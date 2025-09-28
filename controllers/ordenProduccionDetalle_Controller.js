const OrdenProduccionDetalle = require("../models/ordenProduccionDetalle_Model");
const getNextSequence = require("../controllers/counter_Controller");

const setOrdenProduccionDetalle = async (req,res) => {
    const newId = await getNextSequence("OrdenProduccionDetalle");
    const picadaOrden = req.body.picada;
    const cantidadOrden = req.body.cantidad;
    const ordenProduccion = req.body.ordenProduccion;

    if( !picadaOrden || !cantidadOrden || !ordenProduccion ){
        res.status(400).json({ok:false , message:'Error al cargar los datos.'})
        return
    }
    const newOrdenDetalle = new OrdenProduccionDetalle ({
        _id: newId,
        picada: picadaOrden,
        cantidad: cantidadOrden,
        ordenProduccion : ordenProduccion
    });
    await newOrdenDetalle.save()
        .then( () => {
            res.status(201).json({ok:true, message:'Detalle de orden de produccion agregado correctamente.'})
        })
        .catch((err)=>{console.log(err)});

}

const getOrdenDetalle = async(req, res) => {
    const detallesOrden = await OrdenProduccionDetalle.find();

    res.status(200).json({
        ok:true,
        data: detallesOrden,
    })
}

const getOrdenDetalleID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const ordenDetalle = await OrdenProduccionDetalle.findById(id);
    if(!ordenDetalle){
        res.status(400).json({
            ok:false,
            message:'El id no corresponde al detalle de una orden de produccion.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:ordenDetalle,
    })
}

const getOrdenDetalle_ByOrden = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const ordenDetalle = await OrdenProduccionDetalle.find({ordenProduccion:id});
    if(!ordenDetalle || ordenDetalle.length === 0){
        res.status(400).json({
            ok:false,
            message:'El id no corresponde a los detalles de una orden de produccion.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:ordenDetalle,
    })
}

const updateOrdenDetalle = async(req,res) => {
    const id = req.params.id;
    
    const cantidadP = req.body.cantidad;
    const ordenProduccion = req.body.ordenProduccion;
    const picadaID = req.body.picada;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.',
        })
        return
    }

    const updatedOrdenDetalle = await OrdenProduccionDetalle.findByIdAndUpdate(
        id,
        {   
            ordenProduccion: ordenProduccion , cantidad: cantidadP , picada: picadaID
        },
        { new: true , runValidators: true }
    )

    if(!updatedOrdenDetalle){
        res.status(400).json({
            ok:false,
            message:'Error al actualizar el detalle de la orden de produccion.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:updatedOrdenDetalle,
        message:'Detalle de orden de produccion actualizado correctamente.',
    })
}



const deleteOrdenDetalle = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.'
        })
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
    res.status(200).json({
        ok:true,
        message:'Detalle de orden de produccion eliminado correctamente.'
    })
}

module.exports = { setOrdenProduccionDetalle , getOrdenDetalle , getOrdenDetalleID, getOrdenDetalle_ByOrden , updateOrdenDetalle , deleteOrdenDetalle };
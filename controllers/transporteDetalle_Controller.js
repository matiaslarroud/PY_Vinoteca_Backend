const TransporteDetalle = require("../models/transporteDetalle_Model");

const setTransporteDetalle = async (req,res) => {
    const transporteID = req.body.transporteID;
    const paisP = req.body.pais;
    const provinciaP = req.body.provincia;
    const localidadP = req.body.localidad;

    if( !transporteID || !paisP || !provinciaP || !localidadP ) {
        res.status(400).json({ok:false , message:'Error al cargar los datos.'})
        return
    }
    const newTransporteDetalle = new TransporteDetalle ({
        transporteID: transporteID,
        pais: paisP,
        provincia: provinciaP,
        localidad: localidadP
    });
    await newTransporteDetalle.save()
        .then( () => {
            res.status(201).json({ok:true, message:'Transporte Detalle agregado correctamente.'})
        })
        .catch((err)=>{console.log(err)});

}

const getTransporteDetalle = async(req, res) => {
    const detallesTransporte = await TransporteDetalle.find();

    res.status(200).json({
        ok:true,
        data: detallesTransporte,
    })
}

const getTransporteDetalleID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const transporteDetalle = await TransporteDetalle.findById(id);
    if(!transporteDetalle){
        res.status(400).json({
            ok:false,
            message:'El id no corresponde al detalle de un transporte.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:transporteDetalle,
    })
}

const getTransporteDetalle_ByTransporte = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const transporteDetalle = await TransporteDetalle.find({picada:id});
    if(!transporteDetalle || transporteDetalle.length === 0){
        res.status(400).json({
            ok:false,
            message:'El id no corresponde a los detalles de un transporte.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:transporteDetalle,
    })
}

const updateTransporteDetalle = async(req,res) => {
    const id = req.params.id;
    
    const transporteID = req.body.transporteID;
    const paisP = req.body.pais; 
    const provinciaP = req.body.provincia;
    const localidadP = req.body.localidad;  

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.',
        })
        return
    }

    const updatedTransporteDetalle = await TransporteDetalle.findByIdAndUpdate(
        id,
        {   
            transporteID: transporteID,
            pais: paisP,
            provincia: provinciaP,
            localidad: localidadP
        },
        { new: true , runValidators: true }
    )

    if(!updatedTransporteDetalle){
        res.status(400).json({
            ok:false,
            message:'Error al actualizar el Transporte Detalle.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:updatedTransporteDetalle,
        message:'Transporte Detalle actualizado correctamente.',
    })
}



const deleteTransporteDetalle = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.'
        })
        return
    }

    const deletedTransporteDetalle = await TransporteDetalle.deleteMany({transporteID : id});
    if(!deletedTransporteDetalle){
        res.status(400).json({
            ok:false,
            message: 'Error durante el borrado de los detalles de transporte.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'Transporte Detalle eliminado correctamente.'
    })
}

module.exports = { setTransporteDetalle , getTransporteDetalle , getTransporteDetalleID, getTransporteDetalle_ByTransporte , updateTransporteDetalle , deleteTransporteDetalle };
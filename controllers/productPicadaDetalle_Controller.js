const PicadaDetalle = require("../models/productoPicadaDetalle_Model");

const setPicadaDetalle = async (req,res) => {
    const cantidadP = req.body.cantidad;
    const picadaP = req.body.picada;
    const insumoID = req.body.insumo;

    if( !picadaP || !insumoID || !cantidadP ){
        res.status(400).json({ok:false , message:'Error al cargar los datos.'})
        return
    }
    const newPicadaDetalle = new PicadaDetalle ({
        picada: picadaP , cantidad: cantidadP , insumo: insumoID
    });
    await newPicadaDetalle.save()
        .then( () => {
            res.status(201).json({ok:true, message:'Picada Detalle agregado correctamente.'})
        })
        .catch((err)=>{console.log(err)});

}

const getPicadaDetalle = async(req, res) => {
    const detallesPicada = await PicadaDetalle.find();

    res.status(200).json({
        ok:true,
        data: detallesPicada,
    })
}

const getPicadaDetalleID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const picadaDetalle = await PicadaDetalle.findById(id);
    if(!picadaDetalle){
        res.status(400).json({
            ok:false,
            message:'El id no corresponde al detalle de un picada.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:picadaDetalle,
    })
}

const getPicadaDetalle_ByPicada = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const picadaDetalle = await PicadaDetalle.find({picada:id});
    if(!picadaDetalle || picadaDetalle.length === 0){
        res.status(400).json({
            ok:false,
            message:'El id no corresponde a los detalles de una picada.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:picadaDetalle,
    })
}

const updatePicadaDetalle = async(req,res) => {
    const id = req.params.id;
    
    const cantidadP = req.body.cantidad;
    const picadaP = req.body.picada;
    const insumoID = req.body.insumo;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.',
        })
        return
    }

    const updatedPicadaDetalle = await PicadaDetalle.findByIdAndUpdate(
        id,
        {   
            picada: picadaP , cantidad: cantidadP , insumo: insumoID
        },
        { new: true , runValidators: true }
    )

    if(!updatedPicadaDetalle){
        res.status(400).json({
            ok:false,
            message:'Error al actualizar el PicadaDetalle.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:updatedPicadaDetalle,
        message:'PicadaDetalle actualizado correctamente.',
    })
}



const deletePicadaDetalle = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.'
        })
        return
    }

    const deletedPicadaDetalle = await PicadaDetalle.deleteMany({picada:id});
    if(!deletedPicadaDetalle){
        res.status(400).json({
            ok:false,
            message: 'Error durante el borrado de los detalles de la picada.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'PicadaDetalle eliminado correctamente.'
    })
}

module.exports = { setPicadaDetalle , getPicadaDetalle , getPicadaDetalleID, getPicadaDetalle_ByPicada , updatePicadaDetalle , deletePicadaDetalle };
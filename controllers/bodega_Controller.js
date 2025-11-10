const Bodega = require('../models/bodega_Model.js');
const getNextSequence = require("../controllers/counter_Controller");

const setBodega = async (req , res ) => {
    const newId = await getNextSequence("Bodega");
    const nombreBodega = req.body.name;    
    const familiaBodega = req.body.familia;
    
    if (!nombreBodega || !familiaBodega) {
        res.status(400).json({ok:false , message:'No se puede cargar la bodega sin la carga de todos los datos.'});
        return
    }

    const newBodega = new Bodega({
        _id: newId,
        name: nombreBodega , 
        familia: familiaBodega ,
        estado:true
    });

    await newBodega.save()
        .then(() => {
            res.status(201).json({
                ok:true,
                message:"Bodega agregada correctamente."
            });
        })
        .catch((error) => { console.log(error) }) 
    
}

const getBodega = async(req,res) => {
    const bodegas = await Bodega.find({estado:true});
    if (!bodegas) {
        res.status(400).json({
            ok:false , 
            message:'Error al obtener datos de bodega.'
        });
        return
    }
    res.status(200).json({
        ok:true,
        message:"Bodegas encontradas exitosamente.",
        data:bodegas
    })
}

const getBodegaID = async(req,res) => {
    const bodegaID = req.params.id;
    if (!bodegaID) {
        res.status(400).json({
            ok:false , 
            message:'Error al obtener datos de bodega.'
        });
        return
    }

    const bodegaEncontrada = await Bodega.findById(bodegaID)

    if (!bodegaEncontrada) {
        res.status(400).json({
            ok:false , 
            message:'Error al obtener datos de bodega.'
        });
        return
    }
    res.status(200).json({
        ok:true,
        message:"Bodega encontrada exitosamente.",
        data:bodegaEncontrada
    })
}

const updateBodega = async(req,res) => {
    const bodegaID = req.params.id;
    if (!bodegaID) {
        res.status(400).json({
            ok:false , 
            message:'Error al obtener datos de bodega.'
        });
        return
    }
    const nombreBodega = req.body.name;
    const familiaBodega = req.body.familia;
    if (!bodegaID) {
        res.status(400).json({
            ok:false , 
            message:'Error al obtener datos de bodega.'
        });
        return
    }
    const updatedBodega = await Bodega.findByIdAndUpdate(
        bodegaID,
        {
            name: nombreBodega,
            familia: familiaBodega
        },
        { new: true , runValidators: true }
    )
    if (!updatedBodega) {
        res.status(400).json({
            ok:false , 
            message:'Error al actualizar bodega.'
        });
        return
    }
    res.status(200).json({
        ok:true,
        message:"Bodega actualizada correctamente."
    })
}

const deleteBodega = async(req,res) => {
    const bodegaID = req.params.id;
    if (!bodegaID) {
        res.status(400).json({
            ok:false , 
            message:'Error al obtener datos de bodega.'
        });
        return
    }
    const deletedBodega = await Bodega.findByIdAndUpdate(
        bodegaID,
        {
            estado:false
        },
        { new: true , runValidators: true }
    )
    if (!deletedBodega) {
        res.status(400).json({
            ok:false , 
            message:'Error al eliminar bodega.'
        });
        return
    }
    res.status(200).json({
        ok:true,
        message:"Bodega eliminada correctamente."
    })
}

module.exports = {setBodega , getBodega , getBodegaID , updateBodega , deleteBodega};
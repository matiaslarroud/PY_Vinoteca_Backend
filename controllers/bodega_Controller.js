const Bodega = require('../models/bodega_Model.js');
const getNextSequence = require("../controllers/counter_Controller");

const setBodega = async (req , res ) => {
    const nombreBodega = req.body.name;    
    const familiaBodega = req.body.familia;
    
    if (!nombreBodega || !familiaBodega) {
        res.status(400).json({ok:false , message:'❌ Faltan completar algunos campos obligatorios.'});
        return
    }

    const newId = await getNextSequence("Bodega");
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
                message:"✔️ Bodega agregada correctamente."
            });
        })
        .catch((err) => {
            res.status(400).json({
                ok:false,
                message:`❌  Error al agregar bodega. ERROR:\n${err}`
            })
        })
    
}

const getBodega = async(req,res) => {
    const bodegas = await Bodega.find({estado:true}).lean();
    res.status(200).json({
        ok:true,
        data:bodegas
    })
}

const getBodegaID = async(req,res) => {
    const bodegaID = req.params.id;
    if (!bodegaID) {
        res.status(400).json({
            ok:false , 
            message:'❌ Error al obtener datos de bodega.'
        });
        return
    }

    const bodegaEncontrada = await Bodega.findById(bodegaID)

    if (!bodegaEncontrada) {
        res.status(400).json({
            ok:false , 
            message:'❌ Error al obtener datos de bodega.'
        });
        return
    }
    res.status(200).json({
        ok:true,
        message:"✔️ Bodega obtenida correctamente.",
        data:bodegaEncontrada
    })
}

const updateBodega = async(req,res) => {
    const bodegaID = req.params.id;
    if (!bodegaID) {
        res.status(400).json({
            ok:false , 
            message:'❌ Error al validar id de la bodega.'
        });
        return
    }
    const nombreBodega = req.body.name;
    const familiaBodega = req.body.familia;
    if (!bodegaID) {
        res.status(400).json({
            ok:false , 
            message:'❌ Error al obtener datos de bodega.'
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
            message:'❌ Error al actualizar bodega.'
        });
        return
    }
    res.status(200).json({
        ok:true,
        message:"✔️ Bodega actualizada correctamente."
    })
}

//Validaciones de eliminacion
const Vino = require("../models/productoVino_Model");

const deleteBodega = async(req,res) => {
    const bodegaID = req.params.id;
    if (!bodegaID) {
        res.status(400).json({
            ok:false , 
            message:'❌ Error al obtener datos de bodega.'
        });
        return
    }

    const vino = await Vino.find({bodega: bodegaID , estado:true}).lean();
    if(vino.length !== 0){
        res.status(400).json({
            ok:false,
            message:"❌ Error al eliminar. Existen tablas relacionadas a esta bodega."
        })
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
            message:'❌ Error al eliminar bodega.'
        });
        return
    }
    res.status(200).json({
        ok:true,
        message:"✔️ Bodega eliminada correctamente."
    })
}

module.exports = {setBodega , getBodega , getBodegaID , updateBodega , deleteBodega};
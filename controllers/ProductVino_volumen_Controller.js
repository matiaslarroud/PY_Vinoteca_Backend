const Volumen = require("../models/volumenVino_Model");
const getNextSequence = require("../controllers/counter_Controller");

const setVolumen = async (req,res) => {
    const newId = await getNextSequence("Vino_Volumen");
    const name = req.body.name;

    if(!name){
        res.status(400).json({ok:false , message:'No se puede agregar sin el nombre.'})
        return
    }
    const newVolumen = new Volumen ({
        _id: newId,name: name , estado:true});
    await newVolumen.save()
        .then( () => {
            res.status(201).json({ok:true, message:'Volumen agregado correctamente.'})
        })
        .catch((err)=>{console.log(err)});

}

const getVolumen = async(req, res) => {
    const volumenes = await Volumen.find({estado:true});
    if(!volumenes){
        res.status(400).json({ok:false , message:'Error al obtener datos.'})
        return
    }
    res.status(200).json({
        ok:true,
        data: volumenes,
    })
}

const getVolumenID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const volumenEncontrado = await Volumen.findById(id);
    if(!volumenEncontrado){
        res.status(400).json({
            ok:false,
            message:'Error al obtener datos.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:volumenEncontrado,
    })
}

const updateVolumen = async(req,res) => {
    const id = req.params.id;
    const nombreV = req.body.name;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.',
        })
        return
    }

    const updatedVolumen = await Volumen.findByIdAndUpdate(
        id,
        {name:nombreV},
        { new: true , runValidators: true }
    )

    if(!updatedVolumen){
        res.status(400).json({
            ok:false,
            message:'Error al actualizar volumen.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:updatedVolumen,
        message:'Volumen actualizada correctamente.',
    })
}

const deleteVolumen = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.'
        })
        return
    }

    const deletedVolumen = await Volumen.findByIdAndUpdate(
        id,
        {estado:false},
        { new: true , runValidators: true }
    )

    if(!deletedVolumen){
        res.status(400).json({
            ok:false,
            message: 'Error durante el borrado.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'Volumen eliminado correctamente.'
    })
}

module.exports = { setVolumen , getVolumen , getVolumenID , updateVolumen , deleteVolumen };
const Uva = require("../models/tipoUva_Model");
const getNextSequence = require("../controllers/counter_Controller");

const setUva = async (req,res) => {
    const newId = await getNextSequence("Vino_Uva");
    const name = req.body.name;

    if(!name){
        res.status(400).json({ok:false , message:'No se puede agregar sin los datos.'})
        return
    }
    const newUva = new Uva ({
        _id: newId,name: name , estado:true});
    await newUva.save()
        .then( () => {
            res.status(201).json({ok:true, message:'Uva agregada correctamente.'})
        })
        .catch((err)=>{console.log(err)});

}

const getUva = async(req, res) => {
    const uvas = await Uva.find({estado:true});
    if(!uvas){
        res.status(400).json({ok:false , message:'Error al obtener datos.'})
        return
    }
    res.status(200).json({
        ok:true,
        data: uvas,
    })
}

const getUvaID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const uvaEncontrada = await Uva.findById(id);
    if(!uvaEncontrada){
        res.status(400).json({
            ok:false,
            message:'Error al obtener datos.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:uvaEncontrada,
    })
}

const updateUva = async(req,res) => {
    const id = req.params.id;
    const nombreUva = req.body.name;
    if(!id || !nombreUva ){
        res.status(400).json({
            ok:false,
            message:'Error al actualizar uva.',
        })
        return
    }

    const updatedUva = await Uva.findByIdAndUpdate(
        id,
        {name:nombreUva},
        { new: true , runValidators: true }
    )

    if(!updatedUva){
        res.status(400).json({
            ok:false,
            message:'Error al actualizar uva.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'Uva actualizada correctamente.',
    })
}

const deleteUva = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.'
        })
        return
    }

    const deletedUva = await Uva.findByIdAndUpdate(
        id,
        {estado:false},
        { new: true , runValidators: true }
    )
    if(!deletedUva){
        res.status(400).json({
            ok:false,
            message: 'Error durante el borrado.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'Uva eliminada correctamente.'
    })
}

module.exports = { setUva , getUva , getUvaID , updateUva , deleteUva };
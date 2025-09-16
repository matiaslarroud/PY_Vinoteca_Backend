const Pais = require("../models/pais_Model.js");
const getNextSequence = require("../controllers/counter_Controller");

const setPais = async (req,res) => {
    const newId = await getNextSequence("Pais");
    const name = req.body.name;

    if(!name){
        res.status(400).json({ok:false , message:'No se puede cargar un pais sin el nombre.'})
        return
    }
    const newPais = new Pais ({
        _id: newId,name: name});
    await newPais.save()
        .then( () => {
            res.status(201).json({ok:true, message:'Pais agregado correctamente.'})
        })
        .catch((err)=>{console.log(err)});

}

const getPais = async(req, res) => {
    const paises = await Pais.find();

    res.status(200).json({
        ok:true,
        data: paises,
    })
}

const getPaisID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const pais = await Pais.findById(id);
    if(!pais){
        res.status(400).json({
            ok:false,
            message:'El id no corresponde a un pais.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:pais,
    })
}

const updatePais = async(req,res) => {
    const id = req.params.id;
    const {name} = req.body;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.',
        })
        return
    }

    const updatedPais = await Pais.findByIdAndUpdate(
        id,
        {name},
        { new: true , runValidators: true }
    )

    if(!updatedPais){
        res.status(400).json({
            ok:false,
            message:'Error al actualizar el pais.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:updatedPais,
        message:'Pais actualizado correctamente.',
    })
}

const deletePais = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.'
        })
        return
    }

    const deletedPais = await Pais.findByIdAndDelete(id);
    if(!deletedPais){
        res.status(400).json({
            ok:false,
            message: 'Error durante el borrado del pais.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'Pais eliminado correctamente.'
    })
}

module.exports = { setPais , getPais , getPaisID , updatePais , deletePais };
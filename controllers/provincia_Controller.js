const Provincia = require("../models/provincia_Model.js");
const Pais = require("../models/pais_Model.js");

const setProvincia = async(req,res) => {
    const nombreProvincia = req.body.name;
    const pais = req.body.pais;

    if(!nombreProvincia){
        res.status(400).json({
            ok:false,
            message:"No se puede cargar una provincia sin su nombre"
        })
        return
    }

    if(!pais){
        res.status(400).json({
            ok:false,
            message:"No se puede cargar una provincia sin el pais al que pertenece"
        })
        return
    }

    const verifyPais = await Pais.findById(pais)
    if(!verifyPais){
        res.status(400).json({
            ok:false,
            message:"No se pudo verificar correctamente el pais."
        })
        return
    }

    const newProvincia = new Provincia({name: nombreProvincia , pais: pais});
    await newProvincia.save()
        .then(() => {
            res.status(201).json({
                ok:true,
                message:"Provincia cargada correctamente."
            })
        })
        .catch((err) => {
            console.log(err);
        })
}

const getProvincia = async(req,res) => {
    const provincias = await Provincia.find();
    
    res.status(200).json({
        ok:true,
        data: provincias,
        message:"Provincia cargada correctamente."
    })
}

const getProvinciaID = async(req,res) => {
    const id = req.params.id ;

    if(!id){
        res.status(400).json({
            ok:false,
            message:"El id no llego al controlador correctamente"
        })
        return
    }

    const provincia = await Provincia.findById(id);

    if(!provincia){
        res.status(400).json({
            ok:false,
            message:"El id no corresponde a una provincia."
        })
        return
    }

    res.status(200).json({
        ok:true,
        data: provincia,
        message:"Provincia encontrada correctamente."
    })
}

const updateProvincia = async(req,res) => {
    const id = req.params.id;
    const name = req.body.name;
    const pais = req.body.pais;

    if(!id){
        res.status(400).json({
            ok:false,
            message:"El id no llego al controlador correctamente."
        })
        return
    }

    if(!name){
        res.status(400).json({
            ok:false,
            message:"El nombre de la provincia no llego al controlador correctamente."
        })
        return
    }

    const verifyPais = await Pais.findById(pais)
    if(!verifyPais){
        res.status(400).json({
            ok:false,
            message:"No se pudo verificar correctamente el pais."
        })
        return
    }

    const updatedProvincia = await Provincia.findByIdAndUpdate(
        id,
        {
            name,
            pais
        },
        { new: true , runValidators: true }
    )

    if(!updateProvincia){
        res.status(400).json({
            ok:false,
            message:'Error al actualizar la provincia.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        message: "Provincia actualizada correctamente."
    })
}

const deleteProvincia = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:"El id no llego al controlador correctamente."
        })
        return
    }
    const deletedProvincia = await Provincia.findByIdAndDelete(id);
    
    if(!deletedProvincia){
        res.status(400).json({
            ok:false,
            message:"No se pudo borrar la provincia correctamente."
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:"Provincia eliminada correctamente."
    })
}

module.exports = {setProvincia,getProvincia,getProvinciaID,updateProvincia,deleteProvincia};
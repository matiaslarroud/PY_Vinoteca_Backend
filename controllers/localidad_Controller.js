const Localidad = require("../models/localidad_Model.js");
const getNextSequence = require("../controllers/counter_Controller");

const setLocalidad = async(req,res) => {
    const newId = await getNextSequence("Localidad");
    const nombreLocalidad = req.body.name;
    const provinciaID = req.body.provincia;

    if(!nombreLocalidad || !provinciaID){
        res.status(400).json({
            ok:false,
            message: "No se puede registrar una localidad sin todos los campos."
        })
        return
    }
    const newLocalidad = await new Localidad({
        _id: newId,name:nombreLocalidad, provincia:provinciaID});
    
    if(!newLocalidad){
        res.status(400).json({
            ok:false,
            message: "Error al agregar la nueva localidad."
        })
        return
    }
    await newLocalidad.save()
        .then(()=>{
            res.status(201).json({
                ok:true,
                message:"Localidad agregar correctamente."
            })
        })
        .catch((err)=>{
             res.status(400).json({
                ok:false,
                message: "Error al agregar la nueva localidad."
            })
            console.log(err);
        })    
}

const getLocalidad = async(req,res) => {
    const localidades = await Localidad.find();
    if(!localidades){
        res.status(400).json({
            ok:false,
            message: "Error al buscar las localidades.",
        })
        return
    }
    res.status(200).json({
        ok:true,
        data: localidades,
        message:"Localidades encontradas correctamente."
    })
}

const getLocalidadID = async(req,res) => {
    const localidadID = req.params.id;
    
    if(!localidadID){
        res.status(400).json({
            ok:false,
            message: "Error al validar id de la localidad.",
        })
        return
    }
    const localidad = await Localidad.findById(localidadID);
    if(!localidad){
        res.status(400).json({
            ok:false,
            message: "Error al buscar la localidad.",
        })
        return
    }
    res.status(200).json({
        ok:true,
        data: localidad,
        message:"Localidad encontrada correctamente."
    })
}

const updateLocalidad = async(req,res) => {
    const localidadID = req.params.id;
    if(!localidadID){
        res.status(400).json({
            ok:false,
            message: "Error al validar id de la localidad.",
        })
        return
    }
    const name = req.body.name;
    const provincia = req.body.provincia;
    if(!name){
        res.status(400).json({
            ok:false,
            message: "Error al validar nombre cargado de la localidad.",
        })
        return
    }
    if(!provincia){
        res.status(400).json({
            ok:false,
            message: "Error al validar provincia cargada de la localidad.",
        })
        return
    }
    const updatedlocalidad = await Localidad.findByIdAndUpdate(
        localidadID,
        {name,provincia},
        { new: true , runValidators: true }
    );
    if(!updatedlocalidad){
        res.status(400).json({
            ok:false,
            message: "Error al actualizar la localidad.",
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:"Localidad actualizada correctamente."
    }) 
}

const deleteLocalidad = async(req,res) => {
    const localidadID = req.params.id;
    if(!localidadID){
        res.status(400).json({
            ok:false,
            message: "Error al validar id de la localidad.",
        })
        return
    }
    const deletedLocalidad = await Localidad.findByIdAndDelete(localidadID);
    
    if(!deletedLocalidad){
        res.status(400).json({
            ok:false,
            message: "Error al eliminar la localidad.",
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:"Localidad eliminada correctamente."
    }) 
}

module.exports = {setLocalidad, getLocalidad , getLocalidadID , updateLocalidad , deleteLocalidad};
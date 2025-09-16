const Barrio = require("../models/barrio_Model.js");
const Localidad = require("../models/localidad_Model.js")
const getNextSequence = require("../controllers/counter_Controller");


const setBarrio = async(req,res) => {
    const newId = await getNextSequence("Barrio");
    const nombreBarrio = req.body.name;
    const localidadBarrio = req.body.localidad;
    if(!nombreBarrio || !localidadBarrio){
        res.status(400).json({
            ok:false,
            message:"No puede agregarse un barrio sin todos los datos."
        })
        return
    }
    const newBarrio = await new Barrio({
        _id: newId,name:nombreBarrio,localidad:localidadBarrio});
    if(!newBarrio){
        res.status(400).json({
            ok:false,
            message:"Error al agregar nuevo barrio."
        })
        return
    }
    await newBarrio.save()
        .then(()=>{
            res.status(201).json({
                ok:true,
                message:"Barrio agregado correctamente."
            })
        })
        .catch((err)=>{
            res.status(400).json({
                ok:true,
                message:"Error al agregar barrio."
            })
            console.log(err)
            return
        })    
}

const getBarrio = async(req,res) => {
    const barrios = await Barrio.find();
    if(!barrios){
        res.status(400).json({
            ok:false,
            message:"Error al obtener barrios."
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:barrios,
        message:"Barrios encontrados correctamente."
    })
}

const getBarrioID = async(req,res) => {
    const barrioID = req.params.id;
    if(!barrioID){
        res.status(400).json({
            ok:false,
            message:"Error al buscar barrio solicitado."
        })
        return
    }
    const barrioEncontrado = await Barrio.findById(barrioID);
    if(!barrioEncontrado){
        res.status(400).json({
            ok:false,
            message:"Error al buscar barrio solicitado."
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:barrioEncontrado,
        message:"Barrio encontrado correctamente."
    })
}

const updateBarrio = async(req,res) => {
    const barrioID = req.params.id;
    const nombreBarrio = req.body.name;
    const localidadBarrio = req.body.localidad;
    if(!barrioID || !nombreBarrio){
        res.status(400).json({
            ok:false,
            message:"Error al actualizar barrio."
        })
        return
    }

    const verifyLocalidad = await Localidad.findById(localidadBarrio)
    if(!verifyLocalidad){
        res.status(400).json({
            ok:false,
            message:"No se pudo verificar correctamente la localidad."
        })
        return
    }

    const updatedBarrio = await Barrio.findByIdAndUpdate(
        barrioID,
        {name:nombreBarrio,localidad:localidadBarrio},
        { new: true , runValidators: true }
    )
    if(!updatedBarrio){
        res.status(400).json({
            ok:false,
            message:"Error al actualizar barrio."
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:"Barrio actualizado correctamente."
    })
}

const deleteBarrio = async(req,res) => {
    const barrioID = req.params.id;
    if(!barrioID){
        res.status(400).json({
            ok:false,
            message:"Error validar ID del barrio a eliminar."
        })
        return
    }
    const deletedBarrio = await Barrio.findByIdAndDelete(barrioID);
    if(!deletedBarrio){
        res.status(400).json({
            ok:false,
            message:"Error eliminar barrio."
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:"Barrio eliminado correctamente."
    })
}

module.exports = {setBarrio,getBarrio,getBarrioID,updateBarrio,deleteBarrio};
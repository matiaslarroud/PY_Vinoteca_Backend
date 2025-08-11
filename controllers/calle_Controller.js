const Calle = require("../models/calle_Model.js");

const setCalle = async(req,res) => {
    const nombreCalle = req.body.name;
    const barrioID = req.body.barrio;

    if(!nombreCalle){
        res.status(400).json({
            ok:false,
            message:"Error al intentar agregar nueva calle."
        })
        return
    }
    
    const newCalle = new Calle({name: nombreCalle , barrio:barrioID})
    await newCalle.save()
        .then(()=>{
            res.status(201).json({
                ok:true,
                message:"Calle agregada correctamente."
            })
        })
        .catch((err)=>{
            console.log(err);
            res.status(400).json({
                ok:false,
                message:"Error al agregar nueva calle."
            })
            return
        })
}

const getCalle = async(req,res) => {
    const calles = await Calle.find();
    if(!calles){
        res.status(400).json({
            ok:false,
            message:"Error al obtener calles."
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:"Calles obtenidas con exito.",
        data: calles
    })
}

const getCalleID = async(req,res) => {
    const calleID = req.params.id;

    if(!calleID){
        res.status(400).json({
            ok:false,
            message:"Error al obtener calle."
        })
        return
    }

    const calleEncontrada = await Calle.findById(calleID);
    
    if(!calleEncontrada){
        res.status(400).json({
            ok:false,
            message:"Error al obtener calle."
        })
        return
    }

    res.status(200).json({
        ok:true,
        message:"Calle encontrada correctamente.",
        data: calleEncontrada
    })
}

const updateCalle = async(req,res) => {
    const calleID = req.params.id;
    const nombreCalle = req.body.name;
    const nombreBarrio = req.body.barrio;

    if(!calleID || !nombreCalle || !nombreBarrio){
        res.status(400).json({
            ok:false,
            message:"Error al actualizar calle."
        })
        return
    }

    const updatedCalle = await Calle.findByIdAndUpdate(
        calleID,
        {name:nombreCalle, barrio:nombreBarrio},
        { new: true , runValidators: true }
    )

    if(!updatedCalle){
        res.status(400).json({
            ok:false,
            message:"Error al actualizar calle."
        })
        return
    }

    res.status(200).json({
        ok:true,
        message:"Calle actualizada correctamente."
    })
}

const deleteCalle = async(req,res) => {
    const calleID = req.params.id;

    if(!calleID){
        res.status(400).json({
            ok:false,
            message:"Error al eliminar calle."
        })
        return
    }

    const deletedCalle = await Calle.findByIdAndDelete(calleID);

    if(!deletedCalle){
        res.status(400).json({
            ok:false,
            message:"Error al eliminar calle."
        })
        return
    }

    res.status(200).json({
        ok:true,
        message:"Calle eliminada correctamente."
    })
}

module.exports = {setCalle,getCalle,getCalleID,updateCalle,deleteCalle};
const TipoComprobante = require("../models/tipoComprobante");

const setTipoComprobante = async(req,res) => {
    const nombreTipoComprobante = req.body.name;
    const condicionIvaID = req.body.condicionIva;

    if(!nombreTipoComprobante || !condicionIvaID){
        res.status(400).json({
            ok:false,
            message: "No se puede registrar un tipo de comprobante sin nombre o condicion de iva.",
        })
        return
    }
    const newTipoComprobante = await new TipoComprobante({name:nombreTipoComprobante, condicionIva:condicionIvaID});
    
    if(!newTipoComprobante){
        res.status(400).json({
            ok:false,
            message: "Error al agregar el nuevo tipo de comprobante.",
        })
        return
    }
    await newTipoComprobante.save()
        .then(()=>{
            res.status(201).json({
                ok:true,
                message:"Tipo de comprobante agregado correctamente.",
            })
        })
        .catch((err)=>{
             res.status(400).json({
                ok:false,
                message: "Error al agregar la nueva tipo de comprobante."
            })
            console.log(err);
        })    
}

const getTipoComprobante = async(req,res) => {
    const tiposComprobante = await TipoComprobante.find();
    if(!tiposComprobante){
        res.status(400).json({
            ok:false,
            message: "Error al buscar los tipos de comprobantes.",
        })
        return
    }
    res.status(200).json({
        ok:true,
        data: tiposComprobante,
        message:"Tipos de comprobantes encontrados correctamente."
    })
}

const getTipoComprobanteID = async(req,res) => {
    const tipoComprobanteID = req.params.id;
    
    if(!tipoComprobanteID){
        res.status(400).json({
            ok:false,
            message: "Error al validar id del tipo de comprobante.",
        })
        return
    }
    const tipoComprobante = await TipoComprobante.findById(tipoComprobanteID);
    if(!tipoComprobante){
        res.status(400).json({
            ok:false,
            message: "Error al buscar el tipo de comprobante.",
        })
        return
    }
    res.status(200).json({
        ok:true,
        data: tipoComprobante,
        message:"Tipo de comprobante encontrado correctamente."
    })
}

const updateTipoComprobante = async(req,res) => {
    const tipoComprobanteID = req.params.id;
    if(!tipoComprobanteID){
        res.status(400).json({
            ok:false,
            message: "Error al validar id del tipo de comprobante.",
        })
        return
    }
    const name = req.body.name;
    const condicionIva = req.body.condicionIva;
    if(!name){
        res.status(400).json({
            ok:false,
            message: "Error al validar nombre cargado del tipo de comprobante.",
        })
        return
    }
    if(!condicionIva){
        res.status(400).json({
            ok:false,
            message: "Error al validar condicion de iva cargado del tipo de comprobante.",
        })
        return
    }
    const updatedTipoComprobante = await TipoComprobante.findByIdAndUpdate(
        tipoComprobanteID,
        {name,condicionIva},
        { new: true , runValidators: true }
    );
    if(!updatedTipoComprobante){
        res.status(400).json({
            ok:false,
            message: "Error al actualizar el tipo de comprobante.",
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:"Tipo de comprobante actualizado correctamente."
    }) 
}

const deleteTipoComprobante = async(req,res) => {
    const tipoComprobanteID = req.params.id;
    if(!tipoComprobanteID){
        res.status(400).json({
            ok:false,
            message: "Error al validar id del tipo de comprobante.",
        })
        return
    }
    const deletedTipoComprobante = await TipoComprobante.findByIdAndDelete(tipoComprobanteID);
    
    if(!deletedTipoComprobante){
        res.status(400).json({
            ok:false,
            message: "Error al eliminar tipo de comprobante.",
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:"Tipo de comprobante eliminado correctamente."
    }) 
}

module.exports = {setTipoComprobante, getTipoComprobante , getTipoComprobanteID , updateTipoComprobante , deleteTipoComprobante};
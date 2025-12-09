const TipoComprobante = require("../models/tipoComprobante");
const getNextSequence = require("../controllers/counter_Controller");

const setTipoComprobante = async(req,res) => {
    const nombreTipoComprobante = req.body.name;
    const condicionIvaID = req.body.condicionIva;

    if(!nombreTipoComprobante || !condicionIvaID){
        res.status(400).json({
            ok:false,
            message: "❌ Faltan completar algunos campos obligatorios."
        })
        return
    }
    const newId = await getNextSequence("TipoComprobante");
    const newTipoComprobante = await new TipoComprobante({
        _id: newId,name:nombreTipoComprobante, condicionIva:condicionIvaID , estado:true});
    
    if(!newTipoComprobante){
        res.status(400).json({
            ok:false,
            message: "❌ Error al agregar el nuevo tipo de comprobante.",
        })
        return
    }
    await newTipoComprobante.save()
        .then(()=>{
            res.status(201).json({
                ok:true,
                message:"✔️ Tipo de comprobante agregado correctamente.",
            })
        })
        .catch((err) => {
            res.status(400).json({
                ok:false,
                message:`❌  Error al agregar tipo de comprobante. ERROR:\n${err}`
            })
        })  
}

const getTipoComprobante = async(req,res) => {
    const tiposComprobante = await TipoComprobante.find({estado:true}).lean();
    
    res.status(200).json({
        ok:true,
        data: tiposComprobante
    })
}

const getTipoComprobanteID = async(req,res) => {
    const tipoComprobanteID = req.params.id;
    
    if(!tipoComprobanteID){
        res.status(400).json({
            ok:false,
            message: "❌ Error al validar id del tipo de comprobante.",
        })
        return
    }
    const tipoComprobante = await TipoComprobante.findById(tipoComprobanteID);
    if(!tipoComprobante){
        res.status(400).json({
            ok:false,
            message: "❌ Error al buscar el tipo de comprobante.",
        })
        return
    }
    res.status(200).json({
        ok:true,
        data: tipoComprobante,
        message:"✔️ Tipo de comprobante obtenido correctamente."
    })
}

const updateTipoComprobante = async(req,res) => {
    const tipoComprobanteID = req.params.id;
    if(!tipoComprobanteID){
        res.status(400).json({
            ok:false,
            message: "❌ Error al validar id del tipo de comprobante.",
        })
        return
    }
    const name = req.body.name;
    const condicionIva = req.body.condicionIva;
    if(!name || !condicionIva){
        res.status(400).json({
            ok:false,
            message: "❌ Faltan completar algunos campos obligatorios."
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
            message: "❌ Error al actualizar el tipo de comprobante.",
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:"✔️ Tipo de comprobante actualizado correctamente."
    }) 
}


//Validaciones de eliminacion
const Cliente_ComprobanteVenta = require("../models/clienteComprobanteVenta_Model.js");

const deleteTipoComprobante = async(req,res) => {
    const tipoComprobanteID = req.params.id;
    if(!tipoComprobanteID){
        res.status(400).json({
            ok:false,
            message: "❌ Error al validar id del tipo de comprobante.",
        })
        return
    }

    const clienteComprobante = await Cliente_ComprobanteVenta.find({tipoComprobante:tipoComprobanteID , estado:true}).lean();
    
    if(clienteComprobante.length !== 0 ){
        res.status(400).json({
            ok:false,
            message:"❌ Error al eliminar. Existen tablas relacionadas a este tipo de comprobante."
        })
        return
    }
    const deletedTipoComprobante = await TipoComprobante.findByIdAndUpdate(
        tipoComprobanteID,
        {estado:false},
        { new: true , runValidators: true }
    );
    
    if(!deletedTipoComprobante){
        res.status(400).json({
            ok:false,
            message: "❌ Error al eliminar tipo de comprobante.",
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:"✔️ Tipo de comprobante eliminado correctamente."
    }) 
}

module.exports = {setTipoComprobante, getTipoComprobante , getTipoComprobanteID , updateTipoComprobante , deleteTipoComprobante};
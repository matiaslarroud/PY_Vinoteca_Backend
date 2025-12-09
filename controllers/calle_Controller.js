const Calle = require("../models/calle_Model.js");
const getNextSequence = require("../controllers/counter_Controller");

const setCalle = async(req,res) => {
    const nombreCalle = req.body.name;
    const barrioID = req.body.barrio;

    if(!nombreCalle || !barrioID){
        res.status(400).json({
            ok:false,
            message:"❌ Faltan completar algunos campos obligatorios."
        })
        return
    }
    
    const newId = await getNextSequence("Calle");
    const newCalle = new Calle({
        _id: newId,name: nombreCalle , barrio:barrioID , estado:true})
    await newCalle.save()
        .then(()=>{
            res.status(201).json({
                ok:true,
                message:"✔️ Calle agregada correctamente."
            })
        })
        .catch((err) => {
            res.status(400).json({
                ok:false,
                message:`❌  Error al agregar calle. ERROR:\n${err}`
            })
        })
}

const getCalle = async(req,res) => {
    const calles = await Calle.find({estado:true}).lean();
    res.status(200).json({
        ok:true,
        data: calles
    })
}

const getCalleID = async(req,res) => {
    const calleID = req.params.id;

    if(!calleID){
        res.status(400).json({
            ok:false,
            message:"❌ Error al obtener calle."
        })
        return
    }

    const calleEncontrada = await Calle.findById(calleID);
    
    if(!calleEncontrada){
        res.status(400).json({
            ok:false,
            message:"❌ Error al obtener calle."
        })
        return
    }

    res.status(200).json({
        ok:true,
        message:"✔️ Calle encontrada correctamente.",
        data: calleEncontrada
    })
}

const updateCalle = async(req,res) => {
    const calleID = req.params.id;
    const nombreCalle = req.body.name;
    const nombreBarrio = req.body.barrio;
    if(!calleID){
        res.status(400).json({
            ok:false,
            message: "❌ Error al validar id de la calle.",
        })
        return
    }

    if(!nombreCalle || !nombreBarrio){
        res.status(400).json({
            ok:false,
            message:"❌ Faltan completar algunos campos obligatorios."
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
            message:"❌ Error al actualizar calle."
        })
        return
    }

    res.status(200).json({
        ok:true,
        message:"✔️ Calle actualizada correctamente."
    })
}


//Validaciones de eliminacion
const Cliente = require("../models/cliente_Model.js");
const Proveedor = require("../models/proveedor_Model.js");
const Paraje = require("../models/bodega-paraje_Model.js");
const NotaPedido = require("../models/clienteNotaPedido_Model.js");

const deleteCalle = async(req,res) => {
    const calleID = req.params.id;

    if(!calleID){
        res.status(400).json({
            ok:false,
            message:"❌ Error al eliminar calle."
        })
        return
    }

    const cliente = await Cliente.find({calle:calleID , estado:true}).lean();
    const proveedor = await Proveedor.find({calle:calleID , estado:true}).lean();
    const paraje = await Paraje.find({calle:calleID , estado:true}).lean();
    const pedido = await NotaPedido.find({calle:calleID , estado:true}).lean();
    
    if(cliente.length !== 0 || proveedor.length !== 0 || paraje.length !== 0 || pedido.length !== 0){
        res.status(400).json({
            ok:false,
            message:"❌ Error al eliminar. Existen tablas relacionadas a esta calle."
        })
        return
    }

    const deletedCalle = await Calle.findByIdAndUpdate(
        calleID,
        {estado:false},
        { new: true , runValidators: true }
    )

    if(!deletedCalle){
        res.status(400).json({
            ok:false,
            message:"❌ Error al eliminar calle."
        })
        return
    }

    res.status(200).json({
        ok:true,
        message:"✔️ Calle eliminada correctamente."
    })
}

module.exports = {setCalle,getCalle,getCalleID,updateCalle,deleteCalle};
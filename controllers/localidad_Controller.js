const Localidad = require("../models/localidad_Model.js");
const getNextSequence = require("../controllers/counter_Controller");

const setLocalidad = async(req,res) => {
    const nombreLocalidad = req.body.name;
    const provinciaID = req.body.provincia;

    if(!nombreLocalidad || !provinciaID){
        res.status(400).json({
            ok:false,
            message: "❌ Faltan completar algunos campos obligatorios."
        })
        return
    }
    const newId = await getNextSequence("Localidad");
    const newLocalidad = await new Localidad({
        _id: newId,name:nombreLocalidad, provincia:provinciaID , estado:true});
    
    if(!newLocalidad){
        res.status(400).json({
            ok:false,
            message: "❌ Error al agregar la nueva localidad."
        })
        return
    }
    await newLocalidad.save()
        .then(()=>{
            res.status(201).json({
                ok:true,
                message:"✔️ Localidad agregada correctamente."
            })
        })
        .catch((err) => {
            res.status(400).json({
                ok:false,
                message:`❌  Error al agregar localidad. ERROR:\n${err}`
            })
        })
}

const getLocalidad = async(req,res) => {
    const localidades = await Localidad.find({estado:true}).lean();
    res.status(200).json({
        ok:true,
        data: localidades
    })
}

const getLocalidadID = async(req,res) => {
    const localidadID = req.params.id;
    
    if(!localidadID){
        res.status(400).json({
            ok:false,
            message: "❌ Error al validar id de la localidad.",
        })
        return
    }
    const localidad = await Localidad.findById(localidadID);
    if(!localidad){
        res.status(400).json({
            ok:false,
            message: "❌ Error al buscar la localidad.",
        })
        return
    }
    res.status(200).json({
        ok:true,
        data: localidad,
        message:"✔️ Localidad encontrada correctamente."
    })
}

const updateLocalidad = async(req,res) => {
    const localidadID = req.params.id;
    if(!localidadID){
        res.status(400).json({
            ok:false,
            message: "❌ Error al validar id de la localidad.",
        })
        return
    }
    const name = req.body.name;
    const provincia = req.body.provincia;
    if(!name || !provincia){
        res.status(400).json({
            ok:false,
            message: "❌ Faltan completar algunos campos obligatorios."
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
            message: "❌ Error al actualizar la localidad.",
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:"✔️ Localidad actualizada correctamente."
    }) 
}

//Validaciones de eliminacion
const Cliente = require("../models/cliente_Model.js");
const Proveedor = require("../models/proveedor_Model.js");
const Paraje = require("../models/bodega-paraje_Model.js");
const NotaPedido = require("../models/clienteNotaPedido_Model.js");

const deleteLocalidad = async(req,res) => {
    const localidadID = req.params.id;
    if(!localidadID){
        res.status(400).json({
            ok:false,
            message: "❌ Error al validar id de la localidad.",
        })
        return
    }

    const cliente = await Cliente.find({localidad:localidadID , estado:true}).lean();
    const proveedor = await Proveedor.find({localidad:localidadID , estado:true}).lean();
    const paraje = await Paraje.find({localidad:localidadID , estado:true}).lean();
    const pedido = await NotaPedido.find({localidad:localidadID , estado:true}).lean();
    
    if(cliente.length !== 0 || proveedor.length !== 0 || paraje.length !== 0 || pedido.length !== 0){
        res.status(400).json({
            ok:false,
            message:"❌ Error al eliminar. Existen tablas relacionadas a esta localidad."
        })
        return
    }
    const deletedLocalidad = await Localidad.findByIdAndUpdate(
        localidadID,
        {estado:false},
        { new: true , runValidators: true }
    );
    
    if(!deletedLocalidad){
        res.status(400).json({
            ok:false,
            message: "❌ Error al eliminar la localidad.",
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:"✔️ Localidad eliminada correctamente."
    }) 
}

module.exports = {setLocalidad, getLocalidad , getLocalidadID , updateLocalidad , deleteLocalidad};
const Barrio = require("../models/barrio_Model.js");
const Localidad = require("../models/localidad_Model.js")
const getNextSequence = require("../controllers/counter_Controller");

const setBarrio = async(req,res) => {
    const nombreBarrio = req.body.name;
    const localidadBarrio = req.body.localidad;
    if(!nombreBarrio || !localidadBarrio){
        res.status(400).json({
            ok:false,
            message:"❌ Faltan completar algunos campos obligatorios."
        })
        return
    }
    const newId = await getNextSequence("Barrio");
    const newBarrio = await new Barrio({
        _id: newId,name:nombreBarrio,localidad:localidadBarrio , estado:true});
    if(!newBarrio){
        res.status(400).json({
            ok:false,
            message:"❌ Error al agregar nuevo barrio."
        })
        return
    }
    await newBarrio.save()
        .then(()=>{
            res.status(201).json({
                ok:true,
                message:"✔️ Barrio agregado correctamente."
            })
        })
        .catch((err) => {
            res.status(400).json({
                ok:false,
                message:`❌  Error al agregar barrio. ERROR:\n${err}`
            })
        }) 
}

const getBarrio = async(req,res) => {
    const barrios = await Barrio.find({estado:true}).lean();
    res.status(200).json({
        ok:true,
        data:barrios
    })
}

const getBarrioID = async(req,res) => {
    const barrioID = req.params.id;
    if(!barrioID){
        res.status(400).json({
            ok:false,
            message:"❌ Error al buscar barrio solicitado."
        })
        return
    }
    const barrioEncontrado = await Barrio.findById(barrioID);
    if(!barrioEncontrado){
        res.status(400).json({
            ok:false,
            message:"❌ Error al buscar barrio solicitado."
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:barrioEncontrado,
        message:"✔️ Barrio obtenido correctamente."
    })
}

const updateBarrio = async(req,res) => {
    const barrioID = req.params.id;
    const nombreBarrio = req.body.name;
    const localidadBarrio = req.body.localidad;
    if(!barrioID){
        res.status(400).json({
            ok:false,
            message: "❌ Error al validar id del barrio.",
        })
        return
    }

    if(!nombreBarrio || !localidadBarrio){
        res.status(400).json({
            ok:false,
            message: "❌ Faltan completar algunos campos obligatorios."
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
            message:"❌ Error al actualizar barrio."
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:"✔️ Barrio actualizado correctamente."
    })
}

//Validaciones de eliminacion
const Cliente = require("../models/cliente_Model.js");
const Proveedor = require("../models/proveedor_Model.js");
const Paraje = require("../models/bodega-paraje_Model.js");
const NotaPedido = require("../models/clienteNotaPedido_Model.js");

const deleteBarrio = async(req,res) => {
    const barrioID = req.params.id;
    if(!barrioID){
        res.status(400).json({
            ok:false,
            message:"❌ Error validar ID del barrio a eliminar."
        })
        return
    }

    const cliente = await Cliente.find({barrio:barrioID , estado:true}).lean();
    const proveedor = await Proveedor.find({barrio:barrioID , estado:true}).lean();
    const paraje = await Paraje.find({barrio:barrioID , estado:true}).lean();
    const pedido = await NotaPedido.find({barrio:barrioID , estado:true}).lean();
    
    if(cliente.length !== 0 || proveedor.length !== 0 || paraje.length !== 0 || pedido.length !== 0){
        res.status(400).json({
            ok:false,
            message:"❌ Error al eliminar. Existen tablas relacionadas a este barrio."
        })
        return
    }
    const deletedBarrio = await Barrio.findByIdAndUpdate(
        barrioID,
        {estado:false},
        { new: true , runValidators: true }
    )
    if(!deletedBarrio){
        res.status(400).json({
            ok:false,
            message:"❌ Error eliminar barrio."
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:"✔️ Barrio eliminado correctamente."
    })
}

module.exports = {setBarrio,getBarrio,getBarrioID,updateBarrio,deleteBarrio};
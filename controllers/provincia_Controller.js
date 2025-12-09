const Provincia = require("../models/provincia_Model.js");
const Pais = require("../models/pais_Model.js");
const getNextSequence = require("../controllers/counter_Controller");

const setProvincia = async(req,res) => {
    const nombreProvincia = req.body.name;
    const pais = req.body.pais;

    if(!nombreProvincia || !pais){
        res.status(400).json({
            ok:false,
            message:"❌ Faltan completar algunos campos obligatorios."
        })
        return
    }

    const newId = await getNextSequence("Provincia");
    const newProvincia = new Provincia({
        _id: newId ,name: nombreProvincia , pais: pais , estado: true});
    await newProvincia.save()
        .then(() => {
            res.status(201).json({
                ok:true,
                message:"✔️ Provincia cargada correctamente."
            })
        })
        .catch((err) => {
            res.status(400).json({
                ok:false,
                message:`❌  Error al agregar provincia. ERROR:\n${err}`
            })
        })
}

const getProvincia = async(req,res) => {
    const provincias = await Provincia.find({estado:true}).lean();

    res.status(200).json({
        ok:true,
        data: provincias
    })
}

const getProvinciaID = async(req,res) => {
    const id = req.params.id ;

    if(!id){
        res.status(400).json({
            ok:false,
            message:"❌ El id no llego al controlador correctamente"
        })
        return
    }

    const provincia = await Provincia.findById(id);

    if(!provincia){
        res.status(400).json({
            ok:false,
            message:"❌ El id no corresponde a una provincia."
        })
        return
    }

    res.status(200).json({
        ok:true,
        data: provincia,
        message:"✔️ Provincia obtenida correctamente."
    })
}

const updateProvincia = async(req,res) => {
    const id = req.params.id;
    const name = req.body.name;
    const pais = req.body.pais;

    if(!id){
        res.status(400).json({
            ok:false,
            message:"❌ El id no llego al controlador correctamente."
        })
        return
    }

    if(!name || !pais){
        res.status(400).json({
            ok:false,
            message:"❌ Faltan completar algunos campos obligatorios."
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

    if(!updatedProvincia){
        res.status(400).json({
            ok:false,
            message:'❌ Error al actualizar la provincia.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        message: "✔️ Provincia actualizada correctamente."
    })
}

//Validaciones de eliminacion
const Cliente = require("../models/cliente_Model.js");
const Proveedor = require("../models/proveedor_Model.js");
const Paraje = require("../models/bodega-paraje_Model.js");
const NotaPedido = require("../models/clienteNotaPedido_Model.js");

const deleteProvincia = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:"❌ El id no llego al controlador correctamente."
        })
        return
    }

    const cliente = await Cliente.find({provincia:id , estado:true}).lean();
    const proveedor = await Proveedor.find({provincia:id  , estado:true}).lean();
    const paraje = await Paraje.find({provincia:id  , estado:true}).lean();
    const pedido = await NotaPedido.find({provincia:id  , estado:true}).lean();
    
    if(cliente.length !== 0 || proveedor.length !== 0 || paraje.length !== 0 || pedido.length !== 0){
        res.status(400).json({
            ok:false,
            message:"❌ Error al eliminar. Existen tablas relacionadas a esta provincia."
        })
        return
    }

    
    const deletedProvincia = await Provincia.findByIdAndUpdate(
        id,
        {
            estado : false
        },
        { new: true , runValidators: true }
    )

    
    if(!deletedProvincia){
        res.status(400).json({
            ok:false,
            message:"❌ Error al eliminar provincia."
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:"✔️ Provincia eliminada correctamente."
    })
}

module.exports = {setProvincia,getProvincia,getProvinciaID,updateProvincia,deleteProvincia};
const Pais = require("../models/pais_Model.js");
const getNextSequence = require("../controllers/counter_Controller");

const setPais = async (req,res) => {
    const name = req.body.name;

    if(!name){
        res.status(400).json({
            ok:false , 
            message:"❌ Faltan completar algunos campos obligatorios."
        })
        return
    }
    const newId = await getNextSequence("Pais");
    const newPais = new Pais ({
        _id: newId,name: name , 
        estado:true
    });
    await newPais.save()
        .then( () => {
            res.status(201).json({
                ok:true, 
                message:'✔️ Pais agregado correctamente.'
            })
        })
        .catch((err) => {
            res.status(400).json({
                ok:false,
                message:`❌  Error al agregar pais. ERROR:\n${err}`
            })
        })

}

const getPais = async(req, res) => {
    const paises = await Pais.find({estado:true}).lean();
    res.status(200).json({
        ok:true,
        data: paises,
    })
}

const getPaisID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente',
        })
        return
    }

    const pais = await Pais.findById(id);
    if(!pais){
        res.status(400).json({
            ok:false,
            message:'❌ El id no corresponde a un pais.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        message:"✔️ Pais obtenido correctamente.",
        data:pais,
    })
}

const updatePais = async(req,res) => {
    const id = req.params.id;
    const {name} = req.body;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente.',
        })
        return
    }

    if(!name){
        res.status(400).json({
            ok:false , 
            message:"❌ Faltan completar algunos campos obligatorios."
        })
        return
    }

    const updatedPais = await Pais.findByIdAndUpdate(
        id,
        {name},
        { new: true , runValidators: true }
    )

    if(!updatedPais){
        res.status(400).json({
            ok:false,
            message:'❌ Error al actualizar el pais.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:updatedPais,
        message:'✔️ Pais actualizado correctamente.',
    })
}

//Validaciones de eliminacion
const Cliente = require("../models/cliente_Model.js");
const Proveedor = require("../models/proveedor_Model.js");
const Paraje = require("../models/bodega-paraje_Model.js");

const deletePais = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente.'
        })
        return
    }

    const cliente = await Cliente.find({pais:id , estado:true}).lean();
    const proveedor = await Proveedor.find({pais:id , estado:true}).lean();
    const paraje = await Paraje.find({pais:id , estado:true}).lean();
    
    if(cliente.length !== 0 || proveedor.length !== 0 || paraje.length !== 0 ){
        res.status(400).json({
            ok:false,
            message:"❌ Error al eliminar. Existen tablas relacionadas a este pais."
        })
        return
    }

    const deletedPais = await Pais.findByIdAndUpdate(
        id,
        {estado:false},
        { new: true , runValidators: true }
    )

    if(!deletedPais){
        res.status(400).json({
            ok:false,
            message: '❌ Error durante el borrado del pais.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'✔️ Pais eliminado correctamente.'
    })
}

module.exports = { setPais , getPais , getPaisID , updatePais , deletePais };
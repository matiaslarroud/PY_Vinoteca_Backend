const CondicionIva = require("../models/condicionIva_Model");
const getNextSequence = require("../controllers/counter_Controller");

const setCondicionIva = async (req,res) => {
    const name = req.body.name;

    if(!name){
        res.status(400).json({ok:false , message:"❌ Faltan completar algunos campos obligatorios."})
        return
    }
    const newId = await getNextSequence("CondicionIva ");
    const newCondicionIva = new CondicionIva ({
        _id: newId,name: name , estado:true});
    await newCondicionIva.save()
        .then( () => {
            res.status(201).json({ok:true, message:'✔️ Condicion de iva agregada correctamente.'})
        })
        .catch((err) => {
            res.status(400).json({
                ok:false,
                message:`❌  Error al agregar condicion de iva. ERROR:\n${err}`
            })
        })

}

const getCondicionIva = async(req, res) => {
    const condicionesIva = await CondicionIva.find({estado:true}).lean();
    res.status(200).json({
        ok:true,
        data: condicionesIva,
    })
}

const getCondicionIvaID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente',
        })
        return
    }

    const condicionIva = await CondicionIva.findById(id);
    if(!condicionIva){
        res.status(400).json({
            ok:false,
            message:"❌ Error al obtener condicion de iva."
        })
        return
    }

    res.status(200).json({
        ok:true,
        message:"✔️ Condicion de iva obtenida correctamente.",
        data:condicionIva,
    })
}

const updateCondicionIva = async(req,res) => {
    const id = req.params.id;
    const nombreC = req.body.name;

    if(!id){
        res.status(400).json({
            ok:false,
            message:"❌ Error al validar id de la calle.",
        })
        return
    }

    if(!nombreC){
        res.status(400).json({
            ok:false,
            message:"❌ Faltan completar algunos campos obligatorios."
        })
        return
    }

    const updatedCondicionIva = await CondicionIva.findByIdAndUpdate(
        id,
        {name:nombreC},
        { new: true , runValidators: true }
    )

    if(!updatedCondicionIva){
        res.status(400).json({
            ok:false,
            message:'❌ Error al actualizar el condicion de iva.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:updatedCondicionIva,
        message:'✔️ Condicion de iva actualizada correctamente.',
    })
}


//Validaciones de eliminacion
const Cliente = require("../models/cliente_Model.js");
const Proveedor = require("../models/proveedor_Model.js");
const Transporte = require("../models/transporte_Model.js");

const deleteCondicionIva = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente.'
        })
        return
    }

    const cliente = await Cliente.find({condicionIva:id , estado:true}).lean();
    const proveedor = await Proveedor.find({condicionIva:id , estado:true}).lean();
    const transporte = await Transporte.find({condicionIva:id , estado:true}).lean();
    
    if(cliente.length !== 0 || proveedor.length !== 0 || transporte.length !== 0 ){
        res.status(400).json({
            ok:false,
            message:"❌ Error al eliminar. Existen tablas relacionadas a esta calle."
        })
        return
    }

    const deletedCondicionIva = await CondicionIva.findByIdAndUpdate(
        id,
        {estado:false},
        { new: true , runValidators: true }
    )
    if(!deletedCondicionIva){
        res.status(400).json({
            ok:false,
            message: '❌ Error durante el borrado.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'✔️ Condicion de iva eliminada correctamente.'
    })
}

module.exports = { setCondicionIva , getCondicionIva , getCondicionIvaID , updateCondicionIva , deleteCondicionIva };
const MedioPago = require("../models/medioPago_Model");
const getNextSequence = require("../controllers/counter_Controller");

const setMedioPago = async (req,res) => {
    const name = req.body.name;
    const interes = req.body.interes;

    if(!name|| !interes){
        res.status(400).json({
            ok:false , 
            message:"❌ Faltan completar algunos campos obligatorios."
        })
        return
    }
    const newId = await getNextSequence("MedioPago");
    const newMedioPago = new MedioPago ({
        _id: newId,name: name , interes: interes , estado:true});
    await newMedioPago.save()
        .then( () => {
            res.status(201).json({
                ok:true, 
                message:'✔️ Medio de pago agregado correctamente.'
            })
        })
        .catch((err) => {
            res.status(400).json({
                ok:false,
                message:`❌  Error al agregar medio de pago. ERROR:\n${err}`
            })
        })

}

const getMedioPago = async(req, res) => {
    const mediosPago = await MedioPago.find({estado:true}).lean();
    res.status(200).json({
        ok:true,
        data: mediosPago,
    })
}

const getMedioPagoID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:"❌ Error al obtener medio de pago.",
        })
        return
    }

    const medioPago = await MedioPago.findById(id);
    if(!medioPago){
        res.status(400).json({
            ok:false,
            message:'❌  El id no corresponde a un medio de pago.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        message:"✔️ Medio de pago obtenido correctamente.",
        data:medioPago,
    })
}

const updateMedioPago = async(req,res) => {
    const id = req.params.id;
    const nombreM = req.body.name;
    const interesM = req.body.interes;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente.',
        })
        return
    }

    if(!nombreM || !interesM){
        res.status(400).json({
            ok:false,
            message:"❌ Faltan completar algunos campos obligatorios."
        })
        return
    }

    const updatedMedioPago = await MedioPago.findByIdAndUpdate(
        id,
        {name:nombreM , interes:interesM},
        { new: true , runValidators: true }
    )

    if(!updatedMedioPago){
        res.status(400).json({
            ok:false,
            message:'❌ Error al actualizar el medio de pago.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:updatedMedioPago,
        message:'✔️ Medio de pago actualizado correctamente.',
    })
}


//Validaciones de eliminacion
const Cliente_NotaPedido = require("../models/clienteNotaPedido_Model.js");
const Proveedor_Presupuesto = require("../models/proveedorPresupuesto_Model.js");

const deleteMedioPago = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente.'
        })
        return
    }

    const cliente_NotaPedido = await Cliente_NotaPedido.find({medioPago:id , estado:true}).lean();
    const proveedor_Presupuesto = await Proveedor_Presupuesto.find({medioPago:id , estado:true}).lean();
    
    if(cliente_NotaPedido.length !== 0 || proveedor_Presupuesto.length !== 0 ){
        res.status(400).json({
            ok:false,
            message:"❌ Error al eliminar. Existen tablas relacionadas a este medio de pago."
        })
        return
    }

    const deletedMedioPago = await MedioPago.findByIdAndUpdate(
        id,
        {estado:false},
        { new: true , runValidators: true }
    )
    if(!deletedMedioPago){
        res.status(400).json({
            ok:false,
            message: '❌ Error durante el borrado.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'✔️ Medio de pago eliminado correctamente.'
    })
}

module.exports = { setMedioPago , getMedioPago , getMedioPagoID , updateMedioPago , deleteMedioPago };
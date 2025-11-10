const MedioPago = require("../models/medioPago_Model");
const getNextSequence = require("../controllers/counter_Controller");

const setMedioPago = async (req,res) => {
    const newId = await getNextSequence("MedioPago");
    const name = req.body.name;
    const interes = req.body.interes;

    if(!name){
        res.status(400).json({ok:false , message:'Error al cargar los datos.'})
        return
    }
    const newMedioPago = new MedioPago ({
        _id: newId,name: name , interes: interes , estado:true});
    await newMedioPago.save()
        .then( () => {
            res.status(201).json({ok:true, message:'Medio de pago agregado correctamente.'})
        })
        .catch((err)=>{console.log(err)});

}

const getMedioPago = async(req, res) => {
    const mediosPago = await MedioPago.find({estado:true});

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
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const medioPago = await MedioPago.findById(id);
    if(!medioPago){
        res.status(400).json({
            ok:false,
            message:'El id no corresponde a un medio de pago.'
        })
        return
    }

    res.status(200).json({
        ok:true,
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
            message:'El id no llego al controlador correctamente.',
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
            message:'Error al actualizar el medio de pago.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:updatedMedioPago,
        message:'Medio de pago actualizado correctamente.',
    })
}

const deleteMedioPago = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.'
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
            message: 'Error durante el borrado.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'Medio de pago eliminado correctamente.'
    })
}

module.exports = { setMedioPago , getMedioPago , getMedioPagoID , updateMedioPago , deleteMedioPago };
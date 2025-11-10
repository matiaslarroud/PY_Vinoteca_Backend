const CondicionIva = require("../models/condicionIva_Model");
const getNextSequence = require("../controllers/counter_Controller");

const setCondicionIva = async (req,res) => {
    const newId = await getNextSequence("CondicionIva ");
    const name = req.body.name;

    if(!name){
        res.status(400).json({ok:false , message:'Error al cargar los datos.'})
        return
    }
    const newCondicionIva = new CondicionIva ({
        _id: newId,name: name , estado:true});
    await newCondicionIva.save()
        .then( () => {
            res.status(201).json({ok:true, message:'Condicion de iva agregada correctamente.'})
        })
        .catch((err)=>{console.log(err)});

}

const getCondicionIva = async(req, res) => {
    const condicionesIva = await CondicionIva.find({estado:true});

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
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const condicionIva = await CondicionIva.findById(id);
    if(!condicionIva){
        res.status(400).json({
            ok:false,
            message:'El id no corresponde a un medio de pago.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:condicionIva,
    })
}

const updateCondicionIva = async(req,res) => {
    const id = req.params.id;
    const nombreC = req.body.name;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.',
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
            message:'Error al actualizar el condicion de iva.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:updatedCondicionIva,
        message:'Condicion de iva actualizada correctamente.',
    })
}

const deleteCondicionIva = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.'
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
            message: 'Error durante el borrado.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'Condicion de iva eliminada correctamente.'
    })
}

module.exports = { setCondicionIva , getCondicionIva , getCondicionIvaID , updateCondicionIva , deleteCondicionIva };
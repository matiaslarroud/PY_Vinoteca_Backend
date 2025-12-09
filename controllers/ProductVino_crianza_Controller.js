const Crianza = require("../models//crianzaVino_Model");
const getNextSequence = require("../controllers/counter_Controller");

const setCrianza = async (req,res) => {
    const name = req.body.name;

    if(!name){
        res.status(400).json({ok:false , message:"❌ Faltan completar algunos campos obligatorios."})
        return
    }
    const newId = await getNextSequence("Vino_Crianza");
    const newCrianza = new Crianza ({
        _id: newId,name: name , estado:true});
    await newCrianza.save()
        .then( () => {
            res.status(201).json({ok:true, message:'✔️ Crianza agregada correctamente.'})
        })
        .catch((err) => {
            res.status(400).json({
                ok:false,
                message:`❌  Error al agregar crianza. ERROR:\n${err}`
            })
        })

}

const getCrianza = async(req, res) => {
    const crianzas = await Crianza.find({estado:true}).lean();
    res.status(200).json({
        ok:true,
        data: crianzas,
    })
}

const getCrianzaID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente',
        })
        return
    }

    const crianzaEncontrada = await Crianza.findById(id);
    if(!crianzaEncontrada){
        res.status(400).json({
            ok:false,
            message:'❌ Error al obtener datos.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        message:"✔️ Crianza obtenida correctamente.",
        data:crianzaEncontrada,
    })
}

const updateCrianza = async(req,res) => {
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
        res.status(400).json({ok:false , message:"❌ Faltan completar algunos campos obligatorios."})
        return
    }

    const updatedCrianza = await Crianza.findByIdAndUpdate(
        id,
        {name},
        { new: true , runValidators: true }
    )

    if(!updatedCrianza){
        res.status(400).json({
            ok:false,
            message:'❌ Error al actualizar crianza.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:updatedCrianza,
        message:'✔️ Crianza actualizada correctamente.',
    })
}

//Validaciones de eliminacion
const Vino = require("../models/productoVino_Model");

const deleteCrianza = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente.'
        })
        return
    }

    const vinos = await Vino.find({crianza:id , estado:true}).lean();
    
    if(vinos.length !== 0 ){
        res.status(400).json({
            ok:false,
            message:"❌ Error al eliminar. Existen tablas relacionadas a esta crianza."
        })
        return
    }

    const deletedCrianza = await Crianza.findByIdAndUpdate(
        id,
        {estado:false},
        { new: true , runValidators: true }
    )
    if(!deletedCrianza){
        res.status(400).json({
            ok:false,
            message: '❌ Error durante el borrado.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'✔️ Crianza eliminada correctamente.'
    })
}

module.exports = { setCrianza , getCrianza , getCrianzaID , updateCrianza , deleteCrianza };
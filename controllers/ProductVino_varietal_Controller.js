const VarietalVino = require("../models/varietalVino_Model");
const getNextSequence = require("../controllers/counter_Controller");

const setVarietalVino = async (req,res) => {
    const name = req.body.name;

    if(!name){
        res.status(400).json({ok:false , message:"❌ Faltan completar algunos campos obligatorios."})
        return
    }
    const newId = await getNextSequence("Vino_Varietal");
    const newVarietalVino = new VarietalVino ({
        _id: newId,name: name , estado:true });
    await newVarietalVino.save()
        .then( () => {
            res.status(201).json({ok:true, message:'✔️ Varietal de vino agregado correctamente.'})
        })
        .catch((err) => {
            res.status(400).json({
                ok:false,
                message:`❌  Error al agregar varietal. ERROR:\n${err}`
            })
        })

}

const getVarietalVino = async(req, res) => {
    const varietalVinos = await VarietalVino.find({estado:true}).lean();
    res.status(200).json({
        ok:true,
        data: varietalVinos,
    })
}

const getVarietalVinoID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente',
        })
        return
    }

    const varietalVinoEncontrada = await VarietalVino.findById(id);
    if(!varietalVinoEncontrada){
        res.status(400).json({
            ok:false,
            message:'❌ Error al obtener datos.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        message:"✔️ Varietal obtenido correctamente.",
        data:varietalVinoEncontrada,
    })
}

const updateVarietalVino = async(req,res) => {
    const id = req.params.id;
    const nombreVarietalVino = req.body.name;
    
    if(!id || !nombreVarietalVino){
       return res.status(400).json({ok:false , message:"❌ Faltan completar algunos campos obligatorios."})
    }

    const updatedVarietalVino = await VarietalVino.findByIdAndUpdate(
        id,
        {name:nombreVarietalVino},
        { new: true , runValidators: true }
    )

    if(!updatedVarietalVino){
        res.status(400).json({
            ok:false,
            message:'❌ Error al actualizar varietal.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'✔️ Varietal actualizado correctamente.',
    })
}

//Validaciones de eliminacion
const Vino = require("../models/productoVino_Model");

const deleteVarietalVino = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente.'
        })
        return
    }

    const vinos = await Vino.find({varietal:id , estado:true}).lean();
    
    if(vinos.length !== 0 ){
        res.status(400).json({
            ok:false,
            message:"❌ Error al eliminar. Existen tablas relacionadas a este varietal."
        })
        return
    }


    const deletedVarietalVino = await VarietalVino.findByIdAndUpdate(
        id,
        {estado:false},
        { new: true , runValidators: true }
    )

    if(!deletedVarietalVino){
        res.status(400).json({
            ok:false,
            message: '❌ Error durante el borrado.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'✔️ Varietal eliminado correctamente.'
    }) 
}

module.exports = { setVarietalVino , getVarietalVino , getVarietalVinoID , updateVarietalVino , deleteVarietalVino };
const VarietalVino = require("../models/varietalVino_Model");

const setVarietalVino = async (req,res) => {
    const name = req.body.name;
    const tipoUva = req.body.tipoUva;

    if(!name || !tipoUva){
        res.status(400).json({ok:false , message:'No se puede agregar sin los datos.'})
        return
    }
    const newVarietalVino = new VarietalVino ({name: name , uva:tipoUva});
    await newVarietalVino.save()
        .then( () => {
            res.status(201).json({ok:true, message:'Varietal de vino agregado correctamente.'})
        })
        .catch((err)=>{console.log(err)});

}

const getVarietalVino = async(req, res) => {
    const varietalVinos = await VarietalVino.find();
    if(!varietalVinos){
        res.status(400).json({ok:false , message:'Error al obtener datos.'})
        return
    }
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
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const varietalVinoEncontrada = await VarietalVino.findById(id);
    if(!varietalVinoEncontrada){
        res.status(400).json({
            ok:false,
            message:'Error al obtener datos.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:varietalVinoEncontrada,
    })
}

const updateVarietalVino = async(req,res) => {
    const id = req.params.id;
    const nombreVarietalVino = req.body.name;
    const tipoUva = req.body.tipoUva;
    if(!id || !nombreVarietalVino || !tipoUva){
        res.status(400).json({
            ok:false,
            message:'Error al actualizar varietal.',
        })
        return
    }

    const updatedVarietalVino = await VarietalVino.findByIdAndUpdate(
        id,
        {name:nombreVarietalVino , uva:tipoUva},
        { new: true , runValidators: true }
    )

    if(!updatedVarietalVino){
        res.status(400).json({
            ok:false,
            message:'Error al actualizar varietal.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'Varietal actualizado correctamente.',
    })
}

const deleteVarietalVino = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.'
        })
        return
    }

    const deletedVarietalVino = await VarietalVino.findByIdAndDelete(id);
    if(!deletedVarietalVino){
        res.status(400).json({
            ok:false,
            message: 'Error durante el borrado.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'Varietal eliminado correctamente.'
    })
}

module.exports = { setVarietalVino , getVarietalVino , getVarietalVinoID , updateVarietalVino , deleteVarietalVino };
const VinoTipo = require("../models/tipoVino_Model");
const getNextSequence = require("../controllers/counter_Controller");

const setVinoTipo = async (req,res) => {
    const newId = await getNextSequence("Vino_Tipo");
    const name = req.body.name;

    if(!name){
        res.status(400).json({ok:false , message:'No se puede agregar sin el nombre.'})
        return
    }
    const newVinoTipo = new VinoTipo ({
        _id: newId, name: name , estado:true});
    await newVinoTipo.save()
        .then( () => {
            res.status(201).json({ok:true, message:'Tipo de vino agregado correctamente.'})
        })
        .catch((err)=>{console.log(err)});

}

const getVinoTipo = async(req, res) => {
    const vinoTipos = await VinoTipo.find({estado:true});
    if(!vinoTipos){
        res.status(400).json({ok:false , message:'Error al obtener datos.'})
        return
    }
    res.status(200).json({
        ok:true,
        data: vinoTipos,
    })
}

const getVinoTipoID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const vinoTipoEncontrado = await VinoTipo.findById(id);
    if(!vinoTipoEncontrado){
        res.status(400).json({
            ok:false,
            message:'Error al obtener datos.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:vinoTipoEncontrado,
    })
}

const updateVinoTipo = async(req,res) => {
    const id = req.params.id;
    const nameV = req.body.name;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.',
        })
        return
    }

    const updatedVinoTipo = await VinoTipo.findByIdAndUpdate(
        id,
        {name:nameV},
        { new: true , runValidators: true }
    )

    if(!updatedVinoTipo){
        res.status(400).json({
            ok:false,
            message:'Error al actualizar tipo de vino.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:updatedVinoTipo,
        message:'Tipo de vino actualizado correctamente.',
    })
}

const deleteVinoTipo = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.'
        })
        return
    }

    const deletedVinoTipo = await VinoTipo.findByIdAndUpdate(
        id,
        {estado:false},
        { new: true , runValidators: true }
    )
    if(!deletedVinoTipo){
        res.status(400).json({
            ok:false,
            message: 'Error durante el borrado.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'Tipo de vino eliminado correctamente.'
    })
}

module.exports = { setVinoTipo , getVinoTipo , getVinoTipoID , updateVinoTipo , deleteVinoTipo };
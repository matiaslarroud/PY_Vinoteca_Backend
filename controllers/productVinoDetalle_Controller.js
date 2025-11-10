const VinoDetalle = require("../models/productoVinoDetalle_Model");
const getNextSequence = require("./counter_Controller");

const setVinoDetalle = async (req,res) => {
    const newId = await getNextSequence("ProductoVinoDetalle");
    const vinoP = req.body.vino;
    const uvaID = req.body.uva;

    if( !vinoP || !uvaID ){
        res.status(400).json({ok:false , message:'Error al cargar los datos.'})
        return
    }
    const newVinoDetalle = new VinoDetalle ({
        _id: newId,
        vino: vinoP , uva: uvaID , estado:true
    });
    await newVinoDetalle.save()
        .then( () => {
            res.status(201).json({ok:true, message:'Vino Detalle agregado correctamente.'})
        })
        .catch((err)=>{console.log(err)});

}

const getVinoDetalle = async(req, res) => {
    const detallesVino = await VinoDetalle.find({estado:true});

    res.status(200).json({
        ok:true,
        data: detallesVino,
    })
}

const getVinoDetalleID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const vinoDetalle = await VinoDetalle.findById(id);
    if(!vinoDetalle){
        res.status(400).json({
            ok:false,
            message:'El id no corresponde al detalle de un vino.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:vinoDetalle,
    })
}

const getVinoDetalle_ByVino = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const vinoDetalle = await VinoDetalle.find({vino:id});
    if(!vinoDetalle || vinoDetalle.length === 0){
        res.status(400).json({
            ok:false,
            message:'El id no corresponde a los detalles de un vino.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:vinoDetalle,
    })
}

const updateVinoDetalle = async(req,res) => {
    const id = req.params.id;
    
    const VinoP = req.body.vino;
    const uvaID = req.body.uva;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.',
        })
        return
    }

    const updatedVinoDetalle = await VinoDetalle.findByIdAndUpdate(
        id,
        {   
            vino: VinoP , uva: uvaID
        },
        { new: true , runValidators: true }
    )

    if(!updatedVinoDetalle){
        res.status(400).json({
            ok:false,
            message:'Error al actualizar el Vino Detalle.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:updatedVinoDetalle,
        message:'Vino Detalle actualizado correctamente.',
    })
}



const deleteVinoDetalle = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.'
        })
        return
    }

    const deletedVinoDetalle = await VinoDetalle.updateMany(
        {vino:id},
        {   
            estado:false
        },
        { new: true , runValidators: true }
    )
    
    if(!deletedVinoDetalle){
        res.status(400).json({
            ok:false,
            message: 'Error durante el borrado de los detalles de vino.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'Vino Detalle eliminado correctamente.'
    })
}

module.exports = { setVinoDetalle , getVinoDetalle , getVinoDetalleID, getVinoDetalle_ByVino , updateVinoDetalle , deleteVinoDetalle };
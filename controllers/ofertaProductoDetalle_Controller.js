const OfertaProductoDetalle = require("../models/ofertaProductoDetalle_Model");
const getNextSequence = require("./counter_Controller");

const setOfertaProductoDetalle = async (req,res) => {
    const cantidad = req.body.cantidad;
    const descuento = req.body.descuento;
    const producto = req.body.producto;
    const oferta = req.body.oferta;

    if( !producto || !descuento || !cantidad || !oferta ){
        res.status(400).json({ok:false , message:'❌ Faltan completar algunos campos obligatorios.'})
        return
    }
    const newId = await getNextSequence("ProductoOfertaDetalle");
    const newOfertaDetalle = new OfertaProductoDetalle ({
        _id: newId,
        oferta: oferta,
        producto: producto , 
        cantidad: cantidad , 
        descuento: descuento , 
        estado:true
    });
    await newOfertaDetalle.save()
        .then( () => {
            res.status(201).json({ok:true, message:'✔️ Oferta Detalle agregado correctamente.'})
        })
        .catch((err) => {
            res.status(400).json({
                ok:false,
                message:`❌  Error al agregar detalle de oferta. ERROR:\n${err}`
            })
        }) 

}

const getOfertaDetalle = async(req, res) => {
    const detallesOferta = await OfertaProductoDetalle.find({estado:true});


    res.status(200).json({
        ok:true,
        data: detallesOferta,
    })
}

const getOfertaDetalleID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente',
        })
        return
    }

    const ofertaDetalle = await OfertaProductoDetalle.findById(id);
    if(!ofertaDetalle){
        res.status(400).json({
            ok:false,
            message:'❌ El id no corresponde al detalle de una Oferta.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        message:"✔️ Detalle de Oferta obtenido correctamente",
        data:ofertaDetalle,
    })
}

const getOfertaDetalle_ByOferta = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌El id no llego al controlador correctamente',
        })
        return
    }

    const ofertaDetalle = await OfertaProductoDetalle.find({oferta:id, estado:true});
    if(!ofertaDetalle || ofertaDetalle.length === 0){
        res.status(400).json({
            ok:false,
            message:'❌El id no corresponde a los detalles de una Oferta.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        message:"✔️ Detalles de Oferta obtenidos correctamente.",
        data:OfertaDetalle,
    })
}

const updateOfertaDetalle = async(req,res) => {
    const id = req.params.id;
    
    const cantidad = req.body.cantidad;
    const oferta = req.body.oferta;
    const producto = req.body.producto;
    const descuento = req.body.descuento;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente.',
        })
        return
    }

    const updatedOfertaDetalle = await OfertaProductoDetalle.findByIdAndUpdate(
        id,
        {   
            oferta: oferta , 
            cantidad: cantidad , 
            producto: producto ,
            descuento: descuento
        },
        { new: true , runValidators: true }
    )

    if(!updatedOfertaDetalle){
        res.status(400).json({
            ok:false,
            message:'❌ Error al actualizar el detalle de la oferta.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:updatedOfertaDetalle,
        message:'✔️ Detalle de oferta actualizado correctamente.',
    })
}



const deleteOfertaDetalle = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente.'
        })
        return
    }

    const deletedOfertaDetalle = await OfertaProductoDetalle.updateMany(
        {oferta:id},
        {   
            estado:false
        },
        { new: true , runValidators: true }
    )
    
    if(!deletedOfertaDetalle){
        res.status(400).json({
            ok:false,
            message: '❌ Error durante el borrado de los detalles de la Oferta.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'✔️ Detalle de oferta eliminado correctamente.'
    })
}

const buscarProducto = async(req,res) => {
  try {
    const producto = req.body.producto;
    
    // Primero traemos todos los clientes
    const productos = await OfertaProductoDetalle.find({estado:true});

    const productosFiltrados = productos.filter(c => {
  // Cada condición solo se evalúa si el campo tiene valor
  const coincideProducto = producto ? Number(c.producto) === Number(producto) : true;

  // Si todos los criterios activos coinciden => mantener cliente
  return (
    coincideProducto
  );
});

res.status(200).json({ ok: true, data: productosFiltrados });

  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: "❌ Error al buscar detalles de ofertas" });
  }
}

module.exports = { setOfertaProductoDetalle , getOfertaDetalle , getOfertaDetalleID, getOfertaDetalle_ByOferta , buscarProducto , updateOfertaDetalle , deleteOfertaDetalle };
const NotaPedidoDetalle = require("../models/clienteNotaPedidoDetalle_Model");
const Product = require("../models/producto_Model");
const getNextSequence = require("../controllers/counter_Controller");

const setNotaPedidoDetalle = async (req,res) => {
    const importeP = req.body.importe;
    const precioP = req.body.precio;
    const cantidadP = req.body.cantidad;
    const notaPedidoP = req.body.notaPedido;
    const productoID = req.body.producto;

    if(!importeP || !notaPedidoP || !productoID || !precioP || !cantidadP ){
        res.status(400).json({ok:false , message:'❌ Faltan completar algunos campos obligatorios.'})
        return
    }
    const newId = await getNextSequence("Cliente_NotaPedidoDetalle");
    const newNotaPedidoDetalle = new NotaPedidoDetalle ({
        _id: newId,
        importe: importeP , notaPedido: notaPedidoP , producto: productoID , precio:precioP , cantidad:cantidadP , estado:true
    });
    await newNotaPedidoDetalle.save()
        .then( () => {
            res.status(201).json({ok:true, message:'✔️ Detalle de nota de pedido agregado correctamente.'})
        })
        .catch((err) => {
            res.status(400).json({
                ok:false,
                message:`❌ Error al agregar detalle de nota de pedido. ERROR:\n${err}`
            })
        }) 

}

const getNotaPedidoDetalle = async(req, res) => {
    const detallesNotaPedido = await NotaPedidoDetalle.find({estado:true}).lean();

    res.status(200).json({
        ok:true,
        data: detallesNotaPedido
    })
}

const getNotaPedidoDetalleByNotaPedido = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente',
        })
        return
    }

    const notaPedidoDetalle = await NotaPedidoDetalle.find({notaPedido:id , estado:true});
    if(!notaPedidoDetalle){
        res.status(400).json({
            ok:false,
            message:'❌ El id no corresponde a una nota de pedido.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        message:"✔️ Detalles de notas de pedido obtenidos correctamente.",
        data:notaPedidoDetalle,
    })
}


const getNotaPedidoDetalleID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente',
        })
        return
    }

    const notaPedidoDetalle = await NotaPedidoDetalle.findByID(id);
    if(!notaPedidoDetalle){
        res.status(400).json({
            ok:false,
            message:'❌ El id no corresponde al detalle de una nota de pedido.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:notaPedidoDetalle,
        message:"✔️ Detalle de nota de pedido obtenido correctamente."
    })
}

const updateNotaPedidoDetalle = async(req,res) => {
    const id = req.params.id;
    
    const importeP = req.body.importe;
    const precioP = req.body.precio;
    const cantidadP = req.body.cantidad;
    const notaPedidoP = req.body.notaPedido;
    const productoID = req.body.producto;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente.',
        })
        return
    }

    if(!importeP || !notaPedidoP || !productoID || !precioP || !cantidadP ){
        res.status(400).json({ok:false , message:'❌ Faltan completar algunos campos obligatorios.'})
        return
    }

    const updatedNotaPedidoDetalle = await NotaPedidoDetalle.findByIdAndUpdate(
        id,
        {   
            importe: importeP , notaPedido: notaPedidoP , producto: productoID , precio:precioP , cantidad:cantidadP
        },
        { new: true , runValidators: true }
    )

    if(!updatedNotaPedidoDetalle){
        res.status(400).json({
            ok:false,
            message:'❌ Error al actualizar el detalle de nota de pedido.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:updatedNotaPedidoDetalle,
        message:'✔️ Detalle de nota de pedido actualizado correctamente.',
    })
}

const deleteNotaPedidoDetalle = async (req, res) => {
    const id = req.params.id;

    if (!id) {
        return res.status(400).json({
            ok: false,
            message: '❌ El id no llegó al controlador correctamente.'
        });
    }

    // ⭐ 1. Traer todos los detalles activos de la nota
    const detalles = await NotaPedidoDetalle.find({ notaPedido: id, estado: true });

    // ⭐ 2. Reintegrar el stock de cada producto
     for (const detalle of detalles) {
      await Product.findByIdAndUpdate(
        detalle.producto,
        { $inc: { stock: detalle.cantidad } }, // suma la cantidad al stock
        { new: true }
      );
    }

    // ⭐ 3. Marcar los detalles como eliminados (estado = false)
    const deletedNotaPedidoDetalle = await NotaPedidoDetalle.updateMany(
      { notaPedido: id },
      { estado: false },
      { new: true, runValidators: true }
    );

    if (!deletedNotaPedidoDetalle) {
        return res.status(400).json({
            ok: false,
            message: '❌ Error durante el borrado.'
        });
    }

    res.status(200).json({
        ok: true,
        message: '✔️ Detalles eliminados y stock restaurado correctamente.'
    });
};


module.exports = { setNotaPedidoDetalle , getNotaPedidoDetalle , getNotaPedidoDetalleID , updateNotaPedidoDetalle , deleteNotaPedidoDetalle , getNotaPedidoDetalleByNotaPedido };
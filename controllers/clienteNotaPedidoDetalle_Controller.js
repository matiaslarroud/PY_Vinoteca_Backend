const NotaPedidoDetalle = require("../models/clienteNotaPedidoDetalle_Model");
const getNextSequence = require("../controllers/counter_Controller");

const setNotaPedidoDetalle = async (req,res) => {
    const newId = await getNextSequence("Cliente_NotaPedidoDetalle");
    const subtotalP = req.body.subtotal;
    const precioP = req.body.precio;
    const cantidadP = req.body.cantidad;
    const notaPedidoP = req.body.notaPedido;
    const productoID = req.body.producto;

    if(!subtotalP || !notaPedidoP || !productoID || !precioP || !cantidadP ){
        res.status(400).json({ok:false , message:'Error al cargar los datos.'})
        return
    }
    const newNotaPedidoDetalle = new NotaPedidoDetalle ({
        _id: newId,
        subtotal: subtotalP , notaPedido: notaPedidoP , producto: productoID , precio:precioP , cantidad:cantidadP
    });
    await newNotaPedidoDetalle.save()
        .then( () => {
            res.status(201).json({ok:true, message:'Detalle de nota de pedido agregado correctamente.'})
        })
        .catch((err)=>{console.log(err)});

}

const getNotaPedidoDetalle = async(req, res) => {
    const detallesNotaPedido = await NotaPedidoDetalle.find();

    res.status(200).json({
        ok:true,
        data: detallesNotaPedido,
    })
}

const getNotaPedidoDetalleByNotaPedido = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const notaPedidoDetalle = await NotaPedidoDetalle.find({notaPedido:id});
    if(!notaPedidoDetalle){
        res.status(400).json({
            ok:false,
            message:'El id no corresponde a una nota de pedido.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:notaPedidoDetalle,
    })
}


const getNotaPedidoDetalleID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const notaPedidoDetalle = await NotaPedidoDetalle.findByID(id);
    if(!notaPedidoDetalle){
        res.status(400).json({
            ok:false,
            message:'El id no corresponde al detalle de un NotaPedido.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:notaPedidoDetalle,
    })
}

const updateNotaPedidoDetalle = async(req,res) => {
    const id = req.params.id;
    
    const subtotalP = req.body.subtotal;
    const precioP = req.body.precio;
    const cantidadP = req.body.cantidad;
    const notaPedidoP = req.body.notaPedido;
    const productoID = req.body.producto;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.',
        })
        return
    }

    const updatedNotaPedidoDetalle = await NotaPedidoDetalle.findByIdAndUpdate(
        id,
        {   
            subtotal: subtotalP , notaPedido: notaPedidoP , producto: productoID , precio:precioP , cantidad:cantidadP
        },
        { new: true , runValidators: true }
    )

    if(!updatedNotaPedidoDetalle){
        res.status(400).json({
            ok:false,
            message:'Error al actualizar el detalle de nota de pedido.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:updatedNotaPedidoDetalle,
        message:'Detalle de nota de pedido actualizado correctamente.',
    })
}

const deleteNotaPedidoDetalle = async(req,res) => {
    const id = req.params.id;
    
    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.'
        })
        return
    }

    const deletedNotaPedidoDetalle = await NotaPedidoDetalle.deleteMany({notaPedido:id});
    if(!deletedNotaPedidoDetalle){
        res.status(400).json({
            ok:false,
            message: 'Error durante el borrado.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'Detalle de nota de pedido eliminado correctamente.'
    })
}

module.exports = { setNotaPedidoDetalle , getNotaPedidoDetalle , getNotaPedidoDetalleID , updateNotaPedidoDetalle , deleteNotaPedidoDetalle , getNotaPedidoDetalleByNotaPedido };
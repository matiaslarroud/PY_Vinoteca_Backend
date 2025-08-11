const NotaPedido = require("../models/clienteNotaPedido_Model");

const obtenerFechaHoy = () => {
  const hoy = new Date();
  return hoy.toISOString().split("T")[0];
}

const setNotaPedido = async (req,res) => {
    const totalP = req.body.total;
    const fechaP = obtenerFechaHoy();
    const envioP = req.body.envio;
    const envioDireccionP = req.body.envioDireccion;
    const fechaEntregaP = req.body.fechaEntrega;
    const clienteID = req.body.cliente;
    const empleadoID = req.body.empleado;
    const medioPagoID = req.body.medioPago;
    const presupuestoID = req.body.presupuesto;

    if(!totalP || !fechaP || !clienteID || !empleadoID || !medioPagoID || !fechaEntregaP){
        res.status(400).json({ok:false , message:'Error al cargar los datos.'})
        return
    }
    const newNotaPedido = new NotaPedido ({
        total: totalP , 
        fecha: fechaP , 
        cliente: clienteID,
        empleado:empleadoID , 
        medioPago:medioPagoID , 
        fechaEntrega:fechaEntregaP , 
        envio:envioP,
        facturado: false
    });
    if (presupuestoID) {
        newNotaPedido.presupuesto = presupuestoID;
    }

    if (envioP) {
        newNotaPedido.envioDireccion = envioDireccionP;
    }
    await newNotaPedido.save()
        .then( () => {
            res.status(201).json({
                ok:true, 
                message:'Nota de pedido agregada correctamente.',
                data: newNotaPedido
            })
        })
        .catch((err)=>{console.log(err)});

}

const getNotaPedido = async(req, res) => {
    const notaPedidos = await NotaPedido.find();

    res.status(200).json({
        ok:true,
        data: notaPedidos,
    })
}

const getNotaPedidoID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const notaPedido = await NotaPedido.findById(id);
    if(!notaPedido){
        res.status(400).json({
            ok:false,
            message:'El id no corresponde a un Nota de pedido.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:notaPedido,
    })
}

const updateNotaPedido = async(req,res) => {
    const id = req.params.id;
    
    const estadoP = req.body.facturado;
    if (estadoP === true) {
        res.status(400).json({ok:false , message:'El pedido ya esta cerrado.'})
        return
    }

    const totalP = req.body.total;
    const fechaP = obtenerFechaHoy();
    const envioP = req.body.envio;
    const fechaEntregaP = req.body.fechaEntrega;
    const clienteID = req.body.cliente;
    const empleadoID = req.body.empleado;
    const medioPagoID = req.body.medioPago;
    const presupuestoID = req.body.presupuesto;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.',
        })
        return
    }

     const updatedPedidoData = {
        total: totalP , 
        fecha: fechaP , 
        cliente: clienteID,
        empleado:empleadoID , 
        medioPago:medioPagoID , 
        fechaEntrega:fechaEntregaP , 
        envio:envioP
    };
    
    if (presupuestoID) {
        updatedPedidoData.presupuesto = presupuestoID;
    }

    const updatedNotaPedido = await NotaPedido.findByIdAndUpdate(
        id,
        updatedPedidoData,
        { new: true , runValidators: true }
    )

    if(!updatedNotaPedido){
        res.status(400).json({
            ok:false,
            message:'Error al actualizar el Nota de pedido.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:updatedNotaPedido,
        message:'Nota de pedido actualizada correctamente.',
    })
}

const deleteNotaPedido = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.'
        })
        return
    }

    const deletedNotaPedido = await NotaPedido.findByIdAndDelete(id);
    if(!deletedNotaPedido){
        res.status(400).json({
            ok:false,
            message: 'Error durante el borrado.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'Nota de pedido eliminado correctamente.'
    })
}

module.exports = { setNotaPedido , getNotaPedido , getNotaPedidoID , updateNotaPedido , deleteNotaPedido };
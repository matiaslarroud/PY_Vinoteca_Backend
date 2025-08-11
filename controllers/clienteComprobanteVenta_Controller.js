const ComprobanteVenta = require("../models/clienteComprobanteVenta_Model");
const NotaPedido = require("../models/clienteNotaPedido_Model");

const obtenerFechaHoy = () => {
  const hoy = new Date();
  return hoy.toISOString().split("T")[0];
}

const setComprobanteVenta = async (req, res) => {
    try {
        const totalP = req.body.total;
        const fechaP = obtenerFechaHoy();
        const tipoComprobanteP = req.body.tipoComprobante;
        const descuentoP = req.body.descuento;
        const notaPedidoP = req.body.notaPedido;

        // Validar datos obligatorios
        if (!totalP || !fechaP || !tipoComprobanteP || !notaPedidoP) {
            return res.status(400).json({
                ok: false,
                message: 'Error al cargar los datos.'
            });
        }

        // Crear el comprobante
        const newComprobanteVenta = new ComprobanteVenta({
            total: totalP,
            fecha: fechaP,
            tipoComprobante: tipoComprobanteP,
            descuento: descuentoP || 0,
            facturado: true,
            notaPedido: notaPedidoP
        });

        // Si hay descuento, recalcular total
        if (descuentoP) {
            newComprobanteVenta.total = totalP - ((totalP * descuentoP) / 100);
        }

        // Actualizar el pedido a facturado
        const updatePedidoState = await NotaPedido.findByIdAndUpdate(
            notaPedidoP,
            { facturado: true },
            { new: true, runValidators: true }
        );

        if (!updatePedidoState) {
            return res.status(400).json({
                ok: false,
                message: 'Error al actualizar el estado del pedido.'
            });
        }

        // Guardar comprobante
        await newComprobanteVenta.save();

        // Respuesta final única
        return res.status(201).json({
            ok: true,
            message: 'Comprobante de venta agregado y pedido actualizado correctamente.',
            data: newComprobanteVenta
        })

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            message: 'Error interno del servidor.'
        });
    }
};


const getComprobanteVenta = async(req, res) => {
    const comprobanteVentas = await ComprobanteVenta.find();

    res.status(200).json({
        ok:true,
        data: comprobanteVentas,
    })
}

const getComprobanteVentaID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const comprobanteVentaEncontrado = await ComprobanteVenta.findById(id);
    if(!comprobanteVentaEncontrado){
        res.status(400).json({
            ok:false,
            message:'El id no corresponde a un comprobante de venta.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:comprobanteVentaEncontrado,
    })
}

const updateComprobanteVenta = async(req,res) => {
    const id = req.params.id;
    
    const totalP = req.body.total;
    const fechaP = obtenerFechaHoy();
    const tipoComprobanteP = req.body.tipoComprobante;
    const descuentoP = req.body.descuento;
    const notaPedidoP = req.body.notaPedido;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.',
        })
        return
    }

     const updatedComprobanteVentaData = {
        total: totalP , 
        fecha: fechaP , 
        tipoComprobante: tipoComprobanteP,
        descuento: descuentoP,
        facturado: true, // Default value
    };
    
    if (notaPedidoP) {
        updatedComprobanteVentaData.notaPedido = notaPedidoP;
    }

    const updatedComprobanteVenta = await ComprobanteVenta.findByIdAndUpdate(
        id,
        {   
            updatedComprobanteVentaData
        },
        { new: true , runValidators: true }
    )

    if(!updatedComprobanteVenta){
        res.status(400).json({
            ok:false,
            message:'Error al actualizar el comprobante de venta.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:updatedComprobanteVenta,
        message:'Comprobante de venta actualizado correctamente.',
    })
}

const deleteComprobanteVenta = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.'
        })
        return
    }

    const deletedComprobanteVenta = await ComprobanteVenta.findByIdAndDelete(id);
    if(!deletedComprobanteVenta){
        res.status(400).json({
            ok:false,
            message: 'Error durante el borrado.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'Comprobante de venta eliminado correctamente.',
    })
}

module.exports = { setComprobanteVenta , getComprobanteVenta , getComprobanteVentaID , updateComprobanteVenta , deleteComprobanteVenta };
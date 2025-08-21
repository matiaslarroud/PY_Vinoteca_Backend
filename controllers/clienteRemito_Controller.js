const Remito = require("../models/clienteRemito_Model");
const ComprobanteVenta = require("../models/clienteComprobanteVenta_Model");

const obtenerFechaHoy = () => {
  const hoy = new Date();
  return hoy.toISOString().split("T")[0];
}

const setRemito = async (req, res) => {
    try {
        const totalPrecio = req.body.totalPrecio;
        const totalBultos = req.body.totalBultos;
        const fecha = obtenerFechaHoy();
        const comprobanteVentaID = req.body.comprobanteVentaID;
        const transporteID = req.body.transporteID;

        // Validar datos obligatorios
        if (!totalPrecio || !totalBultos || !fecha || !comprobanteVentaID || !transporteID) {
            return res.status(400).json({
                ok: false,
                message: 'Error al cargar los datos.'
            });
        }

        const newRemito = new Remito({
            totalPrecio: totalPrecio,
            totalBultos: totalBultos,
            fecha: fecha,
            comprobanteVentaID: comprobanteVentaID,
            transporteID: transporteID,
        });

        if (req.body.entregado !== undefined) {
            newRemito.entregado = false;
        }
        
        // Actualizar el comprobante de venta a remito creado
        const updateComprobanteVentaState = await ComprobanteVenta.findByIdAndUpdate(
            comprobanteVentaID,
            { remitoCreado: true },
            { new: true, runValidators: true }
        );

        if (!updateComprobanteVentaState) {
            return res.status(400).json({
                ok: false,
                message: 'Error al actualizar el estado del comprobante de venta.'
            });
        }

        await newRemito.save();

        return res.status(201).json({
            ok: true,
            message: 'Remito agregado correctamente.',
            data: newRemito
        })

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            message: 'Error interno del servidor.'
        });
    }
};


const getRemito = async(req, res) => {
    const remitos = await Remito.find();

    res.status(200).json({
        ok:true,
        data: remitos,
    })
}

const getRemitoID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const remitoEncontrado = await Remito.findById(id);
    if(!remitoEncontrado){
        res.status(400).json({
            ok:false,
            message:'El id no corresponde a un remito.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:remitoEncontrado,
    })
}

const updateRemito = async(req,res) => {
    const id = req.params.id;
    
    const totalPrecio = req.body.totalPrecio;
    const totalBultos = req.body.totalBultos;
    const fecha = obtenerFechaHoy();
    const comprobanteVentaID = req.body.comprobanteVentaID;
    const transporteID = req.body.transporteID;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.',
        })
        return
    }

    const updatedRemitoData = {
        totalPrecio: totalPrecio,
        totalBultos: totalBultos,
        fecha: fecha,
        transporteID: transporteID,
        entregado: req.body.entregado,
    };
    
    if (comprobanteVentaID) {
        updatedRemitoData.comprobanteVentaID = comprobanteVentaID;
    }

    const updatedRemito = await Remito.findByIdAndUpdate(
        id,
        updatedRemitoData,
        { new: true , runValidators: true }
    )

    if(!updatedRemito){
        res.status(400).json({
            ok:false,
            message:'Error al actualizar el remito.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:updatedRemito,
        message:'Remito actualizado correctamente.',
    })
}

const deleteRemito = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.'
        })
        return
    }

    const deletedRemito = await Remito.findByIdAndDelete(id);
    if(!deletedRemito){
        res.status(400).json({
            ok:false,
            message: 'Error durante el borrado.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'Remito eliminado correctamente.',
    })
}

module.exports = { setRemito , getRemito , getRemitoID , updateRemito , deleteRemito };
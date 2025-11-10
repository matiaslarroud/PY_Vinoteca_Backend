const Remito = require("../models/proveedorRemito_Model");
const RemitoDetalle = require("../models/proveedorRemitoDetalle_Model");
const getNextSequence = require("./counter_Controller");

const obtenerFechaHoy = () => {
  const hoy = new Date();
  return hoy.toISOString().split("T")[0];
}

const setRemito = async (req, res) => {
    
    try {
        const newId = await getNextSequence("Proveedor_Remito");
        const totalPrecio = req.body.totalPrecio;
        const totalBultos = req.body.totalBultos;
        const fecha = obtenerFechaHoy();
        const comprobanteCompra = req.body.comprobanteCompra;
        const transporte = req.body.transporte;

        // Validar datos obligatorios
        if (!totalPrecio || !totalBultos || !fecha || !comprobanteCompra || !transporte) {
            return res.status(400).json({
                ok: false,
                message: 'Error al cargar los datos.'
            });
        }

        const newRemito = new Remito({
            _id: newId,
            totalPrecio: totalPrecio,
            totalBultos: totalBultos,
            fecha: fecha,
            comprobanteCompra: comprobanteCompra,
            transporte: transporte,
            estado:true
        });

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
    const remitos = await Remito.find({estado:true});

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
    const comprobanteCompra = req.body.comprobanteCompra;
    const transporte = req.body.transporte;

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
        transporte: transporte,
        comprobanteCompra: comprobanteCompra,
    };

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

    const deletedRemito = await Remito.findByIdAndUpdate(
        id,
        {estado:false},
        { new: true , runValidators: true }
    )
    if(!deletedRemito){
        res.status(400).json({
            ok:false,
            message: 'Error durante el borrado.'
        })
        return
    }

    const deletedRemitoDetalle = await RemitoDetalle.updateMany(
        {remito:id},
        {   
            estado:false
        },
        { new: true , runValidators: true }
    )
    if(!deletedRemitoDetalle){
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
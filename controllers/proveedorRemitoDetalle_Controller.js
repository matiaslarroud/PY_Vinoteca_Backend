const RemitoDetalle = require("../models/proveedorRemitoDetalle_Model");
const ComprobanteCompraDetalle = require("../models/proveedorComprobanteCompraDetalle_Model");
const Remito = require("../models/proveedorRemito_Model");
const Producto = require("../models/producto_Model");
const getNextSequence = require("./counter_Controller");

const setRemitoDetalle = async (req, res) => {
    try {
        const { remito, producto, cantidad } = req.body;

        // Validaciones
        if (!remito || !producto || !cantidad) {
            return res.status(400).json({
                ok: false,
                message: "❌ Faltan completar algunos campos obligatorios."
            });
        }
        // OBTENER EL REMITO Y SU COMPROBANTE
        const r = await Remito.findById(remito);

        if (!r) {
            return res.status(404).json({
                ok: false,
                message: "❌ No se encontró el remito."
            });
        }

        const comprobanteCompraID = r.comprobanteCompra;

        // 1) Crear detalle
        const newId = await getNextSequence("Proveedor_RemitoDetalle");
        const newRemitoDetalle = new RemitoDetalle({
            _id: newId,
            remito,
            producto,
            cantidad,
            estado: true
        });

        await newRemitoDetalle.save();

        // 2) Actualizar stock del producto
        const productoUpdate = await Producto.findById(producto);

        if (!productoUpdate) {
            return res.status(400).json({
                ok: false,
                message: "❌ No se encontró el producto para actualizar stock."
            });
        }

        productoUpdate.stock = (productoUpdate.stock || 0) + Number(cantidad);

        // 3️⃣ Obtener precio costo desde ComprobanteCompraDetalle
        const detalleComprobante = await ComprobanteCompraDetalle.findOne({
            comprobanteCompra: comprobanteCompraID,
            producto: producto
        });

        if (detalleComprobante) {
            productoUpdate.precioCosto = Number(detalleComprobante.precio);
        }

        await productoUpdate.save();

        // 3) Respuesta final al front
        return res.status(201).json({
            ok: true,
            message: '✔️ Detalle de remito agregado y stock actualizado correctamente.',
            data: newRemitoDetalle
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            message: "❌ Error interno al procesar remito detalle."
        });
    }
};


const getRemitoDetalle = async(req, res) => {
    const detallesRemito= await RemitoDetalle.find({estado:true}).lean();
    res.status(200).json({
        ok:true,
        data: detallesRemito
    })
}

const getRemitoDetalleByRemito = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente',
        })
        return
    }

    const remitoDetalleEncontrado = await RemitoDetalle.find({remito:id , estado:true});
    if(!remitoDetalleEncontrado){
        res.status(400).json({
            ok:false,
            message:'❌ El id no corresponde a un detalle de remito.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:remitoDetalleEncontrado,
        message:'✔️ Remitos obtenidos correctamente.',
    })
}


const getRemitoDetalleID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente',
        })
        return
    }

    const remitoDetalleEncontrado = await RemitoDetalle.findByID(id);
    if(!remitoDetalleEncontrado){
        res.status(400).json({
            ok:false,
            message:'❌ El id no corresponde al detalle de un remito.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:remitoDetalleEncontrado,
        message:'✔️ Remito obtenido correctamente.',
    })
}

const updateRemitoDetalle = async(req,res) => {
    const id = req.params.id;
    
    const remitoID = req.body.remito;
    const productoID = req.body.producto;
    const cantidad = req.body.cantidad;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente.',
        })
        return
    }

    if(!remitoID || !productoID || !cantidad){
        res.status(400).json({ok:false , message:"❌ Faltan completar algunos campos obligatorios."})
        return
    }

    const updatedRemitoDetalle = await RemitoDetalle.findByIdAndUpdate(
        id,
        {   
            remito: remitoID,
            producto: productoID,
            cantidad: cantidad,
        },
        { new: true , runValidators: true }
    )

    if(!updatedRemitoDetalle){
        res.status(400).json({
            ok:false,
            message:'❌ Error al actualizar el detalle del remito.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:updatedRemitoDetalle,
        message:'✔️ Detalle de remito actualizado correctamente.',
    })
}

const deleteRemitoDetalle = async(req,res) => {
    const id = req.params.id;
    
    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente.'
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
            message: '❌ Error durante el borrado.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'✔️ Detalle de remito eliminado correctamente.'
    })
}

module.exports = { setRemitoDetalle , getRemitoDetalle , getRemitoDetalleID , updateRemitoDetalle , deleteRemitoDetalle , getRemitoDetalleByRemito};
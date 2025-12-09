const ComprobanteCompra = require("../models/proveedorComprobanteCompra_Model");
const ComprobanteCompraDetalle = require("../models/proveedorComprobanteCompraDetalle_Model");
const OrdenCompra = require("../models/proveedorOrdenCompra_Model");
const OrdenCompraDetalle = require("../models/proveedorOrdenCompraDetalle_Model");

const getNextSequence = require("./counter_Controller");

const setComprobanteCompraDetalle = async (req, res) => {
    const { comprobanteCompra, producto, cantidad, importe, precio } = req.body;

    if (!comprobanteCompra || !producto || !cantidad || !importe || !precio) {
        return res.status(400).json({
            ok: false,
            message: '❌ Faltan completar algunos campos obligatorios.'
        });
    }

    // Buscar el comprobante compra para obtener el ordenCompra asociado
    const comprobante = await ComprobanteCompra.findById(comprobanteCompra).lean();
    if (!comprobante) {
        return res.status(400).json({
            ok: false,
            message: '❌ Error al cargar detalle de comprobante de compra.'
        });
    }

    // Buscar los detalles de la OrdenCompra
    const detallesOrdenCompra = await OrdenCompraDetalle.find({
        ordenCompra: comprobante.ordenCompra,
        estado: true
    }).lean();

    if (detallesOrdenCompra.length === 0) {
        return res.status(400).json({
            ok: false,
            message: '❌ Error al cargar detalle de comprobante de compra.'
        });
    }

    // Buscar todos los comprobantes asociados a esta ordenCompra
    const comprobantesCompraByOrden = await ComprobanteCompra.find({
        ordenCompra: comprobante.ordenCompra,
        estado: true
    }).lean();

    if (comprobantesCompraByOrden.length === 0) {
        return res.status(400).json({
            ok: false,
            message: '❌ Error al cargar detalle de comprobante de compra.3'
        });
    }

    // Obtener los IDs de todos los comprobantes
    const idsComprobantes = comprobantesCompraByOrden.map(c => c._id);

    // Encontrar el detalle específico que corresponde al producto que se está intentando cargar
    const detalleProducto = detallesOrdenCompra.find(det => det.producto == producto);

    if (!detalleProducto) {
        return res.status(400).json({
            ok: false,
            message: `❌ El producto que intentás cargar no forma parte de la Orden de Compra.`
        });
    }

    // Crear el nuevo comprobante compra detalle
    const newId = await getNextSequence("Proveedor_OrdenCompraDetalle");
    const newComprobanteDetalle = new ComprobanteCompraDetalle({
        _id: newId,
        comprobanteCompra,
        producto,
        cantidad,
        importe,
        precio,
        estado: true
    });

    try {
        await newComprobanteDetalle.save();
        
        // ========================================================
        //   VERIFICAR SI LA ORDEN DE COMPRA YA ESTÁ COMPLETA
        // ========================================================

        // Obtener nuevamente todos los detalles de la OrdenCompra
        const detallesOC = await OrdenCompraDetalle.find({
            ordenCompra: comprobante.ordenCompra,
            estado: true
        }).lean();

        // Para saber entregas totales de todos los comprobantes de esa orden
        const idsComprobantesTotales = comprobantesCompraByOrden.map(c => c._id);

        // Buscar todos los detalles entregados de esa orden de compra
        const entregasTotales = await ComprobanteCompraDetalle.find({
            comprobanteCompra: { $in: idsComprobantesTotales },
            estado: true
        }).lean();

        // Crear un mapa { productoID: totalEntregado }
        const mapaEntregas = {};
        for (const det of entregasTotales) {
            mapaEntregas[det.producto] = (mapaEntregas[det.producto] || 0) + Number(det.cantidad);
        }

        // Verificar si cada producto llegó al total pedido
        let ordenCompleta = true;

        for (const det of detallesOC) {
            const entregado = mapaEntregas[det.producto] || 0;

            if (entregado < det.cantidad) {
                ordenCompleta = false;
                break;
            }
        }

        // Marcar la OrdenCompra como completa si corresponde
        if (ordenCompleta) {
            await OrdenCompra.findByIdAndUpdate(
                comprobante.ordenCompra,
                { completo: true }
            );
        } else {
            // Por las dudas, si se deshizo algo, marcarla como incompleta
            await OrdenCompra.findByIdAndUpdate(
                comprobante.ordenCompra,
                { completo: false }
            );
        }


        return res.status(201).json({
            ok: true,
            message: '✔️ Comprobante de compra agregado correctamente.',
            data: newComprobanteDetalle
        });
    } catch (err) {
        return res.status(400).json({
            ok: false,
            message: `❌ Error al agregar detalle de comprobante de compra.\n${err}`
        });
    }
};


const getComprobanteCompraDetalle = async(req, res) => {
    const comprobantes = await ComprobanteCompraDetalle.find({estado:true}).lean();

    res.status(200).json({
        ok:true,
        data: comprobantes,
    })
}

const getComprobanteCompraDetalleByComprobanteCompra = async(req, res) => {
    const id = req.params.id;

    const comprobantes = await ComprobanteCompraDetalle.find({comprobanteCompra: id , estado:true}).lean();

    if(comprobantes.length === 0){
            res.status(400).json({
            ok:false,
            message: "❌ Error al obtener detalles de comprobante de compra.",
            data: comprobantes,
        })
    };

    res.status(200).json({
        ok:true,
        message: "✔️ Detalles de comprobantes de compra obtenidos correctamente.",
        data: comprobantes,
    })
}

const getComprobanteCompraDetalleID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente',
        })
        return
    }

    const comprobanteCompraDetalle = await ComprobanteCompraDetalle.findById(id);
    if(!comprobanteCompraDetalle){
        res.status(400).json({
            ok:false,
            message:'❌ El id no corresponde a un detalle de comprobante de compra.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:comprobanteCompraDetalle,
        message: "✔️ Detalle de comprobante de compra obtenido correctamente.",
    })
}

const updateComprobanteCompraDetalle = async (req, res) => {
    const comprobanteCompraID = req.params.id; // <-- NO es el detalle, es el comprobante
    const { producto, cantidad, importe, precio } = req.body;

    if (!comprobanteCompraID) {
        return res.status(400).json({
            ok: false,
            message: "❌ El ID del comprobante no llegó correctamente."
        });
    }

    if (!producto || !cantidad || !importe || !precio) {
        return res.status(400).json({
            ok: false,
            message: "❌ Faltan completar algunos campos obligatorios."
        });
    }

    // =============================================================
    //   BUSCAR EL DETALLE A EDITAR (comprobanteCompra + producto)
    // =============================================================
    const detalleActual = await ComprobanteCompraDetalle.findOne({
        comprobanteCompra: comprobanteCompraID,
        producto,
        estado: true
    });

    if (!detalleActual) {
        return res.status(400).json({
            ok: false,
            message: "❌ No existe un detalle asociado a este comprobante para ese producto."
        });
    }

    // =============================================================
    //   BUSCAR EL COMPROBANTE Y LA ORDEN DE COMPRA ASOCIADA
    // =============================================================
    const comprobante = await ComprobanteCompra.findById(comprobanteCompraID).lean();
    if (!comprobante) {
        return res.status(400).json({
            ok: false,
            message: "❌ Error al buscar el comprobante de compra."
        });
    }

    const ordenCompraID = comprobante.ordenCompra;

    // =============================================================
    //   BUSCAR DETALLE ORIGINAL DE LA ORDEN DE COMPRA (cantidad pedida)
    // =============================================================
    const detalleOC = await OrdenCompraDetalle.findOne({
        ordenCompra: ordenCompraID,
        producto,
        estado: true
    }).lean();

    if (!detalleOC) {
        return res.status(400).json({
            ok: false,
            message: "❌ El producto no forma parte de la Orden de Compra."
        });
    }

    // =============================================================
    //   BUSCAR TODAS LAS ENTREGAS (EXCLUYENDO ESTE DETALLE)
    // =============================================================
    const comprobantesCompraByOrden = await ComprobanteCompra.find({
        ordenCompra: ordenCompraID,
        estado: true
    }).lean();

    const idsComprobantes = comprobantesCompraByOrden.map(c => c._id);

    const entregasPrevias = await ComprobanteCompraDetalle.find({
        comprobanteCompra: { $in: idsComprobantes },
        producto,
        _id: { $ne: detalleActual._id }, // EXCLUIR EL DETALLE QUE SE EDITA
        estado: true
    }).lean();

    const totalEntregadoSinEste = entregasPrevias.reduce((sum, d) => sum + Number(d.cantidad), 0);

    // =============================================================
    //   VALIDACIÓN PRINCIPAL
    // =============================================================
    if (totalEntregadoSinEste + Number(cantidad) > detalleOC.cantidad) {
        return res.status(400).json({
            ok: false,
            message:
                `❌ Con esta edición superarías la cantidad pedida.\n` +
                `Producto: ${detalleOC.producto}\n` +
                `Pedido: ${detalleOC.cantidad}\n` +
                `Entregados: ${totalEntregadoSinEste}\n` +
                `Intentás cargar: ${cantidad}`
        });
    }

    // =============================================================
    //   ACTUALIZAR DETALLE
    // =============================================================
    detalleActual.cantidad = cantidad;
    detalleActual.importe = importe;
    detalleActual.precio = precio;

    await detalleActual.save();

    // =============================================================
    //   VERIFICAR SI LA ORDEN DE COMPRA QUEDA COMPLETA
    // =============================================================
    const detallesOC = await OrdenCompraDetalle.find({
        ordenCompra: ordenCompraID,
        estado: true
    }).lean();

    const entregasTotales = await ComprobanteCompraDetalle.find({
        comprobanteCompra: { $in: idsComprobantes },
        estado: true
    }).lean();

    const mapaEntregas = {};
    for (const det of entregasTotales) {
        mapaEntregas[det.producto] = (mapaEntregas[det.producto] || 0) + Number(det.cantidad);
    }

    let ordenCompleta = true;

    for (const det of detallesOC) {
        const totalProd = mapaEntregas[det.producto] || 0;
        if (totalProd < det.cantidad) {
            ordenCompleta = false;
            break;
        }
    }

    await OrdenCompra.findByIdAndUpdate(
        ordenCompraID,
        { completo: ordenCompleta }
    );

    return res.status(200).json({
        ok: true,
        message: "✔️ Detalle actualizado correctamente.",
        data: detalleActual
    });
};



const deleteComprobanteCompraDetalle = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente.'
        })
        return
    }
    
    const deletedByComprobanteCompra = await ComprobanteCompraDetalle.updateMany(
        {comprobanteCompra:id},
        {   
            estado:false
        },
        { new: true , runValidators: true }
    )
    
    if(!deletedByComprobanteCompra){
        res.status(400).json({
            ok:false,
            message: '❌ Error durante el borrado del detalle.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'✔️ Comprobante de compra detalle eliminado correctamente.'
    })
}

const validarDetalle = async (req, res) => {
    const { ordenCompra, producto, cantidad } = req.body;

    if (!ordenCompra || !producto || !cantidad) {
        return res.status(400).json({
            ok: false,
            message: "❌ Debes enviar ordenCompra, producto y cantidad."
        });
    }

    // Buscar detalles originales de esa OC
    const detalleOC = await OrdenCompraDetalle.findOne({
        ordenCompra,
        producto,
        estado: true
    }).lean();

    if (!detalleOC) {
        return res.status(400).json({
            ok: false,
            message: "❌ El producto no pertenece a la Orden de Compra."
        });
    }

    const pedido = Number(detalleOC.cantidad);

    // Buscar comprobantes anteriores
    const comprobantes = await ComprobanteCompra.find({
        ordenCompra,
        estado: true
    }).lean();

    const idsComprobantes = comprobantes.map(c => c._id);

    // Buscar entregas previas para este producto
    const entregasPrevias = await ComprobanteCompraDetalle.find({
        comprobanteCompra: { $in: idsComprobantes },
        producto,
        estado: true
    }).lean();

    let entregado = 0;
    for (const e of entregasPrevias) {
        entregado += Number(e.cantidad);
    }

    const nuevoTotal = entregado + Number(cantidad);

    if (nuevoTotal > pedido) {
        return res.status(400).json({
            ok: false,
            message:
                `❌ Con esta carga superarías la cantidad pedida.\n` +
                `Producto: ${producto}\n` +
                `Pedido: ${pedido}\n` +
                `Entregados: ${entregado}\n` +
                `Intentás cargar: ${cantidad}`
        });
    }

    return res.status(200).json({
        ok: true,
        message: "✔️ Detalle válido"
    });
};



module.exports = { validarDetalle,setComprobanteCompraDetalle , getComprobanteCompraDetalleByComprobanteCompra , getComprobanteCompraDetalle , getComprobanteCompraDetalleID , updateComprobanteCompraDetalle , deleteComprobanteCompraDetalle };
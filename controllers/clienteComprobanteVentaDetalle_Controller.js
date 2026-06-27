const ComprobanteVentaDetalle = require("../models/clienteComprobanteVentaDetalle_Model");
const ComprobanteVenta = require("../models/clienteComprobanteVenta_Model");
const ProductoVino = require("../models/productoVino_Model");
const getNextSequence = require("../controllers/counter_Controller");

const setComprobanteVentaDetalle = async (req,res) => {
    const importeP = req.body.importe;
    const comprobanteVentaP = req.body.comprobanteVenta;
    const productoID = req.body.producto;
    const precioP = req.body.precio;
    const cantidadP = req.body.cantidad;

    if(!importeP || !comprobanteVentaP || !productoID || !precioP || !cantidadP){
        res.status(400).json({ok:false , message:'❌ Error al cargar los datos.'})
        return
    }
    
    const newId = await getNextSequence("Cliente_ComprobanteVentaDetalle");
    const newComprobanteVentaDetalle = new ComprobanteVentaDetalle ({
        _id: newId,
        importe: importeP , 
        comprobanteVenta: comprobanteVentaP , 
        producto: productoID , 
        precio:precioP , 
        cantidad:cantidadP,
        estado:true
    });
    await newComprobanteVentaDetalle.save()
        .then( () => {
            res.status(201).json({ok:true, message:'✔️ Detalle de comprobante de venta agregado correctamente.', data: newComprobanteVentaDetalle})
        })
        .catch((err) => {
            res.status(400).json({
                ok:false,
                message:`❌  Error al agregar detalle de comprobante de venta. ERROR:\n${err}`
            })
        }) 

}

const getComprobanteVentaDetalle = async(req, res) => {
    const detallesNotaPedido = await ComprobanteVentaDetalle.find({estado:true}).lean();

    res.status(200).json({
        ok:true,
        data: detallesNotaPedido
    })
}

const getComprobanteVentaDetalleByComprobanteVenta = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente',
        })
        return
    }

    const comprobanteVentaDetalleEncontrado = await ComprobanteVentaDetalle.find({comprobanteVenta:id , estado:true});
    if(!comprobanteVentaDetalleEncontrado){
        res.status(400).json({
            ok:false,
            message:'❌ El id no corresponde a un detalle de comprobante de venta.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        message:"✔️ Detalles de comprobantes de venta obtenidos correctamente.",
        data:comprobanteVentaDetalleEncontrado,
    })
}


const getComprobanteVentaDetalleID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'✔️ El id no llego al controlador correctamente',
        })
        return
    }

    const comprobanteVentaDetalleEncontrado = await ComprobanteVentaDetalle.findByID(id);
    if(!comprobanteVentaDetalleEncontrado){
        res.status(400).json({
            ok:false,
            message:'❌ El id no corresponde al detalle de un comprobante de venta.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        message:"✔️ Detalle de comprobante de venta obtenido correctamente.",
        data:comprobanteVentaDetalleEncontrado,
    })
}

const updateComprobanteVentaDetalle = async(req,res) => {
    const id = req.params.id;
    
    const importeP = req.body.importe;
    const comprobanteVentaP = req.body.comprobanteVenta;
    const productoID = req.body.producto;
    const precioP = req.body.precio;
    const cantidadP = req.body.cantidad;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente.',
        })
        return
    }

    const updatedComprobanteVentaDetalle = await ComprobanteVentaDetalle.findByIdAndUpdate(
        id,
        {   
            importe: importeP , 
            comprobanteVenta: comprobanteVentaP , 
            producto: productoID , 
            precio:precioP , 
            cantidad:cantidadP
        },
        { new: true , runValidators: true }
    )

    if(!updatedComprobanteVentaDetalle){
        res.status(400).json({
            ok:false,
            message:'❌ Error al actualizar el detalle del comprobante de venta.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:updatedComprobanteVentaDetalle,
        message:'✔️ Detalle de comprobante de venta actualizado correctamente.',
    })
}

const deleteComprobanteVentaDetalle = async(req,res) => {
    const id = req.params.id;
    
    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente.'
        })
        return
    }

    const deletedComprobanteVentaDetalle = await ComprobanteVentaDetalle.updateMany(
        {comprobanteVenta:id},
        {   
            estado:false
        },
        { new: true , runValidators: true }
    )
    
    if(!deletedComprobanteVentaDetalle){
        res.status(400).json({
            ok:false,
            message: '❌ Error durante el borrado.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'✔️ Detalle de comprobante de venta eliminado correctamente.'
    })
}

const getVinosMasVendidos = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, top } = req.query;
    const topN = top === 'todos' ? null : (parseInt(top) || 10);

    // 1. Si hay fechas, filtrar comprobantes por rango
    let idsComprobantesValidos = null;
    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      fin.setHours(23, 59, 59, 999);
      const comprobantes = await ComprobanteVenta.find({
        estado: true,
        fecha: { $gte: inicio, $lte: fin }
      }, '_id').lean();
      idsComprobantesValidos = comprobantes.map(c => c._id);
    }

    // 2. Obtener detalles (filtrados o todos)
    const filtroDetalle = { estado: true };
    if (idsComprobantesValidos) {
      filtroDetalle.comprobanteVenta = { $in: idsComprobantesValidos };
    }
    const detalles = await ComprobanteVentaDetalle.find(filtroDetalle).lean();

    // 3. Agrupar por productoID
    const mapaProducto = {};
    for (const det of detalles) {
      const pid = det.producto;
      if (!mapaProducto[pid]) {
        mapaProducto[pid] = { cantidadVendida: 0, importeTotal: 0, comprobantes: new Set() };
      }
      mapaProducto[pid].cantidadVendida += Number(det.cantidad) || 0;
      mapaProducto[pid].importeTotal    += Number(det.importe)  || 0;
      mapaProducto[pid].comprobantes.add(det.comprobanteVenta);
    }

    // 4. Ordenar desc por cantidad y cortar al topN
    let ranking = Object.entries(mapaProducto)
      .map(([productoID, datos]) => ({
        productoID: Number(productoID),
        cantidadVendida: datos.cantidadVendida,
        importeTotal: datos.importeTotal,
        nroComprobantes: datos.comprobantes.size
      }))
      .sort((a, b) => b.cantidadVendida - a.cantidadVendida);

    if (topN) ranking = ranking.slice(0, topN);

    // 5. Enriquecer con datos del vino (1 sola query con populate)
    const idsProductos = ranking.map(r => r.productoID);
    const vinos = await ProductoVino.find({ _id: { $in: idsProductos } })
      .populate('bodega',   'name')
      .populate('varietal', 'name')
      .populate('tipo',     'name')
      .populate('volumen',  'name')
      .lean();

    const mapaVinos = {};
    for (const v of vinos) mapaVinos[v._id] = v;

    const resultado = ranking.map((r, i) => {
      const vino = mapaVinos[r.productoID] || {};
      return {
        ranking:         i + 1,
        productoID:      r.productoID,
        nombre:          vino.name             || '—',
        bodega:          vino.bodega?.name     || '—',
        varietal:        vino.varietal?.name   || '—',
        tipo:            vino.tipo?.name       || '—',
        volumen:         vino.volumen?.name    || '—',
        cantidadVendida: r.cantidadVendida,
        importeTotal:    r.importeTotal,
        nroComprobantes: r.nroComprobantes
      };
    });

    return res.status(200).json({
      ok: true,
      data: resultado,
      message: `✔️ Top ${resultado.length} vinos más vendidos obtenidos correctamente.`
    });

  } catch (error) {
    console.error('❌ Error getVinosMasVendidos:', error);
    return res.status(500).json({ ok: false, message: '❌ Error interno del servidor.' });
  }
};

module.exports = { setComprobanteVentaDetalle , getComprobanteVentaDetalle , getComprobanteVentaDetalleID , updateComprobanteVentaDetalle , deleteComprobanteVentaDetalle , getComprobanteVentaDetalleByComprobanteVenta , getVinosMasVendidos };
const NotaPedidoDetalle = require("../models/clienteNotaPedidoDetalle_Model");
const NotaPedido = require("../models/clienteNotaPedido_Model");
const Product = require("../models/producto_Model");
const ProductoVino = require("../models/productoVino_Model");
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

    if (isNaN(cantidadP)) {
      return res.status(400).json({
        ok: false,
        mensaje: '❌ Cantidad inválida, debe ser un número',
    })}

    const producto = await Product.findById(id);
    if (!producto) {
        return res.status(400).json({
            ok: false,
            message: '❌ Producto no encontrado',
        });
    }

    if(producto.stock - Number(cantidadP) < 0)
    {
      return res.status(400).json({
            ok: false,
            message: '❌ La cantidad solicitada supera al stock actual del producto.',
        });
    }
      
    producto.stock -= Number(cantidadVendida);
    await producto.save();
    
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

const getVinosMasVendidos = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, top } = req.query;
    const topN = top === 'todos' ? null : (parseInt(top) || 10);

    // 1. Si hay fechas, filtrar Notas de Pedido por rango
    let idsNotasValidas = null;
    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      fin.setHours(23, 59, 59, 999);
      const notas = await NotaPedido.find({
        estado: true,
        fecha: { $gte: inicio, $lte: fin }
      }, '_id').lean();
      idsNotasValidas = notas.map(c => c._id);
    }

    // 2. Obtener detalles (filtrados o todos)
    const filtroDetalle = { estado: true };
    if (idsNotasValidas) {
      filtroDetalle.notaPedido = { $in: idsNotasValidas };
    }
    const detalles = await NotaPedidoDetalle.find(filtroDetalle).lean();

    // 3. Agrupar por productoID
    const mapaProducto = {};
    for (const det of detalles) {
      const pid = det.producto;
      if (!mapaProducto[pid]) {
        mapaProducto[pid] = { cantidadVendida: 0, importeTotal: 0, notas: new Set() };
      }
      mapaProducto[pid].cantidadVendida += Number(det.cantidad) || 0;
      mapaProducto[pid].importeTotal    += Number(det.importe)  || 0;
      mapaProducto[pid].notas.add(det.notaPedido);
    }

    // 4. Ordenar desc por cantidad y cortar al topN
    let ranking = Object.entries(mapaProducto)
      .map(([productoID, datos]) => ({
        productoID: Number(productoID),
        cantidadVendida: datos.cantidadVendida,
        importeTotal: datos.importeTotal,
        nroComprobantes: datos.notas.size
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


module.exports = { setNotaPedidoDetalle , getNotaPedidoDetalle , getNotaPedidoDetalleID , updateNotaPedidoDetalle , deleteNotaPedidoDetalle , getNotaPedidoDetalleByNotaPedido , getVinosMasVendidos};
const NotaPedidoDetalle = require("../models/clienteNotaPedidoDetalle_Model");
const NotaPedido = require("../models/clienteNotaPedido_Model");
const Product = require("../models/producto_Model");
const ProductoVino = require("../models/productoVino_Model");
const getNextSequence = require("../controllers/counter_Controller");

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

    const notaPedidoDetalle = await NotaPedidoDetalle.findById(id);
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

    // 2. Agrupar en la base de datos (antes se traían todos los detalles a memoria).
    //    Solo cuentan vinos: picadas e insumos no forman parte del ranking.
    const idsVinos = await ProductoVino.distinct('_id');
    const filtroDetalle = { estado: true, producto: { $in: idsVinos } };
    if (idsNotasValidas) {
      filtroDetalle.notaPedido = { $in: idsNotasValidas };
    }
    let ranking = await NotaPedidoDetalle.aggregate([
      { $match: filtroDetalle },
      { $group: {
          _id: '$producto',
          cantidadVendida: { $sum: '$cantidad' },
          importeTotal: { $sum: '$importe' },
          notas: { $addToSet: '$notaPedido' },
      } },
      { $project: { _id: 0, productoID: '$_id', cantidadVendida: 1, importeTotal: 1, nroComprobantes: { $size: '$notas' } } },
      { $sort: { cantidadVendida: -1 } },
    ]);

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


module.exports = { getNotaPedidoDetalle , getNotaPedidoDetalleID , getNotaPedidoDetalleByNotaPedido , getVinosMasVendidos };;;;
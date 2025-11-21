const Remito = require("../models/proveedorRemito_Model");
const RemitoDetalle = require("../models/proveedorRemitoDetalle_Model");
const ComprobanteCompra = require("../models/proveedorComprobanteCompra_Model");
const OrdenCompra = require("../models/proveedorOrdenCompra_Model");
const getNextSequence = require("./counter_Controller");

const obtenerFechaHoy = () => {
  const hoy = new Date();
  return hoy.toISOString().split("T")[0];
}

async function recalcularOrdenDesdeRemito(remito) {

    // 1. Obtener el comprobanteCompra
    const comprobante = await ComprobanteCompra.findById(remito.comprobanteCompraID).lean();
    if (!comprobante) return;

    const ordenCompraId = comprobante.ordenCompraID;
    if (!ordenCompraId) return;

    // 2. Obtener la orden de compra
    const orden = await OrdenCompra.findById(ordenCompraId).lean();

    // 3. Obtener TODOS los comprobantes de esta orden
    const comprobantes = await ComprobanteCompra.find({ ordenCompraID: ordenCompraId }).lean();
    const comprobanteIds = comprobantes.map(c => c._id);

    // 4. Obtener TODOS los remitos de esos comprobantes
    const remitos = await RemitoProveedor.find({
        comprobanteCompraID: { $in: comprobanteIds }
    }).lean();

    // 5. Acumular cantidades recibidas por producto
    const recibidos = {};

    remitos.forEach(r => {
        r.detalles.forEach(item => {
            const key = item.producto.toString();
            recibidos[key] = (recibidos[key] || 0) + item.cantidadRecibida;
        });
    });

    // 6. Verificar si todos los productos están completos
    const completo = orden.detalles.every(det => {
        const key = det.producto.toString();
        const totalRecibido = recibidos[key] || 0;
        const pedido = det.cantidadPedida;

        return totalRecibido >= pedido;  // ← **tu condición exacta**
    });

    // 7. Actualizar la orden de compra
    await OrdenCompra.findByIdAndUpdate(ordenCompraId, { completo:true });

    return completo;
}


const setRemito = async (req, res) => {
    try {
        const newId = await getNextSequence("Proveedor_Remito");
        const { totalPrecio, totalBultos, comprobanteCompra, transporte, detalles } = req.body;
        const fecha = obtenerFechaHoy();

        // Validación mínima
        if (!totalPrecio || !totalBultos || !comprobanteCompra || !transporte) {
            return res.status(400).json({
                ok: false,
                message: 'Error al cargar los datos.'
            });
        }

        // Crear remito
        const newRemito = new Remito({
            _id: newId,
            totalPrecio,
            totalBultos,
            fecha,
            comprobanteCompra,     // <-- este es el ID del comprobanteCompra
            transporte,
            detalles,              // IMPORTANTE: asegúrate que lo estás enviando
            estado: true
        });

        await newRemito.save();

        // 🔥 Llamar al recalculo (acá es donde corresponde)
        try {
              await recalcularOrdenDesdeRemito(newRemito);
          } catch (err) {
              console.error("Error recalculando orden de compra:", err);
          }

        return res.status(201).json({
            ok: true,
            message: 'Remito agregado correctamente.',
            data: newRemito
        });

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

// const getRemitoID = async(req,res) => {
//     const id = req.params.id;

//     if(!id){
//         res.status(400).json({
//             ok:false,
//             message:'El id no llego al controlador correctamente',
//         })
//         return
//     }

//     const remitoEncontrado = await Remito.findById(id);
//     if(!remitoEncontrado){
//         res.status(400).json({
//             ok:false,
//             message:'El id no corresponde a un remito.'
//         })
//         return
//     }

//     res.status(200).json({
//         ok:true,
//         data:remitoEncontrado,
//     })
// }

const getRemitoID = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        ok: false,
        message: "El ID no llegó correctamente al controlador.",
      });
    }

    // 1️⃣ Buscamos el remito
    const remito = await Remito.findById(id);
    if (!remito) {
      return res.status(404).json({
        ok: false,
        message: "El ID no corresponde a un remito.",
      });
    }

    // 2️⃣ Buscamos el comprobante de compra
    const comprobante = await ComprobanteCompra.findById(remito.comprobanteCompra);
    if (!comprobante) {
      return res.status(404).json({
        ok: false,
        message: "No se encontró el comprobante de compra asociado al remito.",
      });
    }

    // 3️⃣ Buscamos la orden de compra
    const orden = await OrdenCompra.findById(comprobante.ordenCompra);
    if (!orden) {
      return res.status(404).json({
        ok: false,
        message: "No se encontró la orden de compra asociada al comprobante.",
      });
    }

    // 4️⃣ Obtenemos el proveedor desde la orden
    const proveedorID = orden.proveedor;

    // 5️⃣ Respondemos
    res.status(200).json({
      ok: true,
      data: {
        remito,
        comprobante: comprobante._id,
        proveedor: proveedorID,
      },
    });

  } catch (error) {
    console.error("Error al obtener datos de remito:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor al obtener los datos del remito.",
      error: error.message,
    });
  }
};


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

const buscarRemito = async (req, res) => {
  try {
    const remitoID = req.body.remitoID;
    const proveedor = req.body.proveedor;
    const detalles = req.body.detalles || [];
    const comprobanteCompra = req.body.comprobanteCompra;
    const transporte = req.body.transporte;
    const totalPrecio = Number(req.body.totalPrecio) || 0;
    const totalBultos = Number(req.body.totalBultos) || 0;
    const fecha = req.body.fecha ? new Date(req.body.fecha) : null;

    let ordenesCompra = [];
    let comprobantesCompra = [];
    let idsOrdenesCompra = [];
    if (proveedor) {
      ordenesCompra = await OrdenCompra.find({ proveedor: proveedor }).select("_id");
      idsOrdenesCompra = ordenesCompra.map(np => String(np._id));
      comprobantesCompra = await ComprobanteCompra.find({ ordenCompra: { $in : idsOrdenesCompra} }).select("_id");
    }

    const idsComprobantes = comprobantesCompra.map(np => String(np._id));

    // 2️⃣ Buscar los comprobantes según productos (si hay detalles)
    const productosBuscados = detalles.length > 0
      ? detalles.map(d => d.producto)
      : [];

    let detallesFiltrados = [];
    if (productosBuscados.length > 0) {
      detallesFiltrados = await RemitoDetalle.find({
        producto: { $in: productosBuscados },
      });
    } if (productosBuscados.length > 0 && detallesFiltrados.length === 0) {
        res.status(500).json({ ok: false, message: "Error al buscar remitos" });       
    } else {
      detallesFiltrados = await RemitoDetalle.find();
    }

    const remitosIDs = [
      ...new Set(
        detallesFiltrados
          .map(d => d.remito)
          .filter(id => id !== undefined && id !== null)
      ),
    ];
    let remitos = await Remito.find(
      remitosIDs.length > 0 ? { _id: { $in: remitosIDs } } : {}
    );

    // ⚠️ 3️⃣ Verificar si no hay ningún filtro activo
   const remitosFiltrados = remitos.filter(p => {
        const coincideEstado = p.estado === true;
      const coincideRemito = remitoID ? (p._id) === Number(remitoID) : true;
      const coincideTotalBultos = totalBultos ? Number(p.totalBultos) === totalBultos : true;
      const coincideTotalPrecio = totalPrecio ? Number(p.totalPrecio) === totalPrecio : true;
      const coincideFecha = fecha
        ? String(new Date(p.fecha).toISOString().split("T")[0]) ===
          String(fecha.toISOString().split("T")[0])
        : true;
      const coincideComprobante = comprobanteCompra ? String(p.comprobanteCompra) === String(comprobanteCompra) : true;
      const coincideProveedor = proveedor
        ? p.comprobanteCompra && idsComprobantes.includes(String(p.comprobanteCompra))
        : true;
      const coincideTransporte = transporte ? String(p.transporte) === String(transporte) : true;

      return coincideEstado && coincideRemito && coincideTotalBultos && coincideTotalPrecio && coincideFecha &&
              coincideComprobante && coincideProveedor && coincideTransporte;
    });

    if (remitosFiltrados.length > 0) {
      res.status(200).json({ ok: true, data: remitosFiltrados });
    } else {
      res.status(200).json({ ok: false, message: "No se encontraron remitos con esos filtros" });
    }

  } catch (error) {
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

module.exports = { setRemito , buscarRemito , getRemito , getRemitoID , updateRemito , deleteRemito };
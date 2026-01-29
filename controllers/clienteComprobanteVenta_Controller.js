const ComprobanteVenta = require("../models/clienteComprobanteVenta_Model");
const ComprobanteVentaDetalle = require("../models/clienteComprobanteVentaDetalle_Model");
const NotaPedido = require("../models/clienteNotaPedido_Model");
const Cliente = require("../models/cliente_Model");
const getNextSequence = require("../controllers/counter_Controller");
const mongoose = require('mongoose');

const obtenerFechaHoy = () => {
  const hoy = new Date();
  return hoy.toISOString().split("T")[0];
}

const setComprobanteVentaDetalle = async ({
  importeP,
  comprobanteVentaP,
  productoID,
  precioP,
  cantidadP,
  session
}) => {

  if (!importeP || !comprobanteVentaP || !productoID || !precioP || !cantidadP) {
    throw new Error('❌ Error al cargar los datos del detalle.');
  }

  const newId = await getNextSequence("Cliente_ComprobanteVentaDetalle");

  const newComprobanteVentaDetalle = new ComprobanteVentaDetalle({
    _id: newId,
    importe: importeP,
    comprobanteVenta: comprobanteVentaP,
    producto: productoID,
    precio: precioP,
    cantidad: cantidadP,
    estado: true
  });

  await newComprobanteVentaDetalle.save({ session });

  return newComprobanteVentaDetalle;
};


const setComprobanteVenta = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const totalP = req.body.total;
        const fechaP = obtenerFechaHoy();
        const tipoComprobanteP = req.body.tipoComprobante;
        const notaPedidoP = req.body.notaPedido;
        const detalles = req.body.detalles;

        // Validar datos obligatorios
        if (!totalP || !fechaP || !tipoComprobanteP || !notaPedidoP) {
          throw new Error("❌ Faltan completar algunos campos obligatorios.") 
        }
        
        const newId = await getNextSequence("Cliente_ComprobanteVenta");
        // Crear el comprobante
        const newComprobanteVenta = new ComprobanteVenta({
            _id: newId,
            total: totalP,
            fecha: fechaP,
            tipoComprobante: tipoComprobanteP,
            facturado: true,
            remitoCreado: false,
            notaPedido: notaPedidoP,
            estado:true
        });

        // Guardar comprobante
        await newComprobanteVenta.save({session});
        
        if (!Array.isArray(detalles) || detalles.length === 0) {
          throw new Error("❌ El comprobante de venta debe tener al menos un detalle.");
        }

        // Guardar detalle  
        for (const det of detalles) {
                await setComprobanteVentaDetalle({
                    importeP: det.importe,
                    precioP: det.precio,
                    cantidadP: det.cantidad,
                    comprobanteVentaP: newId,
                    productoID: det.producto,
                    session
                });
            }

        await session.commitTransaction();

        // Respuesta final única
        return res.status(201).json({
            ok: true,
            message: '✔️ Comprobante de venta agregado y pedido actualizado correctamente.',
            data: newComprobanteVenta
        })

    } catch (err) {
        console.error(err);
        await session.abortTransaction();
        return res.status(500).json({
            ok: false,
            message: '❌ Error interno del servidor.'
        });
    }finally {
        session.endSession();
    }
};


const getComprobanteVenta = async(req, res) => {
    const comprobanteVentas = await ComprobanteVenta.find({estado:true}).lean();

    res.status(200).json({
        ok:true,
        data: comprobanteVentas
    })
}

const getComprobanteVentaID = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        ok: false,
        message: "❌ El ID no llegó correctamente al controlador.",
      });
    }

    // Buscar comprobante principal
    const comprobanteVenta = await ComprobanteVenta.findById(id);
    if (!comprobanteVenta) {
      return res.status(404).json({
        ok: false,
        message: "❌ No se encontró el comprobante de venta solicitado.",
      });
    }

    // Buscar nota de pedido asociada
    const notaPedido = await NotaPedido.findById(comprobanteVenta.notaPedido);
    if (!notaPedido) {
      return res.status(404).json({
        ok: false,
        message: "❌ La nota de pedido asociada no fue encontrada.",
      });
    }

    // Buscar cliente asociado a la nota de pedido
    const cliente = await Cliente.findById(notaPedido.cliente);

    // Buscar detalles del comprobante
    const detalles = await ComprobanteVentaDetalle.find({
      comprobanteVentaID: comprobanteVenta._id,
    }).populate("productoID", "nombre precioVenta");


    // Construir respuesta
    const body = {
      _id: comprobanteVenta._id,
      tipoComprobante: Number(comprobanteVenta.tipoComprobante),
      fecha: comprobanteVenta.fecha,
      notaPedido: Number(comprobanteVenta.notaPedido),
      total: comprobanteVenta.total,
      cliente: cliente
        ? {
            _id: Number(cliente._id),
            name: cliente.name,
          }
        : null,
    };
    res.status(200).json({
      ok: true,
      data: body,
      message:"✔️ Comprobante de venta obtenido correctamente."
    });
  } catch (err) {
    console.error("❌ Error al obtener comprobante de venta:", err);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor al obtener el comprobante de venta.",
      error: err.message,
    });
  }
};


const updateComprobanteVenta = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const id = req.params.id;

    const totalP = req.body.total;
    const fechaP = obtenerFechaHoy();
    const tipoComprobanteP = req.body.tipoComprobante;
    const notaPedidoP = req.body.notaPedido;

    if (!id) {
      throw new Error('❌ El id no llegó al controlador correctamente.');
    }

    const updatedComprobanteVentaData = {
      total: totalP,
      fecha: fechaP,
      tipoComprobante: tipoComprobanteP,
      remitoCreado: false
    };

    if (notaPedidoP) {
      updatedComprobanteVentaData.notaPedido = notaPedidoP;
    }

    const updatedComprobanteVenta = await ComprobanteVenta.findByIdAndUpdate(
      id,
      updatedComprobanteVentaData,
      {
        new: true,
        runValidators: true,
        session
      }
    );

    if (!updatedComprobanteVenta) {
      throw new Error('❌ Error al actualizar el comprobante de venta.');
    }

    await session.commitTransaction();

    return res.status(200).json({
      ok: true,
      data: updatedComprobanteVenta,
      message: '✔️ Comprobante de venta actualizado correctamente.'
    });

  } catch (err) {
    console.error(err);
    await session.abortTransaction();

    return res.status(500).json({
      ok: false,
      message: err.message || '❌ Error interno del servidor.'
    });

  } finally {
    session.endSession();
  }
};


const deleteComprobanteVenta = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente.'
        })
        return
    }

    const deletedComprobanteVenta = await ComprobanteVenta.findByIdAndUpdate(
        id,
        {   
            estado:false
        },
        { new: true , runValidators: true }
    )
    if(!deletedComprobanteVenta){
        res.status(400).json({
            ok:false,
            message: '❌ Error durante el borrado.'
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
        message:'✔️ Comprobante de venta eliminado correctamente.',
    })
}

const buscarComprobanteVenta = async (req, res) => {
  try {
    const comprobanteID = req.body.comprobanteVentaID;
    const clienteP = req.body.cliente;
    const detallesP = req.body.detalles || [];
    const notaPedidoP = req.body.notaPedido;
    const totalP = Number(req.body.total) || 0;
    const fechaP = req.body.fecha ? new Date(req.body.fecha) : null;

    // 1️⃣ Buscar notas de pedido del cliente (si hay cliente seleccionado)
    let notasPedidoCliente = [];
    if (clienteP) {
      notasPedidoCliente = await NotaPedido.find({ cliente: clienteP }).select("_id");
    }

    const idsNotasCliente = notasPedidoCliente.map(np => String(np._id));

    // 2️⃣ Buscar los comprobantes según productos (si hay detalles)
    const productosBuscados = detallesP.length > 0
      ? detallesP.map(d => d.producto)
      : [];

    let detallesFiltrados = [];
    if (productosBuscados.length > 0) {
      detallesFiltrados = await ComprobanteVentaDetalle.find({
        producto: { $in: productosBuscados },
      });
    } if (productosBuscados.length > 0 && detallesFiltrados.length === 0) {
        res.status(500).json({ ok: false, message: "Error al buscar presupuestos" });       
    } else {
      detallesFiltrados = await ComprobanteVentaDetalle.find();
    }

    const comprobantesIDs = [
      ...new Set(
        detallesFiltrados
          .map(d => d.comprobanteVenta)
          .filter(id => id !== undefined && id !== null)
      ),
    ];

    let comprobantes = await ComprobanteVenta.find(
      comprobantesIDs.length > 0 ? { _id: { $in: comprobantesIDs } } : {}
    );

    // ⚠️ 3️⃣ Verificar si no hay ningún filtro activo
    const sinFiltrosActivos =
      !comprobanteID &&
      !clienteP &&
      !notaPedidoP &&
      !fechaP &&
      (totalP === 0 || totalP === "") &&
      detallesP.length === 0;

    if (sinFiltrosActivos) {
      console.log("🔄 Búsqueda sin filtros: devolviendo todos los comprobantes");
      return res.status(200).json({ ok: true, data: comprobantes });
    }

    // 4️⃣ Aplicar filtros
    const comprobantesFiltrados = comprobantes.filter(p => {
      const coincideEstado = p.estado === true;
      const coincideComprobante = comprobanteID ? (p._id) === Number(comprobanteID) : true;
      const coincideTotal = totalP ? Number(p.total) === totalP : true;
      const coincideFecha = fechaP
        ? String(new Date(p.fecha).toISOString().split("T")[0]) ===
          String(fechaP.toISOString().split("T")[0])
        : true;
      const coincidePedido = notaPedidoP
        ? String(p.notaPedido) === String(notaPedidoP)
        : true;
      const coincideCliente = clienteP
        ? p.notaPedido && idsNotasCliente.includes(String(p.notaPedido))
        : true;

      return coincideCliente && coincideTotal && coincideEstado &&
             coincideFecha && coincidePedido && coincideComprobante;
    });

    console.log("✅ Comprobantes filtrados:", comprobantesFiltrados.length);

    if (comprobantesFiltrados.length > 0) {
      res.status(200).json({ ok: true, data: comprobantesFiltrados });
    } else {
      res.status(200).json({ ok: false, message: "No se encontraron comprobantes con esos filtros" });
    }

  } catch (error) {
    console.error("❌ Error al buscar comprobantes:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};



module.exports = { setComprobanteVenta , getComprobanteVenta , getComprobanteVentaID , updateComprobanteVenta , deleteComprobanteVenta , buscarComprobanteVenta };
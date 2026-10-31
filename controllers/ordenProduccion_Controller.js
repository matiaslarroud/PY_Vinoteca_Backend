const ProductoInsumo = require('../models/productoInsumo_Model');
const ProductoPicada = require('../models/productoPicada_Model');
const ProductoPicadaDetalle = require('../models/productoPicadaDetalle_Model');
const OrdenProduccion = require('../models/ordenProduccion_Model');
const OrdenProduccionDetalle = require("../models/ordenProduccionDetalle_Model");
const getNextSequence = require("../controllers/counter_Controller");
const mongoose = require('mongoose');

const { obtenerFechaHoy } = require('../utils/fecha');


const setOrdenProduccionDetalle = async ({
    picadaOrden ,
    cantidadOrden ,
    ordenProduccion ,
    session
}) => {
    

    if( !picadaOrden || !cantidadOrden || !ordenProduccion ){
        throw new Error ("❌ Faltan completar algunos campos obligatorios.")
    }
    const newId = await getNextSequence("OrdenProduccionDetalle");
    const newOrdenDetalle = new OrdenProduccionDetalle ({
        _id: newId,
        picada: picadaOrden,
        cantidad: cantidadOrden,
        ordenProduccion : ordenProduccion,
        estado:true
    });
    await newOrdenDetalle.save({session})
    
    return newOrdenDetalle;
}

const setOrdenProduccion = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const fechaOrden = obtenerFechaHoy();
    const {
      fechaElaboracion: fechaElaboracionOrden,
      fechaEntrega: fechaEntregaOrden,
      empleado: empleadoOrden,
      detalles
    } = req.body;

    if (
      !fechaOrden ||
      !fechaElaboracionOrden ||
      !fechaEntregaOrden ||
      !empleadoOrden ||
      !detalles
    ) {
      throw new Error("❌ Faltan completar algunos campos obligatorios.");
    }

    const newId = await getNextSequence("OrdenProduccion");

    const newOrden = new OrdenProduccion({
      _id: newId,
      fecha: fechaOrden,
      fechaElaboracion: fechaElaboracionOrden,
      fechaEntrega: fechaEntregaOrden,
      empleado: empleadoOrden,
      estadoProduccion: false,
      estado: true
    });

    await newOrden.save({ session });

    for (const item of detalles) {
      await setOrdenProduccionDetalle({
        picadaOrden: item.picada,
        cantidadOrden: item.cantidad,
        ordenProduccion: newOrden._id,
        session
      });
    }

    await session.commitTransaction();

    return res.status(201).json({
      ok: true,
      message: "✔️ Orden de producción agregada correctamente.",
      data: newOrden
    });

  } catch (error) {
    await session.abortTransaction();

    return res.status(400).json({
      ok: false,
      message: error.message || "❌ Error al agregar orden de producción."
    });

  } finally {
    session.endSession();
  }
};

const getOrdenProduccion = async(req,res) => {
    const ordenes = await OrdenProduccion.find({estado:true}).lean();
    res.status(200).json({
        ok:true,
        data:ordenes,
    })
}

const getOrdenProduccionID = async(req,res) => {
    const id = req.params.id;
    if(!id) {
        res.status(400).json({ok:false, message:"❌ El id no llego al controlador correctamente."})
        return
    }
    
    const orden = await OrdenProduccion.findById(id);
    if (!orden) {
        res.status(400).json({ok:false, message:"❌ El id no corresponde a una orden de produccion."});
        return
    }
    res.status(200).json({
        ok:true,
        message:"✔️ Orden obtenida correctamente.",
        data: orden
    })
}
const updateOrdenProduccion = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { id } = req.params;
    const {
      fechaElaboracion: fechaElaboracionOrden,
      fechaEntrega: fechaEntregaOrden,
      empleado: empleadoOrden,
      detalles
    } = req.body;

    if (!id) {
      throw new Error("❌ El id no llegó al controlador correctamente.");
    }

    if (!fechaElaboracionOrden || !fechaEntregaOrden || !empleadoOrden) {
      throw new Error("❌ Faltan completar algunos campos obligatorios.");
    }

    if (!Array.isArray(detalles) || detalles.length === 0) {
      throw new Error("❌ La orden de producción debe tener al menos un detalle.");
    }

    // Una orden finalizada ya movió stock: no se puede modificar.
    const ordenActual = await OrdenProduccion.findOne({ _id: id, estado: true }).session(session).lean();
    if (!ordenActual) {
      throw new Error("❌ No se encontró la orden de producción.");
    }
    if (ordenActual.estadoProduccion) {
      throw new Error("❌ La orden de producción ya fue finalizada y no se puede modificar.");
    }

    // 1️⃣ Actualizar cabecera (la fecha de emisión no cambia)
    const updatedOrden = await OrdenProduccion.findByIdAndUpdate(
      id,
      {
        fechaElaboracion: fechaElaboracionOrden,
        fechaEntrega: fechaEntregaOrden,
        empleado: empleadoOrden
      },
      {
        new: true,
        runValidators: true,
        session
      }
    );

    if (!updatedOrden) {
      throw new Error("❌ No se encontró la orden de producción.");
    }

    // 2️⃣ Eliminar detalles anteriores
    await OrdenProduccionDetalle.deleteMany(
      { ordenProduccion: id },
      { session }
    );

    // 3️⃣ Crear nuevos detalles
    for (const item of detalles) {
      await setOrdenProduccionDetalle({
        picadaOrden: item.picada,
        cantidadOrden: item.cantidad,
        ordenProduccion: id,
        session
      });
    }

    await session.commitTransaction();

    return res.status(200).json({
      ok: true,
      message: "✔️ Orden de producción actualizada correctamente.",
      data: updatedOrden
    });

  } catch (error) {
    await session.abortTransaction();

    return res.status(400).json({
      ok: false,
      message: error.message || "❌ Error al actualizar la orden de producción."
    });

  } finally {
    session.endSession();
  }
};



const deleteOrdenProduccion = async (req , res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:"❌ Error al eliminar orden de producción."
        })
        return
    }

    const orden = await OrdenProduccion.find({_id:id , estado:true}).lean();
    
    if(orden.length === 0){
        res.status(400).json({
            ok:false,
            message:"❌ Error al eliminar orden de producción."
        })
        return
    }

    const ordenFinalizada = await OrdenProduccion.find({_id:id , estado:true , estadoProduccion:true}).lean();
    
    if(ordenFinalizada.length !== 0){
        res.status(400).json({
            ok:false,
            message:"❌ Error al eliminar. Esta orden ya fue finalizada."
        })
        return
    }

    const deletedOrden = await OrdenProduccion.findByIdAndUpdate(
            id, 
            {
                estado:false
            },
            { new: true , runValidators: true }
        )
    if(!deletedOrden) {
        res.status(400).json({ok:false,message:"❌ Error al eliminar orden de produccion."});
        return
    }
    const deletedOrdenDetalle = await OrdenProduccionDetalle.deleteMany({ordenProduccion:id});
    if(!deletedOrdenDetalle){
        res.status(400).json({
            ok:false,
            message: '❌ Error durante el borrado de los detalles de la orden de produccion.'
        })
        return
    }
    res.status(200).json({ok:true , message:"✔️ Orden de produccion eliminada correctamente."});
}

// Error con el detalle de insumos faltantes, para responder 400 con la lista.
class StockInsuficienteError extends Error {
  constructor(faltantes) {
    super("Stock insuficiente para finalizar la orden de producción.");
    this.faltantes = faltantes;
  }
}

// Finaliza una orden de producción: suma stock de picadas y descuenta los insumos usados.
// Todo ocurre en una transacción, y la orden se "toma" con un update condicional
// (estadoProduccion: false → true), así un doble clic o un reintento no duplica el stock.
const updateStock_Picada_Insumos = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    let ordenFinalizada;
    await session.withTransaction(async () => {
      const ordenID = Number(req.params.id);

      ordenFinalizada = await OrdenProduccion.findOneAndUpdate(
        { _id: ordenID, estado: true, estadoProduccion: { $ne: true } },
        { estadoProduccion: true },
        { new: true, session }
      );
      if (!ordenFinalizada) {
        const existe = await OrdenProduccion.exists({ _id: ordenID, estado: true }).session(session);
        throw Object.assign(
          new Error(existe ? "La orden ya fue finalizada." : "Orden no encontrada."),
          { status: existe ? 409 : 404 }
        );
      }

      const detalles = await OrdenProduccionDetalle.find({ ordenProduccion: ordenID, estado: true })
        .session(session).lean();
      if (detalles.length === 0) {
        throw Object.assign(new Error("La orden no tiene detalles."), { status: 400 });
      }

      // Insumos requeridos por todas las picadas de la orden (consultas en lote, sin N+1).
      const picadaIDs = detalles.map(d => d.picada);
      const recetas = await ProductoPicadaDetalle.find({ picada: { $in: picadaIDs }, estado: true })
        .session(session).lean();
      const requeridos = new Map(); // insumoID -> cantidad
      for (const det of detalles) {
        for (const r of recetas.filter(r => Number(r.picada) === Number(det.picada))) {
          const id = Number(r.insumo);
          requeridos.set(id, (requeridos.get(id) || 0) + det.cantidad * r.cantidad);
        }
      }

      const insumos = await ProductoInsumo.find({ _id: { $in: [...requeridos.keys()] } }, 'name stock')
        .session(session).lean();
      const faltantes = insumos
        .filter(i => i.stock < requeridos.get(i._id))
        .map(i => ({
          insumoID: i._id,
          insumoNombre: i.name,
          requerido: requeridos.get(i._id),
          disponible: i.stock,
          faltante: requeridos.get(i._id) - i.stock,
        }));
      if (faltantes.length > 0) throw new StockInsuficienteError(faltantes);

      // Descuento condicional: si otra operación consumió el insumo en el medio, falla y se revierte todo.
      for (const [insumoID, cantidad] of requeridos) {
        const r = await ProductoInsumo.updateOne(
          { _id: insumoID, stock: { $gte: cantidad } },
          { $inc: { stock: -cantidad } },
          { session }
        );
        if (r.matchedCount === 0) throw new StockInsuficienteError([{ insumoID, requerido: cantidad }]);
      }

      for (const det of detalles) {
        await ProductoPicada.updateOne({ _id: det.picada }, { $inc: { stock: det.cantidad } }, { session });
      }
    });

    return res.json({
      ok: true,
      message: "Orden finalizada. Stock de picadas incrementado y stock de insumos descontado.",
      data: ordenFinalizada,
    });
  } catch (error) {
    if (error instanceof StockInsuficienteError) {
      return res.status(400).json({ ok: false, message: error.message, faltantes: error.faltantes });
    }
    if (error.status) {
      return res.status(error.status).json({ ok: false, message: error.message });
    }
    console.error("Error al procesar producción:", error);
    res.status(500).json({ ok: false, message: "Error al procesar la orden de producción." });
  } finally {
    session.endSession();
  }
};

module.exports = {setOrdenProduccion , getOrdenProduccion , getOrdenProduccionID , updateOrdenProduccion, updateStock_Picada_Insumos , deleteOrdenProduccion};
const ProductoInsumo = require('../models/productoInsumo_Model');
const ProductoPicada = require('../models/productoPicada_Model');
const ProductoPicadaDetalle = require('../models/productoPicadaDetalle_Model');
const OrdenProduccion = require('../models/ordenProduccion_Model');
const OrdenProduccionDetalle = require("../models/ordenProduccionDetalle_Model");
const getNextSequence = require("../controllers/counter_Controller");
const mongoose = require('mongoose');

const obtenerFechaHoy = () => {
  const hoy = new Date();
  return hoy.toISOString().split("T")[0];
}


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

    const fechaOrden = obtenerFechaHoy();

    if (!id) {
      throw new Error("❌ El id no llegó al controlador correctamente.");
    }

    if (!fechaElaboracionOrden || !fechaEntregaOrden || !empleadoOrden) {
      throw new Error("❌ Faltan completar algunos campos obligatorios.");
    }

    if (!Array.isArray(detalles) || detalles.length === 0) {
      throw new Error("❌ La orden de producción debe tener al menos un detalle.");
    }

    // 1️⃣ Actualizar cabecera
    const updatedOrden = await OrdenProduccion.findByIdAndUpdate(
      id,
      {
        fecha: fechaOrden,
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

const updateStock_Picada_Insumos = async (req, res) => {
  try {
    const ordenID = req.params.id;

    // Buscar la orden
    const orden = await OrdenProduccion.findById(ordenID);
    if (!orden) {
      return res.status(404).json({ ok: false, message: "Orden no encontrada." });
    }

    // Buscar los detalles
    const detalles = await OrdenProduccionDetalle.find({ 
      ordenProduccion: ordenID,
      estado: true
    });

    if (detalles.length === 0) {
      return res.status(404).json({ ok: false, message: "La orden no tiene detalles." });
    }

    // ======================================================
    // VALIDACIÓN PREVIA: AGRUPAR INSUMOS Y SUMAR REQUERIDOS
    // ======================================================
    const requeridosTotales = {};  // insumoID -> { nombre, requerido }

    for (const det of detalles) {

      const picada = await ProductoPicada.findById(det.picada);
      if (!picada) continue;

      const picadaDetalles = await ProductoPicadaDetalle.find({
        picada: picada._id,
        estado: true,
      });

      for (const pd of picadaDetalles) {
        const insumo = await ProductoInsumo.findById(pd.insumo);
        if (!insumo) continue;

        const cantidadNecesaria = det.cantidad * pd.cantidad;

        if (!requeridosTotales[insumo._id]) {
          requeridosTotales[insumo._id] = {
            insumoID: insumo._id,
            insumoNombre: insumo.name,
            requerido: 0,
            disponible: insumo.stock
          };
        }

        // Sumar total requerido
        requeridosTotales[insumo._id].requerido += cantidadNecesaria;
      }
    }

    // Verificar faltantes
    const faltantes = Object.values(requeridosTotales).filter(i => i.disponible < i.requerido);

    if (faltantes.length > 0) {
      return res.status(400).json({
        ok: false,
        message: "Stock insuficiente para finalizar la orden de producción.",
        faltantes: faltantes.map(f => ({
          insumoID: f.insumoID,
          insumoNombre: f.insumoNombre,
          requerido: f.requerido,
          disponible: f.disponible,
          faltante: f.requerido - f.disponible,
        })),
      });
    }

    // ======================================================
    // 2️⃣ SI HAY STOCK → ACTUALIZAR STOCK
    // ======================================================
    for (const det of detalles) {

      const picada = await ProductoPicada.findById(det.picada);
      if (!picada) continue;

      // Actualizar stock de la picada
      picada.stock += det.cantidad;
      await picada.save();

      const picadaDetalles = await ProductoPicadaDetalle.find({
        picada: picada._id,
        estado: true
      });

      for (const pd of picadaDetalles) {

        const insumo = await ProductoInsumo.findById(pd.insumo);
        if (!insumo) continue;

        const cantidadConsumida = det.cantidad * pd.cantidad;

        insumo.stock -= cantidadConsumida;
        await insumo.save();
      }
    }

    // Marcar orden como finalizada
    orden.estadoProduccion = true;
    await orden.save();

    return res.json({
      ok: true,
      message: "Orden finalizada. Stock de picadas incrementado y stock de insumos descontado.",
      data: orden,
    });

  } catch (error) {
    console.error("Error al procesar producción:", error);
    res.status(500).json({ ok: false, message: "Error al procesar la orden de producción." });
  }
};






module.exports = {setOrdenProduccion , getOrdenProduccion , getOrdenProduccionID , updateOrdenProduccion, updateStock_Picada_Insumos , deleteOrdenProduccion};
const ComprobanteCompra = require("../models/proveedorComprobanteCompra_Model");
const ComprobanteCompraDetalle = require("../models/proveedorComprobanteCompraDetalle_Model");
const OrdenCompra = require("../models/proveedorOrdenCompra_Model");
const OrdenCompraDetalle = require("../models/proveedorOrdenCompraDetalle_Model");
const Remito = require("../models/proveedorRemito_Model");
const Proveedor = require("../models/proveedor_Model");
const getNextSequence = require("./counter_Controller");
const mongoose = require('mongoose');

const obtenerFechaHoy = () => {
  const hoy = new Date();
  return hoy.toISOString().split("T")[0];
}

const setComprobanteCompraDetalle = async ({
    comprobanteCompra,
    producto,
    cantidad,
    importe,
    precio,
    session
}) => {

    if (!comprobanteCompra || !producto || !cantidad || !importe || !precio) {
        throw new Error("❌ Faltan completar algunos campos obligatorios.");
    }

    // 🔹 Buscar comprobante
    const comprobante = await ComprobanteCompra
        .findById(comprobanteCompra)
        .session(session)
        .lean();

    if (!comprobante) {
        throw new Error("❌ Error al cargar detalle de comprobante de compra.");
    }

    // 🔹 Buscar detalle de la OC para este producto
    const detalleOC = await OrdenCompraDetalle.findOne({
        ordenCompra: comprobante.ordenCompra,
        producto,
        estado: true
    }).session(session).lean();

    if (!detalleOC) {
        throw new Error("❌ El producto no forma parte de la Orden de Compra.");
    }

    // 🔹 Calcular cuánto ya fue entregado para este producto
    const comprobantes = await ComprobanteCompra.find({
        ordenCompra: comprobante.ordenCompra,
        estado: true
    }).session(session).lean();

    const idsComprobantes = comprobantes.map(c => c._id);

    const entregasPrevias = await ComprobanteCompraDetalle.find({
        comprobanteCompra: { $in: idsComprobantes },
        producto,
        estado: true
    }).session(session).lean();

    const totalEntregado = entregasPrevias.reduce(
        (acc, det) => acc + Number(det.cantidad),
        0
    );

    const totalPedido = Number(detalleOC.cantidad);
    const cantidadNueva = Number(cantidad);

    // 🚨 VALIDACIÓN CLAVE
    if (totalEntregado + cantidadNueva > totalPedido) {
        const maxPermitido = totalPedido - totalEntregado;

        throw new Error(
            `❌ La cantidad ingresada supera lo pedido en la Orden de Compra.\n` +
            `📦 Pedido: ${totalPedido}\n` +
            `✔️ Entregado: ${totalEntregado}\n` +
            `➡️ Máximo permitido: ${maxPermitido}`
        );
    }

    // 🔹 Crear detalle
    const newId = await getNextSequence("Proveedor_ComprobanteCompraDetalle");

    const newDetalle = new ComprobanteCompraDetalle({
        _id: newId,
        comprobanteCompra,
        producto,
        cantidad: cantidadNueva,
        importe,
        precio,
        estado: true
    });

    await newDetalle.save({ session });

    return newDetalle;
};



const setComprobanteCompra = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const total = req.body.total;
        const fecha = obtenerFechaHoy();
        const ordenCompra = req.body.ordenCompra;
        const detalles = req.body.detalles; // array

        if (!total || !fecha || !ordenCompra || !detalles?.length) {
            throw new Error("❌ Faltan completar algunos campos obligatorios.");
        }

        // 🔹 Crear cabecera
        const newId = await getNextSequence("Proveedor_ComprobanteCompra");

        const newComprobanteCompra = new ComprobanteCompra({
            _id: newId,
            total,
            fecha,
            ordenCompra,
            estado: true
        });

        await newComprobanteCompra.save({ session });

        // 🔹 Crear detalles
        for (const item of detalles) {
            await setComprobanteCompraDetalle({
                comprobanteCompra: newComprobanteCompra._id,
                producto: item.producto,
                cantidad: item.cantidad,
                importe: item.importe,
                precio: item.precio,
                session
            });
        }

        // =====================================================
        //   VERIFICAR SI LA ORDEN DE COMPRA QUEDA COMPLETA
        // =====================================================

        const detallesOC = await OrdenCompraDetalle.find({
            ordenCompra,
            estado: true
        }).session(session).lean();

        const comprobantes = await ComprobanteCompra.find({
            ordenCompra,
            estado: true
        }).session(session).lean();

        const idsComprobantes = comprobantes.map(c => c._id);

        const entregas = await ComprobanteCompraDetalle.find({
            comprobanteCompra: { $in: idsComprobantes },
            estado: true
        }).session(session).lean();

        // Mapa entregas
        const mapaEntregas = {};
        for (const det of entregas) {
            mapaEntregas[det.producto] =
                (mapaEntregas[det.producto] || 0) + Number(det.cantidad);
        }

        let ordenCompleta = true;

        for (const det of detallesOC) {
            const entregado = mapaEntregas[det.producto] || 0;
            if (entregado < det.cantidad) {
                ordenCompleta = false;
                break;
            }
        }

        await OrdenCompra.findByIdAndUpdate(
            ordenCompra,
            { completo: ordenCompleta },
            { session }
        );

        // ✅ Commit
        await session.commitTransaction();

        res.status(201).json({
            ok: true,
            message: "✔️ Comprobante de compra agregado correctamente.",
            data: newComprobanteCompra
        });

    } catch (error) {
        // ❌ Rollback
        await session.abortTransaction();

        res.status(400).json({
            ok: false,
            message: "❌ Error al agregar comprobante de compra.",
            error: error.message
        });

    } finally {
        session.endSession();
    }
};


const getComprobanteCompra = async (req, res) => {
  try {
    const comprobantes = await ComprobanteCompra.find({ estado: true }).lean();

    const remitos = await Remito.find().lean();

    const comprobantesConRemito = new Set(
      remitos.map(c => String(c.comprobanteCompra))
    );

    const comprobantesConEstado = comprobantes.map(oc => ({
      ...oc,
      tieneRemito: comprobantesConRemito.has(String(oc._id))
    }));

    res.status(200).json({
      ok: true,
      data: comprobantesConEstado
    });

  } catch (error) {
    console.error("❌ Error al obtener comprobantes de compra:", error);

    res.status(500).json({
      ok: false,
      message: "❌ Error interno al obtener las comprobantes de compra."
    });
  }
};

const getComprobanteCompraID = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        ok: false,
        message: "❌ El ID no llegó correctamente al controlador.",
      });
    }

    // Buscar comprobante principal
    const comprobanteCompra = await ComprobanteCompra.findById(id);
    if (!comprobanteCompra) {
      return res.status(404).json({
        ok: false,
        message: "❌ No se encontró el comprobante de compra solicitado.",
      });
    }

    // Buscar orden de compra asociada
    const ordenCompra = await OrdenCompra.findById(comprobanteCompra.ordenCompra);
    if (!ordenCompra) {
      return res.status(404).json({
        ok: false,
        message: "❌ La orden de compra asociada no fue encontrada.",
      });
    }

    // Buscar proveedor asociado a la orden de compra
    const proveedor = await Proveedor.findById(ordenCompra.proveedor);

    // Buscar detalles del comprobante
    const detalles = await ComprobanteCompraDetalle.find({
      comprobanteCompra: comprobanteCompra._id,
    })


    // Construir respuesta
    const body = {
      _id: comprobanteCompra._id,
      fecha: comprobanteCompra.fecha,
      ordenCompra: Number(comprobanteCompra.ordenCompra),
      medioPago: Number(ordenCompra.medioPago),
      total: comprobanteCompra.total,
      proveedor: proveedor
        ? {
            _id: Number(proveedor._id),
            name: proveedor.name,
          }
        : null,
    };
    res.status(200).json({
      ok: true,
      message: "✔️ Comprobante de compra obtenido correctamente.",
      data: body,
    });
  } catch (err) {
    console.error("❌Error al obtener comprobante de compra:", err);
    res.status(500).json({
      ok: false,
      message: "❌Error interno del servidor al obtener el comprobante de compra.",
      error: err.message,
    });
  }
};

const getComprobantesByProveedor = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        ok: false,
        message: "❌ El ID no llegó correctamente al controlador.",
      });
    }

    // 1️⃣ Obtener las órdenes de compra del proveedor
    const ordenesCompra = await OrdenCompra.find({ estado: true, proveedor: id });

    if (!ordenesCompra || ordenesCompra.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "❌ No se encontraron órdenes de este proveedor.",
      });
    }

    // 2️⃣ Extraer los IDs de esas órdenes
    const ordenesIDs = ordenesCompra.map(s => s._id);

    // 3️⃣ Buscar comprobantes de compra que usen esas órdenes
    const comprobantes = await ComprobanteCompra.find({
      ordenCompra: { $in: ordenesIDs } ,
      estado:true
    });

    // 4️⃣ Verificar si existen
    if (!comprobantes || comprobantes.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "❌ No se encontraron comprobantes de compra para este proveedor.",
      });
    }

    // 5️⃣ Devolverlos
    res.status(200).json({
      ok: true,
      message:'✔️ Comprobantes de compra obtenidos correctamente.',
      data: comprobantes
    });

  } catch (err) {
    console.error("❌ Error al obtener comprobantes de compra:", err);
    res.status(500).json({
      ok: false,
      message: "❌ Error interno del servidor al obtener los comprobantes de compra.",
      error: err.message,
    });
  }
};

const getComprobantesSinRemitoByProveedor = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        ok: false,
        message: "❌ El ID no llegó correctamente al controlador.",
      });
    }

    // 1️⃣ Obtener todas las órdenes del proveedor
    const ordenesCompra = await OrdenCompra.find({ estado: true, proveedor: id });

    if (!ordenesCompra || ordenesCompra.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "❌ No se encontraron órdenes de compra para este proveedor.",
      });
    }

    // 2️⃣ Obtener los IDs
    const ordenesIDs = ordenesCompra.map(o => o._id);

    // 3️⃣ Obtener los comprobantes asociados
    const comprobantes = await ComprobanteCompra.find({
      ordenCompra: { $in: ordenesIDs },
      estado: true
    });

    if (!comprobantes || comprobantes.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "❌ Este proveedor no tiene comprobantes de compra.",
      });
    }

    const comprobantesIDs = comprobantes.map(c => c._id);

    // 4️⃣ Buscar remitos que usen esos comprobantes
    const remitos = await Remito.find({
      comprobanteCompra: { $in: comprobantesIDs },
      estado: true
    });

    // IDs de comprobantes que YA tienen remito
    const comprobantesConRemitoIDs = new Set(
      remitos.map(r => String(r.comprobanteCompra))
    );

    // 5️⃣ Filtrar comprobantes que NO están en ningún remito
    const comprobantesSinRemito = comprobantes.filter(c => {
      return !comprobantesConRemitoIDs.has(String(c._id));
    });

    if (comprobantesSinRemito.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "❌ Todos los comprobantes ya tienen remito asociado.",
      });
    }

    // 6️⃣ Respuesta final
    res.status(200).json({
      ok: true,
      message: "✔️ Comprobantes sin remito obtenidos correctamente.",
      data: comprobantesSinRemito
    });

  } catch (err) {
    console.error("❌ Error al obtener comprobantes sin remito:", err);
    res.status(400).json({
      ok: false,
      message: "❌ Error interno del servidor al obtener comprobantes sin remito.",
      error: err.message,
    });
  }
};


const updateComprobanteCompra = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const id = req.params.id;
        const total = req.body.total;
        const fecha = req.body.fecha;
        const ordenCompra = req.body.ordenCompra;
        const detalles = req.body.detalles; // opcional

        if (!id) {
            throw new Error("❌ El id no llegó al controlador correctamente.");
        }

        if (!total || !ordenCompra) {
            throw new Error("❌ Faltan completar algunos campos obligatorios.");
        }

        // 🔹 Actualizar cabecera
        const updatedComprobanteCompra = await ComprobanteCompra.findByIdAndUpdate(
            id,
            {
                total,
                fecha,
                ordenCompra
            },
            {
                new: true,
                runValidators: true,
                session
            }
        );

        if (!updatedComprobanteCompra) {
            throw new Error("❌ Error al actualizar el comprobante de compra.");
        }

        // 🔹 (OPCIONAL) Actualizar detalles
        if (Array.isArray(detalles)) {

            // Baja lógica de detalles actuales
            await ComprobanteCompraDetalle.updateMany(
                { comprobanteCompra: id, estado: true },
                { estado: false },
                { session }
            );

            // Crear nuevos detalles
            for (const item of detalles) {
                await setComprobanteCompraDetalle({
                    comprobanteCompra: id,
                    producto: item.producto,
                    cantidad: item.cantidad,
                    importe: item.importe,
                    precio: item.precio,
                    session
                });
            }
        }

        // =====================================================
        //   REVERIFICAR SI LA ORDEN DE COMPRA QUEDA COMPLETA
        // =====================================================

        const detallesOC = await OrdenCompraDetalle.find({
            ordenCompra,
            estado: true
        }).session(session).lean();

        const comprobantes = await ComprobanteCompra.find({
            ordenCompra,
            estado: true
        }).session(session).lean();

        const idsComprobantes = comprobantes.map(c => c._id);

        const entregas = await ComprobanteCompraDetalle.find({
            comprobanteCompra: { $in: idsComprobantes },
            estado: true
        }).session(session).lean();

        const mapaEntregas = {};
        for (const det of entregas) {
            mapaEntregas[det.producto] =
                (mapaEntregas[det.producto] || 0) + Number(det.cantidad);
        }

        let ordenCompleta = true;

        for (const det of detallesOC) {
            const entregado = mapaEntregas[det.producto] || 0;
            if (entregado < det.cantidad) {
                ordenCompleta = false;
                break;
            }
        }

        await OrdenCompra.findByIdAndUpdate(
            ordenCompra,
            { completo: ordenCompleta },
            { session }
        );

        // ✅ Commit
        await session.commitTransaction();

        res.status(200).json({
            ok: true,
            data: updatedComprobanteCompra,
            message: "✔️ Comprobante de compra actualizado correctamente."
        });

    } catch (error) {
        // ❌ Rollback
        await session.abortTransaction();

        res.status(400).json({
            ok: false,
            message: "❌ Error al actualizar el comprobante de compra.",
            error: error.message
        });

    } finally {
        session.endSession();
    }
};


//Validaciones de eliminacion
const ProveedorRemito = require("../models/proveedorRemito_Model");

const deleteComprobanteCompra = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente.'
        })
        return
    }

    const remitos = await ProveedorRemito.find({comprobanteCompra:id , estado:true}).lean();
    
    if(remitos.length !== 0 ){
        res.status(400).json({
            ok:false,
            message:"❌ Error al eliminar. Existen tablas relacionadas a este comprobante de compra."
        })
        return
    }

    const deletedComprobanteCompra = await ComprobanteCompra.findByIdAndUpdate(
        id,
        {   
            estado:false
        },
        { new: true , runValidators: true }
    )
;
    if(!deletedComprobanteCompra){
        res.status(400).json({
            ok:false,
            message: '❌ Error durante el borrado.'
        })
        return
    }
    const deletedComprobanteCompraDetalle = await ComprobanteCompraDetalle.updateMany(
        {comprobanteCompra:id},
        {   
            estado:false
        },
        { new: true , runValidators: true }
    )
    
    if(!deletedComprobanteCompraDetalle){
        res.status(400).json({
            ok:false,
            message: '❌ Error durante el borrado del detalle.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'✔️ Comprobante de compra eliminado correctamente.'
    })
}

// const { comprobanteCompraID , proveedor, ordenCompra , total , detalles } = req.body;
const buscarComprobanteCompra = async (req, res) => {
  try {
    const comprobanteCompraID = req.body.comprobanteCompraID;
    const proveedor = req.body.proveedor;
    const detalles = req.body.detalles || [];
    const ordenCompra = req.body.ordenCompra;
    const total = Number(req.body.total) || 0;
    const fechaP = req.body.fecha ? new Date(req.body.fecha) : null;

    // 1️⃣ Buscar notas de pedido del cliente (si hay cliente seleccionado)
    let ordenesCompraProveedor = [];
    if (proveedor) {
      ordenesCompraProveedor = await OrdenCompra.find({estado:true, proveedor: proveedor }).select("_id");
    }

    const idsOrdenesProveedor = ordenesCompraProveedor.map(np => String(np._id));

    // 2️⃣ Buscar los comprobantes según productos (si hay detalles)
    const productosBuscados = detalles.length > 0
      ? detalles.map(d => d.producto)
      : [];

    let detallesFiltrados = [];
    if (productosBuscados.length > 0) {
      detallesFiltrados = await ComprobanteCompraDetalle.find({
        producto: { $in: productosBuscados },
      });
    } if (productosBuscados.length > 0 && detallesFiltrados.length === 0) {
        res.status(500).json({ ok: false, message: "❌ Error al buscar presupuestos" });       
    } else {
      detallesFiltrados = await ComprobanteCompraDetalle.find();
    }

    const comprobantesIDs = [
      ...new Set(
        detallesFiltrados
          .map(d => d.comprobanteCompra)
          .filter(id => id !== undefined && id !== null)
      ),
    ];

    let comprobantes = await ComprobanteCompra.find(
      comprobantesIDs.length > 0 ? { _id: { $in: comprobantesIDs } } : {}
    );

    // ⚠️ 3️⃣ Verificar si no hay ningún filtro activo
    const sinFiltrosActivos =
      !comprobanteCompraID &&
      !proveedor &&
      !ordenCompra &&
      !fechaP &&
      (total === 0 || total === "") &&
      detalles.length === 0;

    if (sinFiltrosActivos) {
      return res.status(200).json({ ok: true, data: comprobantes });
    }

    // 4️⃣ Aplicar filtros
    const comprobantesFiltrados = comprobantes.filter(p => {
      const coincideEstado = p.estado === true;
      const coincideComprobante = comprobanteCompraID ? (p._id) === Number(comprobanteCompraID) : true;
      const coincideTotal = total ? Number(p.total) === total : true;
      const coincideFecha = fechaP
        ? String(new Date(p.fecha).toISOString().split("T")[0]) ===
          String(fechaP.toISOString().split("T")[0])
        : true;
      const coincideOrden = ordenCompra
        ? String(p.ordenCompra) === String(ordenCompra)
        : true;
      const coincideProveedor = proveedor
        ? p.ordenCompra && idsOrdenesProveedor.includes(String(p.ordenCompra))
        : true;

      return coincideProveedor && coincideTotal && coincideEstado &&
             coincideFecha && coincideOrden && coincideComprobante;
    });

    if (comprobantesFiltrados.length > 0) {
      res.status(200).json({ ok: true, message: "✔️ Comprobantes de compra obtenidos." , data: comprobantesFiltrados });
    } else {
      res.status(200).json({ ok: false, message: "❌ No se encontraron comprobantes con esos filtros" });
    }

  } catch (error) {
    console.error("❌ Error al buscar comprobantes:", error);
    res.status(500).json({ ok: false, message: "❌ Error interno del servidor" });
  }
}; 


module.exports = { setComprobanteCompra , buscarComprobanteCompra , getComprobantesByProveedor, getComprobantesSinRemitoByProveedor , getComprobanteCompra , getComprobanteCompraID , updateComprobanteCompra , deleteComprobanteCompra };
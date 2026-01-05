const OrdenCompra = require("../models/proveedorOrdenCompra_Model");
const OrdenCompraDetalle = require("../models/proveedorOrdenCompraDetalle_Model");
const ComprobanteCompra = require("../models/proveedorComprobanteCompra_Model");
const getNextSequence = require("./counter_Controller");
const mongoose = require('mongoose');

const obtenerFechaHoy = () => {
  const hoy = new Date();
  return hoy.toISOString().split("T")[0];
}

const setOrdenCompraDetalle = async ({
    ordenCompra,
    producto,
    cantidad,
    importe,
    precio,
    session
}) => {


    if(!ordenCompra || !producto || !cantidad || !importe || !precio ){
        throw new Error("❌ Faltan completar algunos campos obligatorios.")
    }
    
    const newId = await getNextSequence("Proveedor_OrdenCompraDetalle");
    const newOrdenCompraDetalle = new OrdenCompraDetalle ({
        _id: newId,
        ordenCompra: ordenCompra , 
        producto: producto , 
        cantidad: cantidad , 
        importe: importe ,
        precio : precio,
        estado:true
    });

    await newOrdenCompraDetalle.save({ session });

    return newOrdenCompraDetalle;
}

const setOrdenCompra = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const total = req.body.total;
        const fecha = obtenerFechaHoy();
        const fechaEntrega = new Date(req.body.fechaEntrega);
        const proveedorID = req.body.proveedor;
        const empleadoID = req.body.empleado;
        const medioPagoID = req.body.medioPago;
        const presupuesto = req.body.presupuesto;
        const detalles = req.body.detalles; // array de productos

        if (
            !total ||
            !fecha ||
            !proveedorID ||
            !medioPagoID ||
            !empleadoID ||
            !presupuesto ||
            !fechaEntrega ||
            !detalles?.length
        ) {
            throw new Error("❌ Faltan completar algunos campos obligatorios.");
        }

        // 🔹 Crear cabecera
        const newId = await getNextSequence("Proveedor_OrdenCompra");

        const newOrdenCompra = new OrdenCompra({
            _id: newId,
            total: total,
            fecha: fecha,
            fechaEntrega: fechaEntrega,
            proveedor: proveedorID,
            medioPago: medioPagoID,
            empleado: empleadoID,
            presupuesto: presupuesto,
            completo: false,
            estado: true
        });

        await newOrdenCompra.save({ session });

        // 🔹 Crear detalles
        for (const item of detalles) {
            await setOrdenCompraDetalle({
                ordenCompra: newOrdenCompra._id,
                producto: item.producto,
                cantidad: item.cantidad,
                importe: item.importe,
                precio: item.precio,
                session
            });
        }

        // ✅ Commit
        await session.commitTransaction();

        res.status(201).json({
            ok: true,
            message: "✔️ Orden de compra y detalles guardados correctamente.",
            data: newOrdenCompra
        });

    } catch (error) {
        // ❌ Rollback
        await session.abortTransaction();

        res.status(400).json({
            ok: false,
            message: "❌ Error al agregar orden de compra.",
            error: error.message
        });

    } finally {
        session.endSession();
    }
};


const getOrdenCompra = async (req, res) => {
  try {
    // 1️⃣ Traer todas las órdenes activas
    const ordenes = await OrdenCompra.find({ estado: true }).lean();

    // 2️⃣ Traer todos los comprobantes de compra (solo el campo ordenCompraID)
    const comprobantes = await ComprobanteCompra.find().lean();

    // 3️⃣ Crear un Set con las órdenes que YA tienen comprobantes
    const ordenesConComprobante = new Set(
      comprobantes.map(c => String(c.ordenCompra))
    );

    // 4️⃣ Agregar campo 'tieneComprobante' a cada orden
    const ordenesConEstado = ordenes.map(oc => ({
      ...oc,
      tieneComprobante: ordenesConComprobante.has(String(oc._id))
    }));

    // 5️⃣ Devolver el resultado
    res.status(200).json({
      ok: true,
      data: ordenesConEstado
    });

  } catch (error) {
    console.error("❌ Error al obtener órdenes de compra:", error);

    res.status(500).json({
      ok: false,
      message: "❌ Error interno al obtener las órdenes de compra."
    });
  }
};


const getOrdenCompraID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente',
        })
        return
    }

    const ordenCompra = await OrdenCompra.findById(id);
    if(!ordenCompra){
        res.status(400).json({
            ok:false,
            message:'❌ El id no corresponde a una orden de compra.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        message:"✔️ Orden de compra obtenida correctamente.",
        data:ordenCompra,
    })
}

const updateOrdenCompra = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const id = req.params.id;

        const total = req.body.total;
        const fecha = req.body.fecha;
        const fechaEntrega = req.body.fechaEntrega;
        const proveedorID = req.body.proveedor;
        const empleadoID = req.body.empleado;
        const medioPagoID = req.body.medioPago;
        const presupuesto = req.body.presupuesto;
        const detalles = req.body.detalles; // opcional

        if (!id) {
            throw new Error("❌ El id no llegó al controlador correctamente.");
        }

        if (!total || !fechaEntrega || !proveedorID || !empleadoID || !medioPagoID || !presupuesto) {
            throw new Error("❌ Faltan completar algunos campos obligatorios.");
        }

        // 🔹 Actualizar cabecera
        const updatedOrdenCompra = await OrdenCompra.findByIdAndUpdate(
            id,
            {
                total: total,
                fecha: fecha,
                fechaEntrega: fechaEntrega,
                proveedor: proveedorID,
                medioPago: medioPagoID,
                empleado: empleadoID,
                presupuesto: presupuesto
            },
            {
                new: true,
                runValidators: true,
                session
            }
        );

        if (!updatedOrdenCompra) {
            throw new Error("❌ Error al actualizar la orden de compra.");
        }

        // 🔹 (OPCIONAL) Actualizar detalles
        if (Array.isArray(detalles)) {

            // Baja lógica de detalles actuales
            await OrdenCompraDetalle.updateMany(
                { ordenCompra: id, estado: true },
                { estado: false },
                { session }
            );

            // Crear nuevos detalles
            for (const item of detalles) {
                await setOrdenCompraDetalle({
                    ordenCompra: id,
                    producto: item.producto,
                    cantidad: item.cantidad,
                    importe: item.importe,
                    precio: item.precio,
                    session
                });
            }
        }

        // ✅ Commit
        await session.commitTransaction();

        res.status(200).json({
            ok: true,
            data: updatedOrdenCompra,
            message: "✔️ Orden de compra actualizada correctamente."
        });

    } catch (error) {
        // ❌ Rollback
        await session.abortTransaction();

        res.status(400).json({
            ok: false,
            message: "❌ Error al actualizar la orden de compra.",
            error: error.message
        });

    } finally {
        session.endSession();
    }
};


//Validaciones de eliminacion
const ProveedorComprobanteCompra = require("../models/proveedorComprobanteCompra_Model");

const deleteOrdenCompra = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente.'
        })
        return
    }

    const comprobantes = await ProveedorComprobanteCompra.find({ordenCompra:id , estado:true}).lean();
    
    if(comprobantes.length !== 0 ){
        res.status(400).json({
            ok:false,
            message:"❌ Error al eliminar. Existen tablas relacionadas a esta orden de compra."
        })
        return
    }

    const deletedOrdenCompra = await OrdenCompra.findByIdAndUpdate(
        id,
        {   
            estado:false
        },
        { new: true , runValidators: true }
    )
;
    if(!deletedOrdenCompra){
        res.status(400).json({
            ok:false,
            message: '❌ Error durante el borrado.'
        })
        return
    }
    const deletedOrdenCompraDetalle = await OrdenCompraDetalle.updateMany(
        {ordenCompra:id},
        {   
            estado:false
        },
        { new: true , runValidators: true }
    )
    
    if(!deletedOrdenCompraDetalle){
        res.status(400).json({
            ok:false,
            message: '❌ Error durante el borrado del detalle.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'✔️ Orden de compra eliminada correctamente.'
    })
}

const buscarOrdenCompra = async (req, res) => {
    const { ordenCompraID , fechaEntrega, proveedor, empleado , medioPago , presupuesto , total , detalles } = req.body;
    // 1️⃣ Obtenemos todos los productos que vienen en los detalles
    const productosBuscados = detalles && detalles.length > 0
      ? detalles.map(d => d.producto)
      : [];

    // 2️⃣ Buscamos los PresupuestoDetalle que contengan alguno de esos productos
    let detallesFiltrados = [];
    if (productosBuscados.length > 0) {
      detallesFiltrados = await OrdenCompraDetalle.find({
        producto: { $in: productosBuscados },
      });
    } if (productosBuscados.length > 0 && detallesFiltrados.length === 0) {
        res.status(500).json({ ok: false, message: "❌ Error al buscar presupuestos" });       
    } else if (!detalles) {
      detallesFiltrados = await OrdenCompraDetalle.find();
    }

    // 3️⃣ Obtenemos los IDs únicos de los presupuestos asociados
    const ordenesIDs = [...new Set(detallesFiltrados.map(d => d.ordenCompra))];

    // 4️⃣ Buscamos los presupuestos relacionados
    let ordenes = await OrdenCompra.find(
      ordenesIDs.length > 0 ? { _id: { $in: ordenesIDs } } : {}
    );
    
    // 5️⃣ Filtramos adicionalmente por cliente, empleado o total si existen
    const ordenesFiltrados = ordenes.filter(p => {
      const coincideEstado = p.estado === true;
      const coincideOrden = ordenCompraID ? (p._id) === Number(ordenCompraID) : true;
      const coincideMedioPago = medioPago ? (p.medioPago) === Number(medioPago) : true;
      const coincideTotal = total ? (p.total) === Number(total) : true;
      const coincidePresupuesto = presupuesto ? (p.presupuesto) === Number(presupuesto) : true;
      const coincideProveedor = proveedor ? String(p.proveedor) === String(proveedor) : true;
      const coincideFechaEntrega = fechaEntrega ? new Date(p.fechaEntrega).toISOString().slice(0, 10) === fechaEntrega : true;
      const coincideEmpleado = empleado ? String(p.empleado) === String(empleado) : true;
      return coincideProveedor && coincideEmpleado && coincideOrden && coincideEstado &&
                coincideMedioPago && coincideTotal && coincidePresupuesto && coincideFechaEntrega;
    });
    if(ordenesFiltrados.length > 0){
        res.status(200).json({ ok: true, message: "✔️ Ordenes de compra obtenidas." , data: ordenesFiltrados });
    } else {
        res.status(500).json({ ok: false, message: "❌ Error al buscar ordenes de compra." });
    }
};

module.exports = { setOrdenCompra , buscarOrdenCompra , getOrdenCompra , getOrdenCompraID , updateOrdenCompra , deleteOrdenCompra };
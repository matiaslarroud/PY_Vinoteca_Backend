const Presupuesto = require("../models/proveedorPresupuesto_Model");
const PresupuestoDetalle = require("../models/proveedorPresupuestoDetalle_Model");
const getNextSequence = require("./counter_Controller");
const mongoose = require('mongoose');

const obtenerFechaHoy = () => {
  const hoy = new Date();
  return hoy.toISOString().split("T")[0];
}

const setPresupuestoDetalle = async ({
    importeP,
    precioP,
    cantidadP,
    presupuestoP,
    productoID,
    session
}) => {

    if(!importeP || !presupuestoP || !productoID || !precioP || !cantidadP ){
        throw new Error("❌ Faltan completar algunos campos obligatorios.")
    }
    const newId = await getNextSequence("Cliente_PresupuestoDetalle");
    const newPresupuestoDetalle = new PresupuestoDetalle ({
        _id: newId,
        importe: importeP , presupuesto: presupuestoP , producto: productoID , precio:precioP , cantidad:cantidadP , estado : true
    });

    await newPresupuestoDetalle.save({ session });

    return newPresupuestoDetalle;
}

const setPresupuesto = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const totalP = req.body.total;
        const fechaP = obtenerFechaHoy();
        const proveedorID = req.body.proveedor;
        const empleadoID = req.body.empleado;
        const medioPagoID = req.body.medioPago;
        const solicitudP = req.body.solicitudPresupuesto;
        const detalles = req.body.detalles; // array de productos

        if (!totalP || !fechaP || !proveedorID || !medioPagoID || !empleadoID || !solicitudP || !detalles?.length) {
            throw new Error("❌ Faltan completar algunos campos obligatorios.");
        }

        // 🔹 Crear cabecera
        const newId = await getNextSequence("Proveedor_Presupuesto");

        const newPresupuesto = new Presupuesto({
            _id: newId,
            total: totalP,
            fecha: fechaP,
            proveedor: proveedorID,
            medioPago: medioPagoID,
            empleado: empleadoID,
            estado: true,
            solicitudPresupuesto: solicitudP
        });

        await newPresupuesto.save({ session });

        // 🔹 Crear detalles
        for (const item of detalles) {
            await setPresupuestoDetalle({
                importeP: item.importe,
                precioP: item.precio,
                cantidadP: item.cantidad,
                presupuestoP: newPresupuesto._id,
                productoID: item.producto,
                session
            });
        }

        // ✅ Commit
        await session.commitTransaction();

        res.status(201).json({
            ok: true,
            message: "✔️ Presupuesto y detalles guardados correctamente.",
            data: newPresupuesto
        });

    } catch (error) {
        // ❌ Rollback
        await session.abortTransaction();

        res.status(400).json({
            ok: false,
            message: "❌ Error al agregar presupuesto.",
            error: error.message
        });

    } finally {
        session.endSession();
    }
};


const getPresupuesto = async(req, res) => {
    const presupuestos = await Presupuesto.find({estado:true}).lean();

    res.status(200).json({
        ok:true,
        data: presupuestos,
    })
}

const getPresupuestoID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente',
        })
        return
    }

    const presupuesto = await Presupuesto.findById(id);
    if(!presupuesto){
        res.status(400).json({
            ok:false,
            message:'❌ El id no corresponde a un presupuesto.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        message:"✔️ Presupuesto obtenido correctamente.",
        data:presupuesto,
    })
}

const updatePresupuesto = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const id = req.params.id;

        const totalP = req.body.total;
        const fechaP = req.body.fecha;
        const proveedorID = req.body.proveedor;
        const empleadoID = req.body.empleado;
        const medioPagoID = req.body.medioPago;
        const solicitudP = req.body.solicitudPresupuesto;
        const detalles = req.body.detalles; 

        if (!id) {
            throw new Error("❌ El id no llegó al controlador correctamente.");
        }

        if (!proveedorID || !empleadoID || !totalP || !medioPagoID || !solicitudP) {
            throw new Error("❌ Faltan completar algunos campos obligatorios.");
        }

        // 🔹 Actualizar cabecera
        const updatedPresupuesto = await Presupuesto.findByIdAndUpdate(
            id,
            {
                total: totalP,
                fecha: fechaP,
                proveedor: proveedorID,
                empleado: empleadoID,
                solicitudPresupuesto: solicitudP,
                medioPago: medioPagoID
            },
            {
                new: true,
                runValidators: true,
                session
            }
        );

        if (!updatedPresupuesto) {
            throw new Error("❌ Error al actualizar el presupuesto.");
        }

        // 🔹 (OPCIONAL) Actualizar detalles
        if (Array.isArray(detalles)) {

            // Baja lógica de detalles actuales
            await PresupuestoDetalle.updateMany(
                { presupuesto: id, estado: true },
                { estado: false },
                { session }
            );

            // Crear nuevos detalles
            for (const item of detalles) {
                await setPresupuestoDetalle({
                    importeP: item.importe,
                    precioP: item.precio,
                    cantidadP: item.cantidad,
                    presupuestoP: id,
                    productoID: item.producto,
                    session
                });
            }
        }

        // ✅ Commit
        await session.commitTransaction();

        res.status(200).json({
            ok: true,
            data: updatedPresupuesto,
            message: "✔️ Presupuesto actualizado correctamente."
        });

    } catch (error) {
        // ❌ Rollback
        await session.abortTransaction();

        res.status(400).json({
            ok: false,
            message: "❌ Error al actualizar el presupuesto.",
            error: error.message
        });

    } finally {
        session.endSession();
    }
};


//Validaciones de eliminacion
const ProveedorOrdenCompra = require("../models/proveedorOrdenCompra_Model");

const deletePresupuesto = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌El id no llego al controlador correctamente.'
        })
        return
    }

    const ordenes = await ProveedorOrdenCompra.find({presupuesto:id , estado:true}).lean();
    
    if(ordenes.length !== 0 ){
        res.status(400).json({
            ok:false,
            message:"❌ Error al eliminar. Existen tablas relacionadas a este presupuesto."
        })
        return
    }

    const deletedPresupuesto = await Presupuesto.findByIdAndUpdate(
        id,
        {   
            estado:false
        },
        { new: true , runValidators: true }
    )
;
    if(!deletedPresupuesto){
        res.status(400).json({
            ok:false,
            message: '❌ Error durante el borrado.'
        })
        return
    }
    const deletedPresupuestoDetalle = await PresupuestoDetalle.updateMany(
        {presupuesto:id},
        {   
            estado:false
        },
        { new: true , runValidators: true }
    )
    
    if(!deletedPresupuestoDetalle){
        res.status(400).json({
            ok:false,
            message: '❌ Error durante el borrado del detalle.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'✔️ Presupuesto eliminado correctamente.'
    })
}

const buscarPresupuesto = async (req, res) => {
    const { presupuestoID , proveedor, empleado , medioPago , solicitudPresupuesto , total , detalles } = req.body;
    // 1️⃣ Obtenemos todos los productos que vienen en los detalles
    const productosBuscados = detalles && detalles.length > 0
      ? detalles.map(d => d.producto)
      : [];

    // 2️⃣ Buscamos los PresupuestoDetalle que contengan alguno de esos productos
    let detallesFiltrados = [];
    if (productosBuscados.length > 0) {
      detallesFiltrados = await PresupuestoDetalle.find({
        producto: { $in: productosBuscados },
      });
    } if (productosBuscados.length > 0 && detallesFiltrados.length === 0) {
        res.status(500).json({ ok: false, message: "❌ Error al buscar presupuestos" });       
    } else if (!detalles) {
      detallesFiltrados = await PresupuestoDetalle.find();
    }

    // 3️⃣ Obtenemos los IDs únicos de los presupuestos asociados
    const presupuestosIDs = [...new Set(detallesFiltrados.map(d => d.presupuesto))];

    // 4️⃣ Buscamos los presupuestos relacionados
    let presupuestos = await Presupuesto.find(
      presupuestosIDs.length > 0 ? { _id: { $in: presupuestosIDs } } : {}
    );

    // 5️⃣ Filtramos adicionalmente por cliente, empleado o total si existen
    const presupuestosFiltrados = presupuestos.filter(p => {
      const coincideEstado = p.estado === true;
      const coincidePresupuesto = presupuestoID ? (p._id) === Number(presupuestoID) : true;
      const coincideMedioPago = medioPago ? (p.medioPago) === Number(medioPago) : true;
      const coincideTotal = total ? (p.total) === Number(total) : true;
      const coincideSolicitudPresupuesto = solicitudPresupuesto ? (p.solicitudPresupuesto) === Number(solicitudPresupuesto) : true;
      const coincideProveedor = proveedor ? String(p.proveedor) === String(proveedor) : true;
      const coincideEmpleado = empleado ? String(p.empleado) === String(empleado) : true;
      return coincideProveedor && coincideEmpleado && coincidePresupuesto && coincideEstado &&
                coincideMedioPago && coincideTotal && coincideSolicitudPresupuesto;
    });

    if(presupuestosFiltrados.length > 0){
        res.status(200).json({ ok: true, message: "✔️ Presupuesto obtenidos." , data: presupuestosFiltrados });
    } else {
        res.status(500).json({ ok: false, message: "❌ Error al buscar presupuestos." });
    }
};

module.exports = { setPresupuesto , getPresupuesto , getPresupuestoID , updatePresupuesto , deletePresupuesto , buscarPresupuesto };
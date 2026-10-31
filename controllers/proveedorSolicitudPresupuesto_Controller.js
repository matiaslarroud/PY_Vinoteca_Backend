const SolicitudPresupuesto = require("../models/proveedorSolicitudPresupuesto_Model");
const SolicitudPresupuestoDetalle = require("../models/proveedorSolicitudPresupuestoDetalle_Model");
const Presupuesto = require("../models/proveedorPresupuesto_Model");
const getNextSequence = require("./counter_Controller");
const mongoose = require('mongoose');

const { obtenerFechaHoy } = require('../utils/fecha');

const setSolicitudPresupuestoDetalle = async ({
    cantidadP,
    solicitudPresupuestoP,
    productoID,
    importe,
    session
}) => {    

    if (!solicitudPresupuestoP || !productoID || !cantidadP) {
        throw new Error("❌ Faltan completar algunos campos obligatorios.")
    }

    const newId = await getNextSequence("Proveedor_SolicitudPresupuestoDetalle");

    const newPresupuestoDetalle = new SolicitudPresupuestoDetalle({
        _id: newId,
        solicitudPresupuesto: solicitudPresupuestoP,
        producto: productoID,
        cantidad: cantidadP,
        importe: importe,
        estado: true
    });

    await newPresupuestoDetalle.save({ session });

    return newPresupuestoDetalle;
};

const setSolicitudPresupuesto = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const fechaP = obtenerFechaHoy();
        const proveedorP = req.body.proveedor;
        const empleadoID = req.body.empleado;
        const detalles = req.body.detalles;

        if (!fechaP || !proveedorP || !empleadoID || !detalles?.length) {
            throw new Error("❌ Faltan completar algunos campos obligatorios.");
        }

        // 🔹 Crear cabecera
        const newId = await getNextSequence("Proveedor_SolicitudPresupuesto");

        const newSolicitudPresupuesto = new SolicitudPresupuesto({
            _id: newId,
            fecha: fechaP,
            proveedor: proveedorP,
            empleado: empleadoID,
            estado: true
        });

        await newSolicitudPresupuesto.save({ session });

        // 🔹 Crear detalles
        for (const item of detalles) {
            await setSolicitudPresupuestoDetalle({
                cantidadP: item.cantidad,
                productoID: item.producto,
                importe: item.importe,
                solicitudPresupuestoP: newSolicitudPresupuesto._id,
                session
            });
        }

        // 🔹 Confirmar transacción
        await session.commitTransaction();

        res.status(201).json({
            ok: true,
            message: "✔️ Solicitud de presupuesto y detalles guardados correctamente.",
            data: newSolicitudPresupuesto
        });

    } catch (error) {
        
        await session.abortTransaction();

        res.status(400).json({
            ok: false,
            message: "❌ Error al guardar la solicitud de presupuesto.",
            error: error.message
        });
    } finally {
        session.endSession();
    }
};


const getSolicitudPresupuesto = async(req, res) => {
    const solicitudes = await SolicitudPresupuesto.find({estado:true}).lean();
    res.status(200).json({
        ok:true,
        data: solicitudes
    })
}

const getSolicitudPresupuestoID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente',
        })
        return
    }

    const presupuesto = await SolicitudPresupuesto.findById(id);
    if(!presupuesto){
        res.status(400).json({
            ok:false,
            message:'❌ El id no corresponde a una solicitud de presupuesto.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:presupuesto,
        message:"✔️ Solicitud de presupuesto obtenida correctamente."
    })
}

const getSolicitudPresupuestoByProveedor = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente',
        })
        return
    }

    const presupuestos = await SolicitudPresupuesto.find({proveedor:id});
    if(!presupuestos){
        res.status(400).json({
            ok:false,
            message:'❌ Error al obtener solicitudes de presupuesto del proveedor elegido.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:presupuestos,
        message:"✔️ Solicitudes de presupuesto obtenidas correctamente."
    })
}

const updateSolicitudPresupuesto = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const id = req.params.id;
        const proveedorID = req.body.proveedor;
        const empleadoID = req.body.empleado;
        const detalles = req.body.detalles;

        if (!id) {
            throw new Error("❌ El id no llegó al controlador correctamente.");
        }

        if (!proveedorID || !empleadoID) {
            throw new Error("❌ Faltan completar algunos campos obligatorios.");
        }

        // 🔹 Actualizar cabecera
        const updatedPresupuesto = await SolicitudPresupuesto.findByIdAndUpdate(
            id,
            {
                proveedor: proveedorID,
                empleado: empleadoID
            },
            {
                new: true,
                runValidators: true,
                session
            }
        );

        if (!updatedPresupuesto) {
            throw new Error("❌ Error al actualizar la solicitud de presupuesto.");
        }

        if (Array.isArray(detalles)) {

            // Eliminación lógica de detalles actuales
            await SolicitudPresupuestoDetalle.updateMany(
                { solicitudPresupuesto: id, estado: true },
                { estado: false },
                { session }
            );

            // Crear nuevos detalles
            for (const item of detalles) {
                await setSolicitudPresupuestoDetalle({
                    cantidadP: item.cantidad,
                    productoID: item.producto,
                    importe: item.importe,
                    solicitudPresupuestoP: id,
                    session
                });
            }
        }

        await session.commitTransaction();

        res.status(200).json({
            ok: true,
            data: updatedPresupuesto,
            message: "✔️ Solicitud de presupuesto actualizada correctamente."
        });

    } catch (error) {
        
        await session.abortTransaction();

        res.status(400).json({
            ok: false,
            message: "❌ Error al actualizar la solicitud de presupuesto.",
            error: error.message
        });

    } finally {
        session.endSession();
    }
};


//Validaciones de eliminacion
const ProveedorPresupuesto = require("../models/proveedorPresupuesto_Model");

const deleteSolicitudPresupuesto = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente.'
        })
        return
    }

    const presupuestos = await ProveedorPresupuesto.find({solicitudPresupuesto:id , estado:true}).lean();
    
    if(presupuestos.length !== 0 ){
        res.status(400).json({
            ok:false,
            message:"❌ Error al eliminar. Existen tablas relacionadas a esta solicitud de presupuesto."
        })
        return
    }

    const deletedPresupuesto = await SolicitudPresupuesto.findByIdAndUpdate(
        id,
        {   
            estado: false
        },
        { new: true , runValidators: true }
    )
    if(!deletedPresupuesto){
        res.status(400).json({
            ok:false,
            message: '❌ Error durante el borrado.'
        })
        return
    }
    const deletedPresupuestoDetalle = await SolicitudPresupuestoDetalle.updateMany(
        { solicitudPresupuesto: id }, 
        { estado: false }, 
        { new: true, runValidators: true }
    );
    if(!deletedPresupuestoDetalle){
        res.status(400).json({
            ok:false,
            message: '❌ Error durante el borrado del detalle.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'✔️ Solicitud de presupuesto eliminado correctamente.'
    })
}

const buscarSolicitudPresupuesto = async (req, res) => {
    const { solicitudID , proveedor, empleado, detalles } = req.body;
    // 1️⃣ Obtenemos todos los productos que vienen en los detalles
    const productosBuscados = detalles && detalles.length > 0
      ? detalles.map(d => d.producto)
      : [];

    // 2️⃣ Buscamos los PresupuestoDetalle que contengan alguno de esos productos
    let detallesFiltrados = [];
    if (productosBuscados.length > 0) {
      detallesFiltrados = await SolicitudPresupuestoDetalle.find({
        producto: { $in: productosBuscados },
      });
    }
    // Se filtró por productos y ninguno coincide: no hay resultados.
    // (Sin filtro de productos no hace falta cargar los detalles: se buscan todos los documentos.)
    if (productosBuscados.length > 0 && detallesFiltrados.length === 0) {
        return res.status(200).json({ ok: true, data: [], message: "Sin resultados." });
    }

    // 3️⃣ Obtenemos los IDs únicos de los presupuestos asociados
    const presupuestosIDs = [...new Set(detallesFiltrados.map(d => d.solicitudPresupuesto))];

    // 4️⃣ Buscamos los presupuestos relacionados
    let presupuestos = await SolicitudPresupuesto.find(
      presupuestosIDs.length > 0 ? { _id: { $in: presupuestosIDs } } : {}
    );

    // 5️⃣ Filtramos adicionalmente por cliente, empleado o total si existen
    const presupuestosFiltrados = presupuestos.filter(p => {
      const coincideEstado = p.estado === true;
      const coincidePresupuestoSolicitud = solicitudID ? (p._id) === Number(solicitudID) : true;
      const coincideProveedor = proveedor ? String(p.proveedor) === String(proveedor) : true;
      const coincideEmpleado = empleado ? String(p.empleado) === String(empleado) : true;
      return coincideProveedor && coincideEmpleado && coincidePresupuestoSolicitud && coincideEstado;
    });

    if(presupuestosFiltrados.length > 0){
        res.status(200).json({ ok: true, message: "✔️ Solicitudes de presupuesto obtenidas." , data: presupuestosFiltrados });
    } else {
        res.status(500).json({ ok: false, message: "❌ Error al buscar solicitudes de presupuesto." });
    }
};

module.exports = { setSolicitudPresupuesto , buscarSolicitudPresupuesto , getSolicitudPresupuesto , getSolicitudPresupuestoID , getSolicitudPresupuestoByProveedor , updateSolicitudPresupuesto , deleteSolicitudPresupuesto };
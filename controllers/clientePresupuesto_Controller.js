const Presupuesto = require("../models/clientePresupuesto_Model");
const NotaPedido = require("../models/clienteNotaPedido_Model");
const PresupuestoDetalle = require("../models/clientePresupuestoDetalle_Model");
const getNextSequence = require("../controllers/counter_Controller");
const Producto = require("../models/producto_Model");
const mongoose = require('mongoose');

const obtenerFechaHoy = () => {
  const hoy = new Date();
  return hoy.toISOString().split("T")[0];
}

const setPresupuestoDetalle = async ({
    importe,
    precio,
    cantidad,
    presupuesto,
    producto,
    session
}) => {

    if(!importe || !presupuesto || !producto || !precio || !cantidad ){
        throw new Error ("❌ Faltan completar algunos campos obligatorios.")
    }
    const newId = await getNextSequence("Cliente_PresupuestoDetalle");
    const newPresupuestoDetalle = new PresupuestoDetalle ({
        _id: newId,
        importe: importe , presupuesto: presupuesto , producto: producto , precio:precio , cantidad:cantidad , estado:true
    });
    await newPresupuestoDetalle.save({ session })

    return newPresupuestoDetalle;
}

const setPresupuesto = async (req,res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const totalP = req.body.total;
        const fechaP = obtenerFechaHoy();
        const clienteID = req.body.cliente;
        const empleadoID = req.body.empleado;
        const detalles = req.body.detalles;

        if(!totalP || !fechaP || !clienteID || !empleadoID ){
            throw new Error("❌ Faltan completar algunos campos obligatorios.")
        }

        const newId = await getNextSequence("Cliente_Presupuesto");
        const newPresupuesto = new Presupuesto ({
            _id: newId,
            total: totalP , fecha: fechaP , cliente: clienteID,
            empleado:empleadoID , estado:true
        });
        await newPresupuesto.save({ session })

        if (!detalles || detalles.length === 0) {
                throw new Error("❌ El presupuesto debe tener al menos un detalle.");
            }

        for (const det of detalles) {
            const productoDB = await Producto.findById(det.producto).session(session);

            if (!productoDB) {
            throw new Error("Producto inexistente");
            }

            if (productoDB.stock < det.cantidad) {
            throw new Error(`Stock insuficiente para ${productoDB.name}`);
            }

            await setPresupuestoDetalle({
                importe: det.importe,
                precio: det.precio,
                cantidad: det.cantidad,
                presupuesto: newId,
                producto: det.producto,
                session
            });
        }

        await session.commitTransaction();

        return res.status(201).json({
            ok: true,
            message: "✔️ Presupuesto agregado correctamente",
            data: newPresupuesto
        });
    } catch (error) {

        await session.abortTransaction();

        res.status(400).json({ ok: false, message: error.message });
    }finally {
        session.endSession();
    }
}

const getPresupuesto = async(req, res) => {
    try{
        // 1️⃣ Traer todas los presupuestos activos
        const presupuestos = await Presupuesto.find({ estado: true }).lean();

        // 2️⃣ Traer todos los pedidos de venta (solo el campo que nos interesa)
        const pedidos = await NotaPedido.find({}, "presupuesto").lean();

        // 3️⃣ Extraer los IDs de notas de pedido facturadas
        const pedidosRealizados = new Set(pedidos.map(c => String(c.presupuesto)));

        // 4️⃣ Agregar el campo 'facturado' a cada nota
        const presupuestosConPedido = presupuestos.map(np => ({
        ...np,
        tieneNotaPedido: pedidosRealizados.has(String(np._id))
        }));


        res.status(200).json({
            ok:true,
            data: presupuestosConPedido
        })
    }catch (error) {
        res.status(500).json({
        ok: false,
        message: "❌ Error interno al obtener presupuestos."
        });
    }
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
        data:presupuesto,
        message:"✔️ Presupuesto obtenido correctamente."
    })
}

const updatePresupuesto = async(req,res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try{
    const id = req.params.id;
    
    const totalP = req.body.total;
    const fechaP = req.body.fecha;
    const clienteID = req.body.cliente;
    const empleadoID = req.body.empleado;
    const detalles = req.body.detalles;

    if(!id){
        throw new Error('❌ El id no llego al controlador correctamente.')
    }

    const pedidos = await NotaPedido.find({estado:true, presupuesto:id}).lean();
    if( pedidos.length !== 0){
        throw new Error("❌ El presupuesto ya se encuentra en una nota de pedido y no puede modificarse.")
    }

    if(!totalP || !clienteID || !empleadoID ){
        throw new Error("❌ Faltan completar algunos campos obligatorios.")
    }

    const updatedPresupuesto = await Presupuesto.findByIdAndUpdate(
        id,
        {   
            total: totalP , fecha: fechaP , cliente: clienteID,
            empleado:empleadoID 
        },
        { new: true , runValidators: true , session}
    )

    if(!updatedPresupuesto){
        throw new Error('❌ Error al actualizar el presupuesto.')
    }

    const deletedPresupuestoDetalle = await PresupuestoDetalle.updateMany(
      { presupuesto: id },
      { estado: false },
      { runValidators: true, session }
    );
    if (!deletedPresupuestoDetalle) {
        throw new Error('❌ Error durante el borrado de los detalles viejos.')
    }

    if (!detalles || detalles.length === 0) {
            throw new Error("❌ El presupuesto debe tener al menos un detalle.");
        }

    for (const det of detalles) {
        const productoDB = await Producto.findById(det.producto).session(session);
        if (!productoDB) {
        throw new Error("Producto inexistente");
        }
        if (productoDB.stock < det.cantidad) {
        throw new Error(`Stock insuficiente para ${productoDB.name}`);
        }

        await setPresupuestoDetalle({
            importe: det.importe,
            precio: det.precio,
            cantidad: det.cantidad,
            presupuesto: id,
            producto: det.producto,
            session
        });
    }

    // ✅ TODO OK
    await session.commitTransaction();

    res.status(200).json({
        ok:true,
        data:updatedPresupuesto,
        message:'✔️ Presupuesto actualizado correctamente.',
    })
    } catch (error) {
        await session.abortTransaction();

        return res.status(400).json({
        ok: false,
        message: error.message
        });
    } finally {
        session.endSession();
    }
}

//Validaciones de eliminacion

const deletePresupuesto = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente.'
        })
        return
    }
    
    const tieneNotasPedido = await NotaPedido.exists({ presupuesto: id });
    if (tieneNotasPedido) {
      return res.status(400).json({
        ok: false,
        message: '❌ No se puede eliminar el presupuesto porque posee servicios asociados.'
      });
    }    

    const deletedPresupuesto = await Presupuesto.findByIdAndUpdate(
        id,
        {   
            estado:false
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
    const { presupuestoID , cliente, empleado, total, detalles } = req.body;
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
    const presupuestosIDs = [...new Set(detallesFiltrados.map(d => String(d.presupuesto)))];

    // 4️⃣ Buscamos los presupuestos relacionados
    let presupuestos = await Presupuesto.find(
      presupuestosIDs.length > 0 ? { _id: { $in: presupuestosIDs } } : {}
    );

    // 5️⃣ Filtramos adicionalmente por cliente, empleado o total si existen
    const presupuestosFiltrados = presupuestos.filter(p => {
        const coincideEstado = p.estado === true;
      const coincidePresupuesto = presupuestoID ? (p._id) === Number(presupuestoID) : true;
      const coincideCliente = cliente ? String(p.cliente) === String(cliente) : true;
      const coincideEmpleado = empleado ? String(p.empleado) === String(empleado) : true;
      const coincideTotal = total ? Number(p.total) === Number(total) : true;
      return coincideCliente && coincideEmpleado && coincideTotal && coincidePresupuesto && coincideEstado;
    });

    if(presupuestosFiltrados.length > 0){
        res.status(200).json({ ok: true, message: "✔️ Presupuestos obtenidos" , data: presupuestosFiltrados });
    } else {
        res.status(500).json({ ok: false, message: "❌ Error al buscar presupuestos" });
    }
};

module.exports = { setPresupuesto , getPresupuesto , getPresupuestoID , updatePresupuesto , deletePresupuesto , buscarPresupuesto };
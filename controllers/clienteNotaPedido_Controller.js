const NotaPedido = require("../models/clienteNotaPedido_Model");
const NotaPedidoDetalle = require("../models/clienteNotaPedidoDetalle_Model");
const ComprobanteVenta = require("../models/clienteComprobanteVenta_Model");
const Producto = require("../models/producto_Model");
const MedioPago = require("../models/medioPago_Model")
const Cliente = require("../models/cliente_Model")
const Caja = require("../models/caja_Model")
const getNextSequence = require("../controllers/counter_Controller");
const mongoose = require('mongoose');

const obtenerFechaHoy = () => {
  const hoy = new Date();
  return hoy.toISOString().split("T")[0];
}

const setNotaPedidoDetalle = async ({
    importeP,
    precioP,
    cantidadP,
    notaPedidoP,
    productoID,
    session
}) => {

    const producto = await Producto.findById(productoID).session(session);

    if (!producto) {
        throw new Error('❌ Producto no encontrado');
    }

    if (producto.stock < cantidadP) {
        throw new Error('❌ Stock insuficiente');
    }

    producto.stock -= cantidadP;
    await producto.save({ session });

    const newId = await getNextSequence("Cliente_NotaPedidoDetalle");

    const detalle = new NotaPedidoDetalle({
        _id: newId,
        importe: importeP,
        notaPedido: notaPedidoP,
        producto: productoID,
        precio: precioP,
        cantidad: cantidadP,
        estado: true
    });

    await detalle.save({ session });

    return detalle;
};

const setNotaPedido = async (req,res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const totalP = req.body.total;
        const fechaP = obtenerFechaHoy();
        const envioP = req.body.envio;
        const fechaEntregaP = new Date(req.body.fechaEntrega);
        const clienteID = req.body.cliente;
        const empleadoID = req.body.empleado;
        const medioPagoID = req.body.medioPago;
        const presupuestoID = req.body.presupuesto;
        const provincia = req.body.provincia;
        const localidad = req.body.localidad;
        const barrio = req.body.barrio;
        const calle = req.body.calle;
        const altura = req.body.altura;
        const deptoNumero = req.body.deptoNumero;
        const deptoLetra = req.body.deptoLetra;    
        const descuento = req.body.descuento;
        const detalles = req.body.detalles;

        if(!totalP || !fechaP || !clienteID || !empleadoID || !medioPagoID || !fechaEntregaP){
            throw new Error("❌ Faltan completar algunos campos obligatorios.")
        }
        
        const newId = await getNextSequence("Cliente_NotaPedido");
        const newNotaPedido = new NotaPedido ({
            _id: newId, 
            fecha: fechaP , 
            cliente: clienteID,
            empleado:empleadoID , 
            medioPago:medioPagoID , 
            fechaEntrega:fechaEntregaP , 
            envio:envioP,
            estado:true
        });
        if (presupuestoID) {
            newNotaPedido.presupuesto = presupuestoID;
        }
        if (descuento > 0) {
            newNotaPedido.descuento = descuento;
            newNotaPedido.total = totalP - ((totalP*descuento)/100)
        } else {
            newNotaPedido.total = totalP
        }

        if (envioP) {
            if(!provincia || !localidad || !barrio || !calle || !altura){
               throw new Error("❌ Faltan completar algunos campos obligatorios.")
            }
            newNotaPedido.provincia = provincia;
            newNotaPedido.localidad = localidad;
            newNotaPedido.barrio = barrio;
            newNotaPedido.calle = calle;
            newNotaPedido.altura = altura;
            newNotaPedido.deptoNumero = deptoNumero;
            newNotaPedido.deptoLetra = deptoLetra;
        }

        // TRAER CLIENTE Y MEDIO DE PAGO
        const cliente = await Cliente.findById(clienteID).session(session);
        const medioPago = await MedioPago.findById(medioPagoID).session(session);


        if (!cliente || !medioPago) {
            throw new Error("❌ Cliente o medio de pago inválido.");
        }

        // ⭐ VALIDAR CUENTA CORRIENTE
        if (medioPago.name === "Cuenta Corriente") {

            // 1️⃣ ¿El cliente tiene CC habilitada?
            if (!cliente.cuentaCorriente) {
                throw new Error("❌ El cliente no tiene habilitada la Cuenta Corriente.");
            }

            // 2️⃣ ¿Tiene saldo suficiente?
            if (cliente.saldoActualCuentaCorriente < totalP) {
                throw new Error(`❌ Saldo insuficiente. Saldo actual: $${cliente.saldoActualCuentaCorriente}`)
            }

            // 3️⃣ Descontar el saldo
            if(descuento){
            cliente.saldoActualCuentaCorriente -= totalP - ((totalP*descuento)/100);
            } else if (!descuento){
            cliente.saldoActualCuentaCorriente -= totalP;
            }
            

            // 4️⃣ Guardar el nuevo saldo antes de continuar
            await cliente.save({ session });
        }

        await newNotaPedido.save({ session });

        if (!detalles || detalles.length === 0) {
            throw new Error("❌ La nota de pedido debe tener al menos un detalle.");
        }

        for (const det of detalles) {
                await setNotaPedidoDetalle({
                    importeP: det.importe,
                    precioP: det.precio,
                    cantidadP: det.cantidad,
                    notaPedidoP: newId,
                    productoID: det.producto,
                    session
                });
            }

        
        // AGREGAMOS MOVIMIENTO A LA CAJA
        if(medioPago.name !== "Cuenta Corriente" ){
          const newIdCaja = await getNextSequence("Caja");
          const newCaja = await new Caja({
              _id: newIdCaja,
              fecha:obtenerFechaHoy(),
              tipo: 'ENTRADA',
              persona:clienteID , 
              referencia:`Nota de Pedido Cliente N°: ${newId}.`, 
              medioPago:medioPago , 
              estado:true
          });
          if (descuento > 0) {
              newNotaPedido.descuento = descuento;
              newCaja.total = totalP - ((totalP*descuento)/100)
          } else {
              newCaja.total = totalP
          }
      
          if(!newCaja){
              throw new Error("❌ Error al agregar movimiento de caja.")
          }
          await newCaja.save({ session })
        } else {
          const newIdCaja = await getNextSequence("Caja");
          const newCaja = await new Caja({
              _id: newIdCaja,
              fecha:obtenerFechaHoy(),
              tipo: 'CUENTA_CORRIENTE',
              persona:clienteID , 
              referencia:`Nota de Pedido Cliente N°: ${newId}.`, 
              medioPago:medioPago , 
              estado:true
          });
          if (descuento > 0) {
              newNotaPedido.descuento = descuento;
              newCaja.total = totalP - ((totalP*descuento)/100)
          } else {
              newCaja.total = totalP
          }
      
          if(!newCaja){
              throw new Error("❌ Error al agregar movimiento de caja.")
          }
          await newCaja.save({ session })
        }

        await session.commitTransaction();

        return res.status(201).json({
            ok: true,
            message: "✔️ Nota de pedido creada correctamente",
            data: newNotaPedido
        });


    } catch (error) {

        await session.abortTransaction();

        res.status(400).json({ ok: false, message: error.message });
  }finally {
        session.endSession();
    }

}

const getNotaPedido = async (req, res) => {
  try {
    // 1️⃣ Traer todas las notas activas
    const notaPedidos = await NotaPedido.find({ estado: true }).lean();

    // 2️⃣ Traer todos los comprobantes de venta (solo el campo que nos interesa)
    const comprobantes = await ComprobanteVenta.find({}, "notaPedido").lean();

    // 3️⃣ Extraer los IDs de notas de pedido facturadas
    const notasFacturadas = new Set(comprobantes.map(c => String(c.notaPedido)));

    // 4️⃣ Agregar el campo 'facturado' a cada nota
    const notasConEstado = notaPedidos.map(np => ({
      ...np,
      facturado: notasFacturadas.has(String(np._id))
    }));

    // 5️⃣ Devolver la respuesta
    res.status(200).json({
      ok: true,
      data: notasConEstado
    });

  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "❌ Error interno al obtener las notas de pedido."
    });
  }
};


const getNotaPedidoID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente',
        })
        return
    }

    const notaPedido = await NotaPedido.findById(id);
    if(!notaPedido){
        res.status(400).json({
            ok:false,
            message:'❌ El id no corresponde a un Nota de pedido.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:notaPedido,
        message:"✔️ Nota de pedido obtenida correctamente."
    })
}

const getNotaPedidoByCliente = async(req,res) => {
    const clienteID = req.params.id;
    if(!clienteID){
        res.status(400).json({ 
            ok:false,
            message:'❌ El id no llego al controlador correctamente.'
        })
        return
    }
    const notaPedidos = await NotaPedido.find({ cliente: clienteID , estado:true });
    if(!notaPedidos || notaPedidos.length === 0){
        res.status(404).json({
            ok:false,
            message:'❌No se encontraron pedidos para el cliente especificado.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:notaPedidos,
        message:"✔️ Notas de pedido obtenidas correctamente."
    })
}


const updateNotaPedido = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const id = req.params.id;
    if (!id) throw new Error('❌ El id no llegó correctamente.');

    const estadoP = req.body.facturado;
    if (estadoP === true) {
      throw new Error('❌ El pedido ya está cerrado.');
    }

    const {
      total,
      envio,
      fechaEntrega,
      cliente,
      empleado,
      medioPago,
      presupuesto,
      provincia,
      localidad,
      barrio,
      calle,
      altura,
      deptoNumero,
      deptoLetra,
      descuento,
      detalles
    } = req.body;

    if (!total || !cliente || !empleado || !medioPago || !fechaEntrega) {
      throw new Error("❌ Faltan campos obligatorios.");
    }

    // 🔎 Pedido y cliente
    const pedido = await NotaPedido.findById(id).session(session);
    const clienteDB = await Cliente.findById(cliente).session(session);

    if (!pedido || !clienteDB) {
      throw new Error("❌ Pedido o cliente inválido.");
    }

    const medioPagoAnterior = await MedioPago.findById(pedido.medioPago).session(session);
    const medioPagoActual = await MedioPago.findById(medioPago).session(session);

    // ===============================
    // 📊 Totales viejo vs nuevo
    // ===============================
    const totalAnterior = pedido.descuento
      ? pedido.total - ((pedido.total * pedido.descuento) / 100)
      : pedido.total;

    const totalNuevo = descuento
      ? total - ((total * descuento) / 100)
      : total;

    // ===============================
    // ⭐ CUENTA CORRIENTE
    // ===============================

    if (medioPagoAnterior.name === "Cuenta Corriente" &&
        medioPagoActual.name !== "Cuenta Corriente") {

      clienteDB.saldoActualCuentaCorriente += totalAnterior;
    }

    else if (medioPagoAnterior.name !== "Cuenta Corriente" &&
             medioPagoActual.name === "Cuenta Corriente") {

      if (!clienteDB.cuentaCorriente) {
        throw new Error("❌ El cliente no tiene CC.");
      }

      if (clienteDB.saldoActualCuentaCorriente < totalNuevo) {
        throw new Error(`❌ Saldo insuficiente: $${clienteDB.saldoActualCuentaCorriente}`);
      }

      clienteDB.saldoActualCuentaCorriente -= totalNuevo;
    }

    else if (medioPagoAnterior.name === "Cuenta Corriente" &&
             medioPagoActual.name === "Cuenta Corriente") {

      clienteDB.saldoActualCuentaCorriente =
        clienteDB.saldoActualCuentaCorriente + totalAnterior - totalNuevo;
    }

    await clienteDB.save({ session });

    // ===============================
    // 📝 UPDATE PEDIDO
    // ===============================
    const updatedData = {
      total: totalNuevo,
      cliente,
      empleado,
      medioPago,
      fechaEntrega,
      envio,
      descuento
    };

    if (presupuesto) updatedData.presupuesto = presupuesto;

    if (envio) {
      if (!provincia || !localidad || !barrio || !calle || !altura) {
        throw new Error("❌ Dirección incompleta.");
      }

      Object.assign(updatedData, {
        provincia,
        localidad,
        barrio,
        calle,
        altura,
        deptoNumero,
        deptoLetra
      });
    }

    const updatedPedido = await NotaPedido.findByIdAndUpdate(
      id,
      updatedData,
      { new: true, runValidators: true, session }
    );

    if (!updatedPedido) {
      throw new Error("❌ Error al actualizar la nota de pedido.");
    }

    const detallesViejos = await NotaPedidoDetalle
        .find({ notaPedido: id, estado: true })
        .session(session);

    for (const detalle of detallesViejos) {
          await Producto.findByIdAndUpdate(
            detalle.producto,
            { $inc: { stock: detalle.cantidad } }, // suma la cantidad al stock
            { new: true , session}
          );
        }

    const deletedNotaPedidoDetalle = await NotaPedidoDetalle.updateMany(
      { notaPedido: id },
      { estado: false },
      { runValidators: true, session }
    );
    if (!deletedNotaPedidoDetalle) {
        throw new Error('❌ Error durante el borrado de los detalles viejos.')
    }

    if (!detalles || detalles.length === 0) {
            throw new Error("❌ La nota de pedido debe tener al menos un detalle.");
        }

    for (const det of detalles) {

        await setNotaPedidoDetalle({
            importeP: det.importe,
            precioP: det.precio,
            cantidadP: det.cantidad,
            notaPedidoP: id,
            productoID: det.producto,
            session
        });
    }
            
    // 1️⃣ Buscar TODOS los movimientos de caja de la Nota de Pedido
    const movimientosCaja = await Caja.find({
      estado: true,
      referencia: { $regex: `Nota de Pedido Cliente N°: ${id}` }
    }).session(session);

     if (!movimientosCaja || movimientosCaja.length === 0) {
      throw new Error("❌ No se encontraron movimientos de caja para esta Nota de Pedido.");
    }

    // 2️⃣ Calcular TOTAL REAL ACTUAL de caja
    const totalActualCaja = movimientosCaja.reduce((acc, mov) => {
      return mov.tipo ? acc + mov.total : acc - mov.total;
    }, 0);

    // 3️⃣ Calcular nuevo total correcto
    let nuevoTotalCaja;
    if (descuento > 0) {
      nuevoTotalCaja = total - ((total * descuento) / 100);
    } else {
      nuevoTotalCaja = total;
    }

    // 4️⃣ Calcular diferencia REAL
    const diferencia = nuevoTotalCaja - totalActualCaja
    
    // 5️⃣ Crear ajuste SOLO si hay diferencia
    if (diferencia !== 0) {
    // HAY DIFERENCIA DE PLATA → SE GENERA UN NUEVO MOVIMIENTO
    const newIdCaja = await getNextSequence("Caja");

    if (medioPagoActual.name !== "Cuenta Corriente") {

      const tipoMovimiento = diferencia > 0 ? 'ENTRADA' : 'SALIDA';

      const ajusteCaja = new Caja({
        _id: newIdCaja,
        fecha: obtenerFechaHoy(),
        tipo: tipoMovimiento,
        persona: cliente,
        referencia: `Ajuste Nota de Pedido Cliente N°: ${id}.`,
        medioPago: medioPagoActual._id,
        total: Math.abs(diferencia),
        estado: true
      });

      await ajusteCaja.save({ session });

    } else {
      // AJUSTE POR CUENTA CORRIENTE
      const ajusteCaja = new Caja({
        _id: newIdCaja,
        fecha: obtenerFechaHoy(),
        tipo: 'CUENTA_CORRIENTE',
        persona: cliente,
        referencia: `Ajuste Nota de Pedido Cliente N°: ${id}.`,
        medioPago: medioPagoActual._id,
        total: Math.abs(diferencia),
        estado: true
      });

      await ajusteCaja.save({ session });
    }

  } else {
    // NO HAY DIFERENCIA → SOLO SE ACTUALIZA EL MOVIMIENTO EXISTENTE

    if (medioPagoActual.name !== "Cuenta Corriente") {

      const cajaUpdated = await Caja.findByIdAndUpdate(
        movimientosCaja[0]._id,
        { 
          tipo: 'ENTRADA',
          medioPago: medioPagoActual
        },
        { new: true, runValidators: true, session }
      );

      if (!cajaUpdated) {
        throw new Error("❌ Error al actualizar movimiento de caja.");
      }

    } else {

      const cajaUpdated = await Caja.findByIdAndUpdate(
        movimientosCaja[0]._id,
        { 
          tipo: 'CUENTA_CORRIENTE',
          medioPago: medioPagoActual
        },
        { new: true, runValidators: true, session }
      );

      if (!cajaUpdated) {
        throw new Error("❌ Error al actualizar movimiento de caja.");
      }
    }
  }


    // ✅ TODO OK
    await session.commitTransaction();

    return res.status(200).json({
      ok: true,
      data: updatedPedido,
      message: "✔️ Nota de pedido actualizada correctamente."
    });

  } catch (error) {
    await session.abortTransaction();

    return res.status(400).json({
      ok: false,
      message: error.message
    });
  }finally {
        session.endSession();
    }
};



const deleteNotaPedido = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        ok: false,
        message: '❌ El ID no llegó correctamente al controlador.'
      });
    }

    const nota = await NotaPedido.findById(id);
    if (!nota) {
      return res.status(404).json({
        ok: false,
        message: '❌ La nota de pedido no fue encontrada.'
      });
    }

    const comprobanteAsociado = await ComprobanteVenta.exists({ notaPedido: id , estado:true});
    if (comprobanteAsociado) {
      return res.status(400).json({
        ok: false,
        message: '❌ No se puede eliminar la nota de pedido porque posee servicios asociados.'
      });
    }

    const detalles = await NotaPedidoDetalle.find({ notaPedido: id, estado: true });
    
    for (const detalle of detalles) {
      await Producto.findByIdAndUpdate(
        detalle.producto,
        { $inc: { stock: detalle.cantidad } }, // suma la cantidad al stock
        { new: true }
      );
    }

    await NotaPedido.findByIdAndUpdate(
      id,
      { estado: false },
      { new: true, runValidators: true }
    );

    await NotaPedidoDetalle.updateMany(
      { notaPedido: id },
      { estado: false },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      ok: true,
      message: '✔️ Nota de pedido eliminada correctamente y stock reintegrado.'
    });

  } catch (error) {
    res.status(500).json({
      ok: false,
      message: '❌ Error interno del servidor.'
    });
  }
};


const buscarNotaPedido = async (req, res) => {
    const { 
        notaPedidoID , cliente, empleado, total, detalles , fechaEntrega , medioPago, 
        envio, presupuesto , provincia , localidad , barrio , calle , altura ,
        deptoNumero , deptoLetra
    } = req.body;

    // 1️⃣ Obtenemos todos los productos que vienen en los detalles
    const productosBuscados = detalles && detalles.length > 0
      ? detalles.map(d => d.producto)
      : [];

    // 2️⃣ Buscamos los PresupuestoDetalle que contengan alguno de esos productos
    let detallesFiltrados = [];
    if (productosBuscados.length > 0) {
      detallesFiltrados = await NotaPedidoDetalle.find({
        producto: { $in: productosBuscados },
      });
    } if (productosBuscados.length > 0 && detallesFiltrados.length === 0) {
        res.status(500).json({ ok: false, message: "❌ Error al buscar presupuestos" });       
    } else if (!detalles) {
      detallesFiltrados = await NotaPedidoDetalle.find();
    }
    
    // 3️⃣ Obtenemos los IDs únicos de los notas de pedidos asociados
    const pedidosIDs = [
        ...new Set(
            detallesFiltrados
            .map(d => d.notaPedido)
            .filter(id => id !== undefined && id !== null)
        ),
    ];

    // 4️⃣ Buscamos los presupuestos relacionados
    let pedidos = await NotaPedido.find(
      pedidosIDs.length > 0 ? { _id: { $in: pedidosIDs } } : {}
    );

    // 5️⃣ Filtramos adicionalmente por cliente, empleado o total si existen
    const pedidosFiltrados = pedidos.filter(p => {
      const coincideEstado = p.estado === true;
      const coincideNotaPedido = notaPedidoID ? (p._id) === Number(notaPedidoID) : true;
      const coincideCliente = cliente ? String(p.cliente) === String(cliente) : true;
      const coincideEmpleado = empleado ? String(p.empleado) === String(empleado) : true;
      const coincideTotal = total ? Number(p.total) === Number(total) : true;
      const coincideMedioPago = medioPago ? String(p.medioPago) === String(medioPago) : true;
      const coincideFechaEntrega = fechaEntrega ? String(p.fechaEntrega) === String(fechaEntrega) : true;
      const coincideEnvio = typeof envio === "boolean" ? p.envio === envio : true;
      const coincidePresupuesto = presupuesto ? String(p.presupuesto) === String(presupuesto) : true;
      const coincideProvincia = provincia ? String(p.provincia) === String(provincia) : true;
      const coincideLocalidad = localidad ? String(p.localidad) === String(localidad) : true;
      const coincideBarrio = barrio ? String(p.barrio) === String(barrio) : true;
      const coincideCalle = calle ? String(p.calle) === String(calle) : true;
      const coincideDeptoNumero = deptoNumero ? String(p.deptoNumero) === String(deptoNumero) : true;
      const coincideDeptoLetra = deptoLetra ? String(p.deptoLetra) === String(deptoLetra) : true;
      const coincideAltura  = altura ? String(p.altura) === String(altura) : true;
      return coincideNotaPedido && coincideCliente && coincideEmpleado && coincideTotal && coincideMedioPago &&
             coincideFechaEntrega && coincideEnvio && coincidePresupuesto && coincideProvincia &&
             coincideLocalidad && coincideBarrio && coincideBarrio && coincideCalle &&
             coincideDeptoLetra && coincideDeptoNumero && coincideAltura && coincideEstado;
    });
    
    if(pedidosFiltrados.length > 0){
        res.status(200).json({ ok: true, message: "✔️ Presupuestos obtenidos", data: pedidosFiltrados });
    } else {
        res.status(500).json({ ok: false, message: "❌ Error al buscar notas de pedido" });
    }
};

module.exports = { setNotaPedido , getNotaPedido , getNotaPedidoID , getNotaPedidoByCliente , updateNotaPedido , deleteNotaPedido , buscarNotaPedido };
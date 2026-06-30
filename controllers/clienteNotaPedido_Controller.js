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

// Registra el movimiento de Caja (y descuento de Cuenta Corriente) de una Nota de Pedido.
// La Caja nace al crear la nota; el Comprobante de Venta es solo facturación.
const registrarCajaNota = async ({ nota, total, session }) => {
  const medioPago = await MedioPago.findById(nota.medioPago).session(session);
  const cliente = await Cliente.findById(nota.cliente).session(session);

  if (!medioPago || !cliente) {
    throw new Error("❌ Medio de pago o cliente inválido.");
  }

  // Defensa: una nota con "A coordinar" no genera Caja (la tienda ya no crea notas).
  if (medioPago.name === "A coordinar") return;

  const newIdCaja = await getNextSequence("Caja");
  const movimientoCaja = new Caja({
    _id: newIdCaja,
    fecha: obtenerFechaHoy(),
    persona: cliente._id,
    tipoPersona: 'CLIENTE',
    total,
    medioPago: medioPago._id,
    referencia: `Nota de Pedido Cliente N°: ${nota._id}.`,
    estado: true
  });

  if (medioPago.name === "Cuenta Corriente") {
    if (!cliente.cuentaCorriente) {
      throw new Error("❌ El cliente no tiene habilitada la Cuenta Corriente.");
    }
    if (cliente.saldoActualCuentaCorriente < total) {
      throw new Error(`❌ Saldo insuficiente. Saldo actual: $${cliente.saldoActualCuentaCorriente}`);
    }
    cliente.saldoActualCuentaCorriente -= total;
    await cliente.save({ session });
    movimientoCaja.tipo = 'CUENTA_CORRIENTE';
  } else {
    movimientoCaja.tipo = 'ENTRADA';
  }

  await movimientoCaja.save({ session });
};

// Anula TODA la Caja de una nota (movimiento original + ajustes) y reintegra el saldo de
// Cuenta Corriente si correspondía. Se usa al ELIMINAR la nota (no en la modificación).
const revertirCajaNota = async ({ notaId, session }) => {
  const movimientos = await Caja.find({
    estado: true,
    referencia: { $in: [
      `Nota de Pedido Cliente N°: ${notaId}.`,
      `Ajuste Nota de Pedido Cliente N°: ${notaId}.`
    ] }
  }).session(session);

  for (const mov of movimientos) {
    if (mov.tipo === 'CUENTA_CORRIENTE') {
      const cliente = await Cliente.findById(mov.persona).session(session);
      if (cliente) {
        cliente.saldoActualCuentaCorriente += mov.total;
        await cliente.save({ session });
      }
    }
    mov.estado = false;
    await mov.save({ session });
  }
};

const esCuentaCorriente = (nombre) => nombre === "Cuenta Corriente";
// Un medio de pago genera movimiento de caja en efectivo (ENTRADA/SALIDA) si no es CC ni "A coordinar".
const esCajaEfectivo = (nombre) => !!nombre && nombre !== "Cuenta Corriente" && nombre !== "A coordinar";

// Registra los AJUSTES de Caja por la modificación de una nota, SIN eliminar los movimientos
// originales (no se tocan con estado:false). El ajuste respeta el medio de pago:
//  - Efectivo/contado: movimiento ENTRADA (sube) o SALIDA (baja) por la diferencia.
//  - Cuenta Corriente: movimiento CUENTA_CORRIENTE por la diferencia (con signo) + corrección
//    del saldo de la cuenta corriente del/los cliente/s (deshace el cargo viejo y aplica el nuevo).
const ajustarCajaNota = async ({ pedidoAnterior, notaActualizada, totalNuevo, session }) => {
  const totalAnterior = pedidoAnterior.total;

  const medioViejo = await MedioPago.findById(pedidoAnterior.medioPago).session(session);
  const medioNuevo = await MedioPago.findById(notaActualizada.medioPago).session(session);
  if (!medioNuevo) {
    throw new Error("❌ Medio de pago inválido.");
  }

  const nombreViejo = medioViejo ? medioViejo.name : null;
  const nombreNuevo = medioNuevo.name;

  // --- Saldo de Cuenta Corriente: deshacer el cargo viejo y aplicar el nuevo ---
  if (esCuentaCorriente(nombreViejo)) {
    const clienteViejo = await Cliente.findById(pedidoAnterior.cliente).session(session);
    if (clienteViejo) {
      clienteViejo.saldoActualCuentaCorriente += totalAnterior;
      await clienteViejo.save({ session });
    }
  }
  if (esCuentaCorriente(nombreNuevo)) {
    const clienteNuevo = await Cliente.findById(notaActualizada.cliente).session(session);
    if (!clienteNuevo) {
      throw new Error("❌ Cliente inválido.");
    }
    if (!clienteNuevo.cuentaCorriente) {
      throw new Error("❌ El cliente no tiene habilitada la Cuenta Corriente.");
    }
    if (clienteNuevo.saldoActualCuentaCorriente < totalNuevo) {
      throw new Error(`❌ Saldo insuficiente. Saldo actual: $${clienteNuevo.saldoActualCuentaCorriente}`);
    }
    clienteNuevo.saldoActualCuentaCorriente -= totalNuevo;
    await clienteNuevo.save({ session });
  }

  const referencia = `Ajuste Nota de Pedido Cliente N°: ${notaActualizada._id}.`;

  // --- Bucket efectivo (ENTRADA/SALIDA): ajuste por la diferencia, total siempre positivo ---
  const cajaViejo = esCajaEfectivo(nombreViejo) ? totalAnterior : 0;
  const cajaNuevo = esCajaEfectivo(nombreNuevo) ? totalNuevo : 0;
  const diffCaja = cajaNuevo - cajaViejo;
  if (diffCaja !== 0) {
    const medioCaja = esCajaEfectivo(nombreNuevo) ? medioNuevo : medioViejo;
    const newIdCaja = await getNextSequence("Caja");
    const ajuste = new Caja({
      _id: newIdCaja,
      fecha: obtenerFechaHoy(),
      persona: notaActualizada.cliente,
      tipoPersona: 'CLIENTE',
      total: Math.abs(diffCaja),
      medioPago: medioCaja._id,
      referencia,
      tipo: diffCaja > 0 ? 'ENTRADA' : 'SALIDA',
      estado: true
    });
    await ajuste.save({ session });
  }

  // --- Bucket Cuenta Corriente: ajuste por la diferencia (total con signo) ---
  const ccViejo = esCuentaCorriente(nombreViejo) ? totalAnterior : 0;
  const ccNuevo = esCuentaCorriente(nombreNuevo) ? totalNuevo : 0;
  const diffCC = ccNuevo - ccViejo;
  if (diffCC !== 0) {
    const medioCC = esCuentaCorriente(nombreNuevo) ? medioNuevo : medioViejo;
    const newIdCaja = await getNextSequence("Caja");
    const ajusteCC = new Caja({
      _id: newIdCaja,
      fecha: obtenerFechaHoy(),
      persona: notaActualizada.cliente,
      tipoPersona: 'CLIENTE',
      total: diffCC, // con signo: positivo aumenta el saldo de CC del bucket, negativo lo reduce
      medioPago: medioCC._id,
      referencia,
      tipo: 'CUENTA_CORRIENTE',
      estado: true
    });
    await ajusteCC.save({ session });
  }
};

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

        // El movimiento de Caja (y el descuento de Cuenta Corriente) se registra al crear la nota.
        await registrarCajaNota({ nota: newNotaPedido, total: newNotaPedido.total, session });

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

    // ===============================
    // 📊 Total nuevo (con descuento aplicado)
    // ===============================
    const totalNuevo = descuento
      ? total - ((total * descuento) / 100)
      : total;

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

    // ===============================
    // 💰 AJUSTE DE CAJA: se conservan los movimientos originales y se registra un
    // movimiento "Ajuste Nota de Pedido Cliente N°: X" por la diferencia (tipado según
    // el medio de pago). Cubre cambios de total y de medio de pago.
    // ===============================
    await ajustarCajaNota({ pedidoAnterior: pedido, notaActualizada: updatedPedido, totalNuevo, session });

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
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;

    if (!id) {
      throw new Error('❌ El ID no llegó correctamente al controlador.');
    }

    const nota = await NotaPedido.findById(id).session(session);
    if (!nota) {
      throw new Error('❌ La nota de pedido no fue encontrada.');
    }

    const comprobanteAsociado = await ComprobanteVenta.exists({ notaPedido: id , estado:true});
    if (comprobanteAsociado) {
      throw new Error('❌ No se puede eliminar la nota de pedido porque posee servicios asociados.');
    }

    const detalles = await NotaPedidoDetalle.find({ notaPedido: id, estado: true }).session(session);

    for (const detalle of detalles) {
      await Producto.findByIdAndUpdate(
        detalle.producto,
        { $inc: { stock: detalle.cantidad } }, // suma la cantidad al stock
        { new: true, session }
      );
    }

    // Revertir el movimiento de Caja (y reintegrar saldo CC si correspondía).
    await revertirCajaNota({ notaId: id, session });

    await NotaPedido.findByIdAndUpdate(
      id,
      { estado: false },
      { new: true, runValidators: true, session }
    );

    await NotaPedidoDetalle.updateMany(
      { notaPedido: id },
      { estado: false },
      { new: true, runValidators: true, session }
    );

    await session.commitTransaction();

    res.status(200).json({
      ok: true,
      message: '✔️ Nota de pedido eliminada correctamente y stock reintegrado.'
    });

  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({
      ok: false,
      message: error.message || '❌ Error interno del servidor.'
    });
  } finally {
    session.endSession();
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

module.exports = { setNotaPedido , getNotaPedido , getNotaPedidoID , getNotaPedidoByCliente , updateNotaPedido , deleteNotaPedido , buscarNotaPedido , setNotaPedidoDetalle };
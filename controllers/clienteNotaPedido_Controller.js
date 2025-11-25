const NotaPedido = require("../models/clienteNotaPedido_Model");
const NotaPedidoDetalle = require("../models/clienteNotaPedidoDetalle_Model");
const ComprobanteVenta = require("../models/clienteComprobanteVenta_Model");
const Producto = require("../models/producto_Model");
const MedioPago = require("../models/medioPago_Model")
const Cliente = require("../models/cliente_Model")
const getNextSequence = require("../controllers/counter_Controller");

const obtenerFechaHoy = () => {
  const hoy = new Date();
  return hoy.toISOString().split("T")[0];
}

const setNotaPedido = async (req,res) => {
    const newId = await getNextSequence("Cliente_NotaPedido");
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

    if(!totalP || !fechaP || !clienteID || !empleadoID || !medioPagoID || !fechaEntregaP){
        res.status(400).json({ok:false , message:'Error al cargar los datos.'})
        return
    }

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
            res.status(400).json({ok:false , message:'Error al cargar los datos de entrega.'})
            return
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
    const cliente = await Cliente.findById(clienteID);
    const medioPago = await MedioPago.findById(medioPagoID);

    if (!cliente || !medioPago) {
        return res.status(400).json({ ok: false, message: "Cliente o medio de pago inválido." });
    }

    // ⭐ VALIDAR CUENTA CORRIENTE
    if (medioPago.name === "Cuenta Corriente") {

        // 1️⃣ ¿El cliente tiene CC habilitada?
        if (!cliente.cuentaCorriente) {
            return res.status(400).json({
                ok: false,
                message: "El cliente no tiene habilitada la Cuenta Corriente."
            });
        }

        // 2️⃣ ¿Tiene saldo suficiente?
        if (cliente.saldoActualCuentaCorriente < totalP) {
            return res.status(400).json({
                ok: false,
                message: `Saldo insuficiente. Saldo actual: $${cliente.saldoActualCuentaCorriente}`
            });
        }

        // 3️⃣ Descontar el saldo
        if(descuento){
          cliente.saldoActualCuentaCorriente -= totalP - ((totalP*descuento)/100);
        } else if (!descuento){
          cliente.saldoActualCuentaCorriente -= totalP;
        }
        

        // 4️⃣ Guardar el nuevo saldo antes de continuar
        await cliente.save();
    }

    await newNotaPedido.save()
        .then( () => {
            res.status(201).json({
                ok:true, 
                message:'Nota de pedido agregada correctamente.',
                data: newNotaPedido
            })
        })
        .catch((err)=>{console.log(err)});

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
    console.error("Error al obtener notas de pedido:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno al obtener las notas de pedido."
    });
  }
};


const getNotaPedidoID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const notaPedido = await NotaPedido.findById(id);
    if(!notaPedido){
        res.status(400).json({
            ok:false,
            message:'El id no corresponde a un Nota de pedido.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:notaPedido,
    })
}

const getNotaPedidoByCliente = async(req,res) => {
    const clienteID = req.params.id;
    if(!clienteID){
        res.status(400).json({ 
            ok:false,
            message:'El id no llego al controlador correctamente.'
        })
        return
    }
    const notaPedidos = await NotaPedido.find({ cliente: clienteID , estado:true });
    if(!notaPedidos || notaPedidos.length === 0){
        res.status(404).json({
            ok:false,
            message:'No se encontraron pedidos para el cliente especificado.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:notaPedidos,
    })
}


const updateNotaPedido = async (req, res) => {
    const id = req.params.id;

    if (!id) {
        return res.status(400).json({
            ok: false,
            message: 'El id no llegó al controlador correctamente.'
        });
    }

    const estadoP = req.body.facturado;
    if (estadoP === true) {
        return res.status(400).json({ ok: false, message: 'El pedido ya está cerrado.' });
    }

    const totalP = req.body.total;
    const envioP = req.body.envio;
    const fechaEntregaP = req.body.fechaEntrega;
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

    // ✨ Obtener el pedido y cliente
    const pedido = await NotaPedido.findById(id);
    const cliente = await Cliente.findById(clienteID);

    if (!pedido || !cliente) {
        return res.status(400).json({ ok: false, message: "Pedido o cliente inválido." });
    }

    const medioPagoAnterior = await MedioPago.findById(pedido.medioPago);
    const medioPagoActual = await MedioPago.findById(medioPagoID);

    // ✨ Datos a actualizar
    const updatedPedidoData = {
        total: totalP,
        cliente: clienteID,
        empleado: empleadoID,
        medioPago: medioPagoID,
        fechaEntrega: fechaEntregaP,
        envio: envioP
    };

    if (presupuestoID) updatedPedidoData.presupuesto = presupuestoID;

    // ✨ Recalcular total con descuento
    if (descuento > 0) {
        updatedPedidoData.descuento = descuento;
        updatedPedidoData.total = totalP - ((totalP * descuento) / 100);
    }

    // ✨ Dirección si aplica
    if (envioP) {
        if (!provincia || !localidad || !barrio || !calle || !altura) {
            return res.status(400).json({ ok: false, message: 'Datos de entrega incompletos.' });
        }
        updatedPedidoData.provincia = provincia;
        updatedPedidoData.localidad = localidad;
        updatedPedidoData.barrio = barrio;
        updatedPedidoData.calle = calle;
        updatedPedidoData.altura = altura;
        updatedPedidoData.deptoNumero = deptoNumero;
        updatedPedidoData.deptoLetra = deptoLetra;
    }

    // ===============================================================
    // ⭐⭐⭐ MANEJO CORRECTO DE CUENTA CORRIENTE ⭐⭐⭐
    // ===============================================================

    const totalPedidoAnterior = pedido.descuento
        ? pedido.total - ((pedido.total * pedido.descuento) / 100)
        : pedido.total;

    const totalPedidoNuevo = descuento
        ? totalP - ((totalP * descuento) / 100)
        : totalP;

    // 1️⃣ SI ANTES ERA CC Y AHORA NO → DEVUELVE SALDO
    if (medioPagoAnterior.name === "Cuenta Corriente" &&
        medioPagoActual.name !== "Cuenta Corriente") {

        cliente.saldoActualCuentaCorriente += totalPedidoAnterior;
        await cliente.save();
    }

    // 2️⃣ SI ANTES NO ERA CC Y AHORA SÍ → DESCUENTA SALDO
    else if (medioPagoAnterior.name !== "Cuenta Corriente" &&
        medioPagoActual.name === "Cuenta Corriente") {

        if (!cliente.cuentaCorriente) {
            return res.status(400).json({
                ok: false,
                message: "El cliente no tiene habilitada la Cuenta Corriente."
            });
        }

        if (cliente.saldoActualCuentaCorriente < totalPedidoNuevo) {
            return res.status(400).json({
                ok: false,
                message: `Saldo insuficiente. Saldo actual: $${cliente.saldoActualCuentaCorriente}`
            });
        }       

        cliente.saldoActualCuentaCorriente -= totalPedidoNuevo;
        await cliente.save();
    }
    
    // SI ANTES ERA CC Y AHORA SÍ → DESCUENTA SALDO
    else if (medioPagoAnterior.name === "Cuenta Corriente" &&
        medioPagoActual.name === "Cuenta Corriente") {
        
        cliente.saldoActualCuentaCorriente = cliente.saldoActualCuentaCorriente + totalPedidoAnterior - totalPedidoNuevo;
        await cliente.save();
    }

    // ===============================================================

    // ✨ Actualizar pedido
    const updatedNotaPedido = await NotaPedido.findByIdAndUpdate(
        id,
        updatedPedidoData,
        { new: true, runValidators: true }
    );

    if (!updatedNotaPedido) {
        return res.status(400).json({
            ok: false,
            message: 'Error al actualizar la Nota de pedido.'
        });
    }

    res.status(200).json({
        ok: true,
        data: updatedNotaPedido,
        message: 'Nota de pedido actualizada correctamente.'
    });
};


const deleteNotaPedido = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        ok: false,
        message: 'El ID no llegó correctamente al controlador.'
      });
    }

    const nota = await NotaPedido.findById(id);
    if (!nota) {
      return res.status(404).json({
        ok: false,
        message: 'La nota de pedido no fue encontrada.'
      });
    }

    const comprobanteAsociado = await ComprobanteVenta.exists({ notaPedido: id , estado:true});
    if (comprobanteAsociado) {
      return res.status(400).json({
        ok: false,
        message: 'No se puede eliminar la nota de pedido porque posee servicios asociados.'
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
      message: 'Nota de pedido eliminada correctamente y stock reintegrado.'
    });

  } catch (error) {
    console.error('Error en deleteNotaPedido:', error);
    res.status(500).json({
      ok: false,
      message: 'Error interno del servidor.',
      error: error.message
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
        res.status(500).json({ ok: false, message: "Error al buscar presupuestos" });       
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
        res.status(200).json({ ok: true, data: pedidosFiltrados });
    } else {
        res.status(500).json({ ok: false, message: "Error al buscar notas de pedido" });
    }
};

module.exports = { setNotaPedido , getNotaPedido , getNotaPedidoID , getNotaPedidoByCliente , updateNotaPedido , deleteNotaPedido , buscarNotaPedido };
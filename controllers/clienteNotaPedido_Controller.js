const NotaPedido = require("../models/clienteNotaPedido_Model");
const NotaPedidoDetalle = require("../models/clienteNotaPedidoDetalle_Model");
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

    if(!totalP || !fechaP || !clienteID || !empleadoID || !medioPagoID || !fechaEntregaP){
        res.status(400).json({ok:false , message:'Error al cargar los datos.'})
        return
    }
    const newNotaPedido = new NotaPedido ({
        _id: newId,
        total: totalP , 
        fecha: fechaP , 
        cliente: clienteID,
        empleado:empleadoID , 
        medioPago:medioPagoID , 
        fechaEntrega:fechaEntregaP , 
        envio:envioP,
        facturado: false,
        estado:true
    });
    if (presupuestoID) {
        newNotaPedido.presupuesto = presupuestoID;
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

const getNotaPedido = async(req, res) => {
    const notaPedidos = await NotaPedido.find({estado:true});

    res.status(200).json({
        ok:true,
        data: notaPedidos,
    })
}

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
    const notaPedidos = await NotaPedido.find({ cliente: clienteID });
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


const updateNotaPedido = async(req,res) => {
    const id = req.params.id;
    
    const estadoP = req.body.facturado;
    if (estadoP === true) {
        res.status(400).json({ok:false , message:'El pedido ya esta cerrado.'})
        return
    }

    const totalP = req.body.total;
    const fechaP = obtenerFechaHoy();
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

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.',
        })
        return
    }


     const updatedPedidoData = {
        total: totalP , 
        fecha: fechaP , 
        cliente: clienteID,
        empleado:empleadoID , 
        medioPago:medioPagoID , 
        fechaEntrega:fechaEntregaP , 
        envio:envioP
    };
    
    if (presupuestoID) {
        updatedPedidoData.presupuesto = presupuestoID;
    }

    if (envioP) {
        if(!provincia || !localidad || !barrio || !calle || !altura){
            res.status(400).json({ok:false , message:'Error al cargar los datos de entrega.'})
            return
        }
        updatedPedidoData.provincia = provincia;
        updatedPedidoData.localidad = localidad;
        updatedPedidoData.barrio = barrio;
        updatedPedidoData.calle = calle;
        updatedPedidoData.altura = altura;
        updatedPedidoData.deptoNumero = deptoNumero;
        updatedPedidoData.deptoLetra = deptoLetra;
    }

    const updatedNotaPedido = await NotaPedido.findByIdAndUpdate(
        id,
        updatedPedidoData,
        { new: true , runValidators: true }
    )

    if(!updatedNotaPedido){
        res.status(400).json({
            ok:false,
            message:'Error al actualizar el Nota de pedido.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:updatedNotaPedido,
        message:'Nota de pedido actualizada correctamente.',
    })
}

const deleteNotaPedido = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.'
        })
        return
    }

    const deletedNotaPedido = await NotaPedido.findByIdAndUpdate(
        id,
        {estado:false},
        { new: true , runValidators: true }
    )
    if(!deletedNotaPedido){
        res.status(400).json({
            ok:false,
            message: 'Error durante el borrado.'
        })
        return
    }
    const deletedNotaPedidoDetalle = await NotaPedidoDetalle.updateMany(
        {notaPedido:id},
        {   
            estado: false
        },
        { new: true , runValidators: true }
    )
    if(!deletedNotaPedidoDetalle){
        res.status(400).json({
            ok:false,
            message: 'Error durante el borrado.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'Nota de pedido eliminado correctamente.'
    })
}

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
             coincideDeptoLetra && coincideDeptoNumero && coincideAltura;
    });
    
    if(pedidosFiltrados.length > 0){
        res.status(200).json({ ok: true, data: pedidosFiltrados });
    } else {
        res.status(500).json({ ok: false, message: "Error al buscar notas de pedido" });
    }
};

module.exports = { setNotaPedido , getNotaPedido , getNotaPedidoID , getNotaPedidoByCliente , updateNotaPedido , deleteNotaPedido , buscarNotaPedido };
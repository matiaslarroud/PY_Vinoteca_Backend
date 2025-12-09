const Remito = require("../models/clienteRemito_Model");
const RemitoDetalle = require("../models/clienteRemitoDetalle_Model");
const ComprobanteVenta = require("../models/clienteComprobanteVenta_Model");
const NotaPedido = require("../models/clienteNotaPedido_Model");
const getNextSequence = require("../controllers/counter_Controller");

const obtenerFechaHoy = () => {
  const hoy = new Date();
  return hoy.toISOString().split("T")[0];
}

const setRemito = async (req, res) => {
    
    try {
        const totalPrecio = req.body.totalPrecio;
        const totalBultos = req.body.totalBultos;
        const fecha = obtenerFechaHoy();
        const comprobanteVentaID = req.body.comprobanteVentaID;
        const transporteID = req.body.transporteID;

        // Validar datos obligatorios
        if (!totalPrecio || !totalBultos || !fecha || !comprobanteVentaID || !transporteID) {
            return res.status(400).json({
                ok: false,
                message: "❌ Faltan completar algunos campos obligatorios."
            });
        }

        const newId = await getNextSequence("Cliente_Remito");
        const newRemito = new Remito({
            _id: newId,
            totalPrecio: totalPrecio,
            totalBultos: totalBultos,
            fecha: fecha,
            comprobanteVentaID: comprobanteVentaID,
            transporteID: transporteID,
            estado:true
        });

        if (req.body.entregado !== undefined) {
            newRemito.entregado = false;
        }
        
        // Actualizar el comprobante de venta a remito creado
        const updateComprobanteVentaState = await ComprobanteVenta.findByIdAndUpdate(
            comprobanteVentaID,
            { remitoCreado: true },
            { new: true, runValidators: true }
        );

        if (!updateComprobanteVentaState) {
            return res.status(400).json({
                ok: false,
                message: '❌ Error al actualizar el estado del comprobante de venta.'
            });
        }

        await newRemito.save();

        return res.status(201).json({
            ok: true,
            message: '✔️ Remito agregado correctamente.',
            data: newRemito
        })

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            message: '❌ Error interno del servidor.'
        });
    }
};


const getRemito = async(req, res) => {
    const remitos = await Remito.find({estado:true}).lean();

    res.status(200).json({
        ok:true,
        data: remitos
    })
}

const getRemitoID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente',
        })
        return
    }

    const remitoEncontrado = await Remito.findById(id);
    if(!remitoEncontrado){
        res.status(400).json({
            ok:false,
            message:'❌ El id no corresponde a un remito.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        message:'✔️ Remito obtenido correctamente.',
        data:remitoEncontrado,
    })
}

const updateRemito = async(req,res) => {
    const id = req.params.id;
    
    const totalPrecio = req.body.totalPrecio;
    const totalBultos = req.body.totalBultos;
    const fecha = obtenerFechaHoy();
    const comprobanteVentaID = req.body.comprobanteVentaID;
    const transporteID = req.body.transporteID;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.',
        })
        return
    }
    
    const updatedRemitoData = {
        totalPrecio: totalPrecio,
        totalBultos: totalBultos,
        fecha: fecha,
        transporteID: transporteID,
        entregado: req.body.entregado,
    };
    
    if (comprobanteVentaID) {
        updatedRemitoData.comprobanteVentaID = comprobanteVentaID;
    }

    const updatedRemito = await Remito.findByIdAndUpdate(
        id,
        updatedRemitoData,
        { new: true , runValidators: true }
    )

    if(!updatedRemito){
        res.status(400).json({
            ok:false,
            message:'❌ Error al actualizar el remito.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:updatedRemito,
        message:'✔️ Remito actualizado correctamente.',
    })
}

const deleteRemito = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente.'
        })
        return
    }

    const deletedRemito = await Remito.findByIdAndUpdate(
        id,
        {estado:false},
        { new: true , runValidators: true }
    )
    if(!deletedRemito){
        res.status(400).json({
            ok:false,
            message: '❌ Error durante el borrado.'
        })
        return
    }

    const deletedRemitoDetalle = await RemitoDetalle.updateMany(
        {remitoID:id},
        {   
            estado:false
        },
        { new: true , runValidators: true }
    )
    if(!deletedRemitoDetalle){
        res.status(400).json({
            ok:false,
            message: '❌ Error durante el borrado.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'✔️ Remito eliminado correctamente.',
    })
}

const buscarRemito = async (req, res) => {
  try {
    const remitoID = req.body.remitoID;
    const clienteP = req.body.cliente;
    const detallesP = req.body.detalles || [];
    const comprobanteVentaIDP = req.body.comprobanteVentaID;
    const transporteP = req.body.transporteID;
    const totalPrecioP = Number(req.body.totalPrecio) || 0;
    const totalBultosP = Number(req.body.totalBultos) || 0;
    const fechaP = req.body.fecha ? new Date(req.body.fecha) : null;
    const entregadoP = req.body.entregado;

    // 1️⃣ Buscar notas de pedido del cliente (si hay cliente seleccionado)
    let notasPedidoCliente = [];
    let comprobantesCliente = [];
    let idsNotasCliente = [];
    if (clienteP) {
      notasPedidoCliente = await NotaPedido.find({ cliente: clienteP }).select("_id");
      idsNotasCliente = notasPedidoCliente.map(np => String(np._id));
      comprobantesCliente = await ComprobanteVenta.find({ notaPedido: { $in : idsNotasCliente} }).select("_id");
    }

    const idsComprobantesCliente = comprobantesCliente.map(np => String(np._id));

    // 2️⃣ Buscar los comprobantes según productos (si hay detalles)
    const productosBuscados = detallesP.length > 0
      ? detallesP.map(d => d.producto)
      : [];

    let detallesFiltrados = [];
    if (productosBuscados.length > 0) {
      detallesFiltrados = await RemitoDetalle.find({
        producto: { $in: productosBuscados },
      });
    } if (productosBuscados.length > 0 && detallesFiltrados.length === 0) {
        res.status(500).json({ ok: false, message: "❌ Error al buscar remitos" });       
    } else {
      detallesFiltrados = await RemitoDetalle.find();
    }

    const remitosIDs = [
      ...new Set(
        detallesFiltrados
          .map(d => d.remitoID)
          .filter(id => id !== undefined && id !== null)
      ),
    ];

    let remitos = await Remito.find(
      remitosIDs.length > 0 ? { _id: { $in: remitosIDs } } : {}
    );

    // ⚠️ 3️⃣ Verificar si no hay ningún filtro activo
    const sinFiltrosActivos =
      !clienteP &&
      !comprobanteVentaIDP &&
      !fechaP &&
      !entregadoP &&
      !transporteP &&
      (totalBultosP === 0 || totalBultosP === "") &&
      (totalPrecioP === 0 || totalPrecioP === "") &&
      detallesP.length === 0;

    if (sinFiltrosActivos) {
      console.log("🔄 Búsqueda sin filtros: devolviendo todos los remitos");
      return res.status(200).json({ ok: true, data: remitos });
    }

    // 4️⃣ Aplicar filtros
    const remitosFiltrados = remitos.filter(p => {
        const coincideEstado = p.estado === true;
      const coincideRemito = remitoID ? (p._id) === Number(remitoID) : true;
      const coincideTotalBultos = totalBultosP ? Number(p.totalBultos) === totalBultosP : true;
      const coincideTotalPrecio = totalPrecioP ? Number(p.totalPrecio) === totalPrecioP : true;
      const coincideFecha = fechaP
        ? String(new Date(p.fecha).toISOString().split("T")[0]) ===
          String(fechaP.toISOString().split("T")[0])
        : true;
      const coincideComprobante = comprobanteVentaIDP ? String(p.comprobanteVentaID) === String(comprobanteVentaIDP) : true;
      const coincideCliente = clienteP
        ? p.comprobanteVentaID && idsComprobantesCliente.includes(String(p.comprobanteVentaID))
        : true;
      const coincideEntregado = typeof envio === "boolean" ? p.envio === envio : true;
      const coincideTransporte = transporteP ? String(p.transporteID) === String(transporteP) : true;

      return coincideCliente && coincideTotalBultos && coincideTotalPrecio && coincideComprobante &&
             coincideFecha && coincideEntregado && coincideTransporte && coincideRemito && coincideEstado;
    });

    console.log("✅ Remitos filtrados:", remitosFiltrados.length);

    if (remitosFiltrados.length > 0) {
      res.status(200).json({ ok: true, data: remitosFiltrados });
    } else {
      res.status(200).json({ ok: false, message: "❌ No se encontraron remitos con esos filtros" });
    }

  } catch (error) {
    res.status(500).json({ ok: false, message: "❌ Error interno del servidor" });
  }
};


module.exports = { setRemito , getRemito , getRemitoID , updateRemito , deleteRemito , buscarRemito };
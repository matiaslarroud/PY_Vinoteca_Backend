const ComprobanteCompra = require("../models/proveedorComprobanteCompra_Model");
const ComprobanteCompraDetalle = require("../models/proveedorComprobanteCompraDetalle_Model");
const OrdenCompra = require("../models/proveedorOrdenCompra_Model");
const Proveedor = require("../models/proveedor_Model");
const getNextSequence = require("./counter_Controller");

const obtenerFechaHoy = () => {
  const hoy = new Date();
  return hoy.toISOString().split("T")[0];
}

const setComprobanteCompra = async (req,res) => {
    const newId = await getNextSequence("Proveedor_ComprobanteCompra");
    const total = req.body.total;
    const fecha = obtenerFechaHoy();
    const ordenCompra = req.body.ordenCompra;


    if(!total || !fecha || !ordenCompra ){
        res.status(400).json({ok:false , message:'Error al cargar los datos.'})
        return
    }
    
    const newComprobanteCompra = new ComprobanteCompra ({
        _id: newId,
        total: total , 
        fecha: fecha , 
        ordenCompra : ordenCompra ,
        completo : false ,
        estado:true
    });

    await newComprobanteCompra.save()
        .then( () => {
            res.status(201).json({
                ok:true, 
                message:'Comprobante de compra agregada correctamente.',
                data: newComprobanteCompra
            })
        })
        .catch((err)=>{console.log(err)});

}

const getComprobanteCompra = async(req, res) => {
    const comprobantes = await ComprobanteCompra.find({estado:true});

    res.status(200).json({
        ok:true,
        data: comprobantes,
    })
}

const getComprobanteCompraID = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        ok: false,
        message: "El ID no llegó correctamente al controlador.",
      });
    }

    // Buscar comprobante principal
    const comprobanteCompra = await ComprobanteCompra.findById(id);
    if (!comprobanteCompra) {
      return res.status(404).json({
        ok: false,
        message: "No se encontró el comprobante de compra solicitado.",
      });
    }

    // Buscar orden de compra asociada
    const ordenCompra = await OrdenCompra.findById(comprobanteCompra.ordenCompra);
    if (!ordenCompra) {
      return res.status(404).json({
        ok: false,
        message: "La orden de compra asociada no fue encontrada.",
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
      data: body,
    });
  } catch (err) {
    console.error("Error al obtener comprobante de compra:", err);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor al obtener el comprobante de compra.",
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
        message: "El ID no llegó correctamente al controlador.",
      });
    }

    // 1️⃣ Obtener las órdenes de compra del proveedor
    const ordenesCompra = await OrdenCompra.find({ estado: true, proveedor: id });

    if (!ordenesCompra || ordenesCompra.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "No se encontraron órdenes de este proveedor.",
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
        message: "No se encontraron comprobantes de compra para este proveedor.",
      });
    }

    // 5️⃣ Devolverlos
    res.status(200).json({
      ok: true,
      data: comprobantes
    });

  } catch (err) {
    console.error("Error al obtener comprobantes de compra:", err);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor al obtener los comprobantes de compra.",
      error: err.message,
    });
  }
};


const updateComprobanteCompra = async(req,res) => {
    const id = req.params.id;
    
    const total = req.body.total;
    const fecha = req.body.fecha;
    const ordenCompra = req.body.ordenCompra;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.',
        })
        return
    }

    const updatedComprobanteCompra = await ComprobanteCompra.findByIdAndUpdate(
        id,
        {   
            total: total , 
            fecha: fecha , 
            ordenCompra : ordenCompra ,
        },
        { new: true , runValidators: true }
    )

    if(!updatedComprobanteCompra){
        res.status(400).json({
            ok:false,
            message:'Error al actualizar la comprobante de compra.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:updatedComprobanteCompra,
        message:'Comprobante de compra actualizado correctamente.',
    })
}

const deleteComprobanteCompra = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.'
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
            message: 'Error durante el borrado.'
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
            message: 'Error durante el borrado del detalle.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'Comprobante de compra eliminado correctamente.'
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
        res.status(500).json({ ok: false, message: "Error al buscar presupuestos" });       
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
      res.status(200).json({ ok: true, data: comprobantesFiltrados });
    } else {
      res.status(200).json({ ok: false, message: "No se encontraron comprobantes con esos filtros" });
    }

  } catch (error) {
    console.error("Error al buscar comprobantes:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
}; 


module.exports = { setComprobanteCompra , buscarComprobanteCompra , getComprobantesByProveedor , getComprobanteCompra , getComprobanteCompraID , updateComprobanteCompra , deleteComprobanteCompra };
const ComprobantePago = require("../models/proveedorComprobantePago_Model");
const ComprobanteCompra = require("../models/proveedorComprobanteCompra_Model");
const OrdenCompra = require("../models/proveedorOrdenCompra_Model");
const getNextSequence = require("./counter_Controller");

const obtenerFechaHoy = () => {
  const hoy = new Date();
  return hoy.toISOString().split("T")[0];
}

const setComprobantePago = async (req,res) => {
    const total = req.body.total;
    const medioPago = req.body.medioPago;
    const fecha = obtenerFechaHoy();
    const comprobanteCompra = req.body.comprobanteCompra;

    if( !total || !fecha || !medioPago || !comprobanteCompra ){
        res.status(400).json({ok:false , message:"❌ Faltan completar algunos campos obligatorios."})
        return
    }
    
    const newId = await getNextSequence("Proveedor_ComprobantePago");
    const newComprobantePago = new ComprobantePago ({
        _id: newId,
        total: total , 
        fecha: fecha , 
        comprobanteCompra : comprobanteCompra ,
        medioPago : medioPago ,
        estado:true
    });

    await newComprobantePago.save()
        .then( () => {
            res.status(201).json({
                ok:true, 
                message:'✔️ Comprobante de pago agregado correctamente.',
                data: newComprobantePago
            })
        })
        .catch((err)=>{
            res.status(400).json({
            ok: false,
            message: "❌ Error al agregar comprobante de pago."
            });
        });

}

const getComprobantePago = async (req, res) => {
    try {
        const comprobantes = await ComprobantePago.find({ estado: true })
            .populate({
                path: "comprobanteCompra",     // 1️⃣ Trae el comprobante de compra
                select: "ordenCompra",         // Solo necesito la orden
                populate: {
                    path: "ordenCompra",       // 2️⃣ Desde ahí traigo la orden
                    select: "proveedor",       // Solo necesito el proveedor
                    populate: {
                        path: "proveedor",     // 3️⃣ Finalmente traigo el proveedor
                    }
                }
            });
        
        // Agregar proveedorID directamente en la respuesta
        const respuesta = comprobantes.map(c => ({
            ...c.toObject(),
            proveedor: c.comprobanteCompra?.ordenCompra?.proveedor?._id || null
        }));

        res.status(200).json({
            ok: true,
            data: respuesta
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            message: "❌ Error al obtener comprobantes de pago"
        });
    }
};



const getComprobantePagoID = async (req, res) => {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({
                ok: false,
                message: "❌ El id no llegó al controlador correctamente",
            });
        }

        // 1️⃣ Buscar ComprobantePago
        const comprobantePago = await ComprobantePago.findById(id);
        if (!comprobantePago) {
            return res.status(400).json({
                ok: false,
                message: "❌ El id no corresponde a un comprobante de pago.",
            });
        }

        // 2️⃣ Extraer el comprobanteCompra desde el comprobantePago
        const comprobanteCompraID = comprobantePago.comprobanteCompra;

        let proveedor = null;
        let comprobante = null;

        if (comprobanteCompraID) {
            // 3️⃣ Buscar ComprobanteCompra
            const comprobanteCompra = await ComprobanteCompra.findById(comprobanteCompraID);

            if (comprobanteCompra) {
                const ordenCompraID = comprobanteCompra.ordenCompra;

                if (ordenCompraID) {
                    // 4️⃣ Buscar OrdenCompra
                    const ordenCompra = await OrdenCompra.findById(ordenCompraID);

                    if (ordenCompra) {
                        proveedor = ordenCompra.proveedor;
                        comprobante = comprobanteCompra._id;
                    }
                }
            }
        }
        // 5️⃣ Devolver todo junto
        res.status(200).json({
            ok: true,
            data: {
                ...comprobantePago.toObject(),
                proveedor,
            },
            message: "✔️ Comprobante de pago obtenido correctamente.",
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            message: "❌ Error al obtener comprobante de pago",
        });
    }
};


const updateComprobantePago = async(req,res) => {
    const id = req.params.id;
    
    const total = req.body.total;
    const fecha = req.body.fecha;
    const medioPago = req.body.medioPago;
    const comprobanteCompra = req.body.comprobanteCompra;


    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌El id no llego al controlador correctamente.',
        })
        return
    }

    if( !total || !medioPago || !comprobanteCompra ){
        res.status(400).json({ok:false , message:"❌ Faltan completar algunos campos obligatorios."})
        return
    }

    const updatedComprobantePago = await ComprobantePago.findByIdAndUpdate(
        id,
        {   
            total: total , 
            fecha: fecha , 
            comprobanteCompra : comprobanteCompra ,
            medioPago : medioPago ,
        },
        { new: true , runValidators: true }
    )

    if(!updatedComprobantePago){
        res.status(400).json({
            ok:false,
            message:'❌ Error al actualizar el comprobante de pago.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:updatedComprobantePago,
        message:'✔️ Comprobante de pago actualizado correctamente.',
    })
}

const deleteComprobantePago = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente.'
        })
        return
    }

    const deletedComprobantePago = await ComprobantePago.findByIdAndUpdate(
        id,
        {   
            estado:false
        },
        { new: true , runValidators: true }
    )
;
    if(!deletedComprobantePago){
        res.status(400).json({
            ok:false,
            message: '❌ Error durante el borrado.'
        })
        return
    }
    
    res.status(200).json({
        ok:true,
        message:'✔️ Comprobante de pago eliminado correctamente.'
    })
}

const buscarComprobantePago = async (req, res) => {
  try {
    const comprobanteID = Number(req.body.comprobanteID);
    const proveedor = req.body.proveedor;
    const comprobanteCompra = Number(req.body.comprobanteCompra);
    const medioPago = Number(req.body.medioPago);
    const total = Number(req.body.total) || 0;

    // 1) Traer los comprobantesPago
    const comprobantes = await ComprobantePago.find({ estado: true });

    // 2) Buscar ordenCompra por proveedor (si se filtró)
    let idsComprobantesCompra = [];

    if (proveedor) {
      const ordenes = await OrdenCompra.find({
        estado: true,
        proveedor: proveedor
      });

      const ordenesIDs = ordenes.map(o => o._id);

      const comprobantesCompraProveedor = await ComprobanteCompra.find({
        estado: true,
        ordenCompra: { $in: ordenesIDs }
      });

      idsComprobantesCompra = comprobantesCompraProveedor.map(c => c._id);
    }

    // 3) Chequeo de filtros activos
    const sinFiltros =
      !comprobanteID &&
      !proveedor &&
      !comprobanteCompra &&
      !medioPago &&
      total === 0;

    if (sinFiltros) {
      return res.status(200).json({ ok: true, data: comprobantes });
    }

    // 4) Aplicar filtros
    const comprobantesFiltrados = comprobantes.filter(p => {
      const coincideID = comprobanteID ? Number(p._id) === comprobanteID : true;

      const coincideTotal = total ? Number(p.total) === total : true;

      const coincideComprobanteCompra = comprobanteCompra
        ? Number(p.comprobanteCompra) === comprobanteCompra
        : true;

      const coincideProveedor = proveedor
        ? idsComprobantesCompra.includes(p.comprobanteCompra)
        : true;

      const coincideMedioPago = medioPago
        ? Number(p.medioPago) === medioPago
        : true;

      return (
        coincideID &&
        coincideTotal &&
        coincideComprobanteCompra &&
        coincideProveedor &&
        coincideMedioPago
      );
    });

    if (comprobantesFiltrados.length > 0) {
      res.status(200).json({ ok: true, message: "✔️ Comprobantes de pago obtenidos", data: comprobantesFiltrados });
    } else {
      res.status(200).json({
        ok: false,
        message: "❌ No se encontraron comprobantes con esos filtros"
      });
    }
  } catch (error) {
    console.error("❌ Error al buscar comprobantes:", error);
    res.status(500).json({ ok: false, message: "❌ Error interno del servidor" });
  }
};


module.exports = { setComprobantePago, buscarComprobantePago , getComprobantePago , getComprobantePagoID , updateComprobantePago , deleteComprobantePago };
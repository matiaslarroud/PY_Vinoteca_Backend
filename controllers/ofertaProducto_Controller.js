const OfertaProducto = require("../models/ofertaProducto_Model.js")
const OfertaProductoDetalle = require("../models/ofertaProductoDetalle_Model.js");

const getNextSequence = require("./counter_Controller.js");

const setOferta =  async (req , res ) => {
    const name = req.body.name;
    const total = req.body.total;
    const estadoPromocion = req.body.estadoPromocion;
    
    if (!name || !total || !estadoPromocion ) {
        res.status(400).json({ok:false , message:"❌ Faltan completar algunos campos obligatorios."});
        return
    }

    const newId = await getNextSequence("ProductoOferta");
    const newProduct = new Product({
        _id: newId,
        name: name , 
        total: total , 
        estadoPromocion: estadoPromocion , 
        estado:true
    });

    await newProduct.save()
        .then(() => { 
            res.status(201).json({
                ok:true ,
                data: newProduct,
                message:'✔️ Oferta agregada correctamente.'
            })
        })
        .catch((err)=>{
            res.status(400).json({
            ok: false,
            message: "❌ Error al agregar oferta."
            });
        });
    
}

const getOferta = async(req,res) => {
    const ofertas = await OfertaProducto.find({estado:true}).lean();

    res.status(200).json({
        ok:true,
        data:ofertas
    })
}

const getOfertaID = async(req,res) => {
    const id = req.params.id;
    if(!id) {
        res.status(400).json({
            ok:false, 
            message:"❌ El id no llego al controlador correctamente."
        })
        return
    }
    
    const oferta = await OfertaProducto.findById(id);
    if (!oferta) {
        res.status(400).json({
            ok:false, 
            message:"❌ El id no corresponde a una oferta."
        });
        return
    }
    res.status(200).json({
        ok:true,
        message:"✔️ Oferta obtenida correctamente.",
        data: oferta
    })
}
const updateOferta =  async (req , res ) => {
    const id = req.params.id;
    
    const name = req.body.name;
    const total = req.body.total;
    const estadoPromocion = req.body.estadoPromocion;
    
    if (!name || !total || !estadoPromocion) {
        res.status(400).json({
            ok:false , 
            message:"❌ Faltan completar algunos campos obligatorios."
        });
        return
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(
            id, 
            {
                name: name , 
                total: total ,
                estadoPromocion : estadoPromocion
            },
            { new: true , runValidators: true }
        )

        
    if(!updatedProduct) {
        res.status(400).json({
            ok:false,
            message:"❌ Error al actualizar oferta."
        });
        return
    }
    res.status(200).json({
        ok:true , 
        data: updatedProduct,
        message:"✔️ Oferta actualizada correctamente."
    })    
}

//Validaciones de eliminacion
const NotaPedidoDetalle = require("../models/clienteNotaPedidoDetalle_Model.js");
const PresupuestoDetalle = require("../models/clientePresupuestoDetalle_Model.js");

const deleteOferta = async (req , res) => {
    const id = req.params.id;

    if(!id) {
        res.status(400).json({ok:false,message:"❌ Error al eliminar picada."});
        return
    }

    const presupuestos = await PresupuestoDetalle.find({
        estado:true,
        producto:id
    }).lean();

    const pedidos = await NotaPedidoDetalle.find({
        estado:true,
        producto:id
    }).lean();

    // Si aparece en Presupuesto Cliente → verifico si es una picada
    for (const s of presupuestos) {
        const prod = await OfertaProducto.findById(s.producto).lean();
        if (prod) {
            return res.status(400).json({
                ok:false,
                message:"❌ No se puede eliminar la oferta porque posee servicios asociados."
            });
        }
    }

    // Si aparece en Notas de Pedido Cliente → verifico si es una picada
    for (const s of pedidos) {
        const prod = await OfertaProducto.findById(s.producto).lean();
        if (prod) {
            return res.status(400).json({
                ok:false,
                message:"❌ No se puede eliminar la oferta porque posee servicios asociados."
            });
        }
    }

    const deletedOferta = await OfertaProducto.findByIdAndUpdate(
            id, 
            {
                estado:false
            },
            { new: true , runValidators: true }
        )

    const deletedOfertaDetalle = await OfertaProductoDetalle.updateMany(
        {oferta:id},
        {   
            estado:false
        },
        { new: true , runValidators: true }
    )
    if(!deletedOferta || !deletedOfertaDetalle) {
        res.status(400).json({ok:false,message:"❌ Error al eliminar oferta."});
        return
    }
    res.status(200).json({ok:true , message:"✔️ Oferta eliminada correctamente."});
}

const buscarOferta = async(req,res) => {
  try {
    const ofertaID = req.body.ofertaID;
    const name = req.body.name;
    const total = req.body.total;
    const estadoPromocion = req.body.estadoPromocion;

    const ofertas = await OfertaProducto.find({estado:true});

    const ofertasFiltradas = ofertas.filter(c => {
    // Cada condición solo se evalúa si el campo tiene valor
    const coincideEstado = c.estado === true;
    const coincideOfertaID = ofertaID ? (c._id) === Number(ofertaID) : true;
    const coincideNombre = name ? c.name?.toLowerCase().includes(name.toLowerCase()) : true;
    const coincideTotal = total ? Number(c.total) === Number(total) : true;
    const coincideEstadoPromocion = estadoPromocion ? c.estadoPromocion === estadoPromocion : true;

    // Si todos los criterios activos coinciden => mantener cliente
    return (
        coincideOfertaID &&
        coincideEstado &&
        coincideNombre &&
        coincideTotal &&
        coincideEstadoPromocion 
    );
    });

    res.status(200).json({ ok: true, data: ofertasFiltradas });

    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: "❌ Error al buscar ofertas" });
  }
}

module.exports = {setOferta , getOferta , getOfertaID , updateOferta , deleteOferta , buscarOferta};
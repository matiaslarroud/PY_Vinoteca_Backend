const Product = require('../models/productoInsumo_Model')
const getNextSequence = require("../controllers/counter_Controller");

const setProduct =  async (req , res ) => {
    const nombreProducto = req.body.name;
    const precioProducto = req.body.precioCosto;
    const stockProducto = req.body.stock;
    const stockMinimoProducto = req.body.stockMinimo;
    const gananciaProducto = req.body.ganancia;
    const depositoProducto = req.body.deposito;
    const proveedorProducto = req.body.proveedor;
    const productType = 'ProductoInsumo';
    
    if (!nombreProducto || !productType || !precioProducto || !stockProducto ||  !gananciaProducto || !depositoProducto || !proveedorProducto) {
        res.status(400).json({ok:false , message:'❌ Faltan completar algunos campos obligatorios.'});
        return
    }

    const newId = await getNextSequence("Producto");
    const newProduct = new Product({
        _id: newId,
        name: nombreProducto , 
        precioCosto: precioProducto , 
        stock: stockProducto , 
        ganancia: gananciaProducto , 
        deposito: depositoProducto, 
        proveedor: proveedorProducto,
        tipoProducto: productType,
        estado:true
    });

    if(stockMinimoProducto){
        newProduct.stockMinimo = stockMinimoProducto
    }

    await newProduct.save()
        .then(() => { 
            res.status(201).json({ok:true , producto:newProduct , message:'✔️ Insumo agregado correctamente.'})
        })
        .catch((err)=>{
            res.status(400).json({
            ok: false,
            message: "❌ Error al agregar insumo."
            });
        });
    
}

const getProduct = async(req,res) => {
    const productos = await Product.find({estado:true}).lean();
    res.status(200).json({
        ok:true,
        data:productos
    })
}

const getProductID = async(req,res) => {
    const id = req.params.id;
    if(!id) {
        res.status(400).json({ok:false, message:"❌ El id no llego al controlador correctamente."})
        return
    }
    
    const product = await Product.findById(id);
    if (!product) {
        res.status(400).json({ok:false, message:"❌ El id no corresponde a un producto."});
        return
    }
    res.status(200).json({
        ok:true,
        data: product,
        message:'✔️ Insumo obtenido correctamente.'
    })
}
const updateProduct =  async (req , res ) => {
    const id = req.params.id;
    
    if(!id) {
        res.status(400).json({ok:false,message:"❌ Error al actualizar producto."});
        return
    }
    const nombreProducto = req.body.name;
    const precioProducto = req.body.precioCosto;
    const stockProducto = req.body.stock;
    const stockMinimoProducto = req.body.stockMinimo;
    const gananciaProducto = req.body.ganancia;
    const depositoProducto = req.body.deposito;
    const proveedorProducto = req.body.proveedor;
    
    if (!nombreProducto || !precioProducto || !stockProducto ||  !gananciaProducto || !depositoProducto || !proveedorProducto) {
        res.status(400).json({ok:false , message:'❌ Faltan completar algunos campos obligatorios.'});
        return
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(
            id, 
            {
                name: nombreProducto , 
                precioCosto: precioProducto , 
                stock: stockProducto , 
                stockMinimo: stockMinimoProducto,
                ganancia: gananciaProducto , 
                deposito: depositoProducto, 
                proveedor: proveedorProducto
            },
            { new: true , runValidators: true }
        )
        
    if(!updatedProduct) {
        res.status(400).json({ok:false,message:"❌ Error al actualizar producto."});
        return
    }
    res.status(200).json({ok:true , data: updatedProduct , message:"✔️ Producto actualizado correctamente."});
}

// VALIDACION PARA LA ELIMINACION
const SolicitudPresupuestoDetalle = require('../models/proveedorSolicitudPresupuestoDetalle_Model');
const PresupuestoDetalle = require('../models/proveedorPresupuestoDetalle_Model');
const PicadaDetalle = require('../models/productoPicadaDetalle_Model');
const deleteProduct = async (req , res) => {
    const id = req.params.id;

    if(!id) {
        res.status(400).json({ok:false,message:"❌ Error al eliminar producto."});
        return
    }

    const solicitudes = await SolicitudPresupuestoDetalle.find({
        estado:true,
        producto:id
    }).lean();

    const presupuestos = await PresupuestoDetalle.find({
        estado:true,
        producto:id
    }).lean();

    const picadasDetalle = await PicadaDetalle.find({
        estado:true,
        insumo:id
    }).lean();

    // Si aparece en Solicitudes → verifico si ES un insumo
    for (const s of solicitudes) {
        const prod = await Product.findById(s.producto).lean();
        if (prod && prod.tipoProducto === "ProductoInsumo") {
            return res.status(400).json({
                ok:false,
                message:"❌ No se puede eliminar el insumo porque posee servicios asociados."
            });
        }
    }

    // ✔ Si aparece en Presupuestos → verifico si ES un insumo
    for (const p of presupuestos) {
        const prod = await Product.findById(p.producto).lean();
        if (prod && prod.tipoProducto === "ProductoInsumo") {
            return res.status(400).json({
                ok:false,
                message:"❌ No se puede eliminar el insumo porque posee servicios asociados."
            });
        }
    }

    // ✔ Si aparece en PicadaDetalle → siempre bloquea (solo insumos)
    if (picadasDetalle.length > 0) {
        return res.status(400).json({
            ok:false,
            message:"❌ No se puede eliminar el insumo porque posee servicios asociados."
        });
    }

    // 4) Si llegó hasta acá → se puede eliminar
    const deletedProduct = await Product.findByIdAndUpdate(
        id, 
        { estado:false },
        { new: true , runValidators: true }
    );

    if (!deletedProduct) {
        return res.status(400).json({
            ok:false,
            message:"❌ Error al eliminar el insumo."
        });
    }

    return res.status(200).json({
        ok:true,
        message:"✔️ Insumo eliminado correctamente."
    });
};

const buscarProducto = async(req,res) => {
  try {
    const stockP = req.body.stock;
    const stockMinimoP = req.body.stockMinimo;
    const depositoP = req.body.deposito;
    const nombreP = req.body.name;
    const proveedorP = req.body.proveedor;
    const precioCostoP = req.body.precioCosto;
    const gananciaP = req.body.ganancia;
    
// Primero traemos todos los clientes
const productos = await Product.find();

// Luego filtramos dinámicamente
const productosFiltrados = productos.filter(c => {
    const coincideEstado = c.estado === true;
  // Cada condición solo se evalúa si el campo tiene valor
  const coincideNombre = nombreP ? c.name?.toLowerCase().includes(nombreP.toLowerCase()) : true;
  const coincideStock = stockP ? Number(c.stock) === Number(stockP) : true;
  const coincideStockMinimo = stockMinimoP ? Number(c.stockMinimo) === Number(stockMinimoP) : true;
  const coincideDeposito = depositoP ? Number(c.deposito) === Number(depositoP) : true;
  const coincideProveedor = proveedorP ? Number(c.proveedor) === Number(proveedorP) : true;
  const coincidePrecioCosto = precioCostoP ? Number(c.precioCosto) === Number(precioCostoP) : true;
  const coincideGanancia = gananciaP ? Number(c.ganancia) === Number(gananciaP) : true;

  // Si todos los criterios activos coinciden => mantener cliente
  return (
    coincideEstado &&
    coincideNombre &&
    coincideStock &&
    coincideStockMinimo &&
    coincideDeposito &&
    coincideProveedor &&
    coincidePrecioCosto &&
    coincideGanancia
  );
});

    res.status(200).json({ ok: true, data: productosFiltrados });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: "❌ Error al buscar productos" });
  }
}

module.exports = {setProduct , getProduct , getProductID , updateProduct , deleteProduct , buscarProducto};
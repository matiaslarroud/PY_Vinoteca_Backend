const Product = require('../models/productoInsumo_Model')
const getNextSequence = require("../controllers/counter_Controller");

const setProduct =  async (req , res ) => {
    const newId = await getNextSequence("ProductoInsumo");
    const nombreProducto = req.body.name;
    const precioProducto = req.body.precioCosto;
    const stockProducto = req.body.stock;
    const stockMinimoProducto = req.body.stockMinimo;
    const gananciaProducto = req.body.ganancia;
    const depositoProducto = req.body.deposito;
    const proveedorProducto = req.body.proveedor;
    const productType = 'ProductoInsumo';
    
    if (!nombreProducto || !productType || !precioProducto || !stockProducto ||  !gananciaProducto || !depositoProducto || !proveedorProducto) {
        res.status(400).json({ok:false , message:'No se puede cargar el producto sin todos los datos.'});
        return
    }

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
            res.status(201).json({ok:true , message:'Insumo agregado correctamente.'})
        })
        .catch((error) => { console.log(error) }) 
    
}

const getProduct = async(req,res) => {
    const productos = await Product.find({estado:true});

    res.status(200).json({
        ok:true,
        data:productos,
    })
}

const getProductID = async(req,res) => {
    const id = req.params.id;
    if(!id) {
        res.status(400).json({ok:false, message:"El id no llego al controlador correctamente."})
        return
    }
    
    const product = await Product.findById(id);
    if (!product) {
        res.status(400).json({ok:false, message:"El id no corresponde a un producto."});
        return
    }
    res.status(200).json({
        ok:true,
        data: product
    })
}
const updateProduct =  async (req , res ) => {
    const id = req.params.id;
    
    const nombreProducto = req.body.name;
    const precioProducto = req.body.precioCosto;
    const stockProducto = req.body.stock;
    const stockMinimoProducto = req.body.stockMinimo;
    const gananciaProducto = req.body.ganancia;
    const depositoProducto = req.body.deposito;
    const proveedorProducto = req.body.proveedor;
    
    if (!nombreProducto || !precioProducto || !stockProducto ||  !gananciaProducto || !depositoProducto || !proveedorProducto) {
        res.status(400).json({ok:false , message:'No se puede actualizar el producto sin todos los datos.'});
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
        res.status(400).json({ok:false,message:"Error al actualizar producto."});
        return
    }
    res.status(200).json({ok:true , message:"Producto actualizado correctamente."});
}

const deleteProduct = async (req , res) => {
    const id = req.params.id;
    const deletedProduct = await Product.findByIdAndUpdate(
            id, 
            {
                estado:false
            },
            { new: true , runValidators: true }
        )
    if(!deletedProduct) {
        res.status(400).json({ok:false,message:"Error al eliminar producto."});
        return
    }
    res.status(200).json({ok:true , message:"Producto eliminado correctamente."});
}


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
    res.status(500).json({ ok: false, message: "Error al buscar productos" });
  }
}

module.exports = {setProduct , getProduct , getProductID , updateProduct , deleteProduct , buscarProducto};
const Product = require('../models/productoPicada_Model')
const PicadaDetalle = require("../models/productoPicadaDetalle_Model");
const getNextSequence = require("../controllers/counter_Controller");

const setProduct =  async (req , res ) => {
    const newId = await getNextSequence("ProductoPicada");
    const nombreProducto = req.body.name;
    const precioProducto = req.body.precioVenta;
    const stockProducto = req.body.stock;
    const stockMinimoProducto = req.body.stockMinimo;
    const depositoProducto = req.body.deposito;
    const productType = 'ProductoPicada';
    
    if (!nombreProducto || !productType || !precioProducto || !stockProducto || !depositoProducto) {
        res.status(400).json({ok:false , message:'No se puede cargar el producto sin todos los datos.'});
        return
    }

    const newProduct = new Product({
        _id: newId,
        name: nombreProducto , 
        precioVenta: precioProducto , 
        stock: stockProducto ,  
        deposito: depositoProducto,
        tipoProducto: productType,
        estado:true
    });

    if (stockMinimoProducto){
        newProduct.stockMinimo = stockMinimoProducto;
    }

    await newProduct.save()
        .then(() => { 
            res.status(201).json({
                ok:true ,
                data: newProduct,
                message:'Producto agregado correctamente.'
            })
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
    const precioProducto = req.body.precioVenta;
    const stockProducto = req.body.stock;
    const stockMinimoProducto = req.body.stockMinimo;
    const depositoProducto = req.body.deposito;
    
    if (!nombreProducto || !precioProducto || !stockProducto || !depositoProducto) {
        res.status(400).json({ok:false , message:'No se puede actualizar el producto sin todos los datos.'});
        return
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(
            id, 
            {
                name: nombreProducto , 
                precioVenta: precioProducto , 
                stock: stockProducto ,  
                stockMinimo: stockMinimoProducto,
                deposito: depositoProducto
            },
            { new: true , runValidators: true }
        )

        
    if(!updatedProduct) {
        res.status(400).json({
            ok:false,
            message:"Error al actualizar producto."
        });
        return
    }
    res.status(200).json({
        ok:true , 
        data: updatedProduct,
        message:"Producto actualizado correctamente."
    })    
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

    const deletedPicadaDetalle = await PicadaDetalle.updateMany(
        {picada:id},
        {   
            estado:false
        },
        { new: true , runValidators: true }
    )
    if(!deletedProduct || !deletedPicadaDetalle) {
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
    const precioVentaP = req.body.precioVenta;
    
// Primero traemos todos los clientes
const productos = await Product.find({estado:true});

const productosFiltrados = productos.filter(c => {
  // Cada condición solo se evalúa si el campo tiene valor
  const coincideNombre = nombreP ? c.name?.toLowerCase().includes(nombreP.toLowerCase()) : true;
  const coincideStock = stockP ? Number(c.stock) === Number(stockP) : true;
  const coincideStockMinimo = stockMinimoP ? Number(c.stockMinimo) === Number(stockMinimoP) : true;
  const coincideDeposito = depositoP ? Number(c.deposito) === Number(depositoP) : true;
  const coincidePrecio = precioVentaP ? Number(c.precioVenta) === Number(precioVentaP) : true; 

  // Si todos los criterios activos coinciden => mantener cliente
  return (
    coincideNombre &&
    coincideStock &&
    coincideStockMinimo &&
    coincideDeposito &&
    coincidePrecio 
  );
});

res.status(200).json({ ok: true, data: productosFiltrados });

  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: "Error al buscar productos" });
  }
}

module.exports = {setProduct , getProduct , getProductID , updateProduct , deleteProduct , buscarProducto};
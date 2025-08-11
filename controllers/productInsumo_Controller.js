const Product = require('../models/productoInsumo_Model')

const setProduct =  async (req , res ) => {
    const nombreProducto = req.body.name;
    const precioProducto = req.body.precioCosto;
    const stockProducto = req.body.stock;
    const gananciaProducto = req.body.ganancia;
    const depositoProducto = req.body.deposito;
    const proveedorProducto = req.body.proveedor;
    
    if (!nombreProducto || !precioProducto || !stockProducto ||  !gananciaProducto || !depositoProducto || !proveedorProducto) {
        res.status(400).json({ok:false , message:'No se puede cargar el producto sin todos los datos.'});
        return
    }

    const newProduct = new Product({
        name: nombreProducto , 
        precioCosto: precioProducto , 
        stock: stockProducto , 
        ganancia: gananciaProducto , 
        deposito: depositoProducto, 
        proveedor: proveedorProducto
    });
    await newProduct.save()
        .then(() => { 
            res.status(201).json({ok:true , message:'Insumo agregado correctamente.'})
        })
        .catch((error) => { console.log(error) }) 
    
}

const getProduct = async(req,res) => {
    const productos = await Product.find();

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
    const deletedProduct = await Product.findByIdAndDelete(id)
    if(!deletedProduct) {
        res.status(400).json({ok:false,message:"Error al eliminar producto."});
        return
    }
    res.status(200).json({ok:true , message:"Producto eliminado correctamente."});
}

module.exports = {setProduct , getProduct , getProductID , updateProduct , deleteProduct};
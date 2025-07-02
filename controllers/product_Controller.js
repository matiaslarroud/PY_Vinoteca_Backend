const Product = require('../models/product_Model.js')

const setProduct =  async (req , res ) => {
    const nombreProducto = req.body.name;
    const precioProducto = req.body.price;
    
    if (!nombreProducto) {
        res.status(400).json({ok:false , message:'No se puede cargar el producto sin el nombre.'});
        return
    }

    const newProduct = new Product({name: nombreProducto , price: precioProducto});
    await newProduct.save()
        .then(() => { 
            console.log("PRODUCTO CREADO EXITOSAMENTE");
            res.status(201).json({ok:true});
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
        res.status(400).json({ok:false, message:"ERROR --- ID invalido."})
        return
    }
    
    const product = await Product.findById(id);
    if (!product) {
        res.status(400).json({ok:false, message:"ERROR --- Producto no encontrado."});
        return
    }
    const nombre = product.name;
    const precio = product.price;
    res.status(200).json({
        ok:true,
        prod: {
            name : nombre,
            price : precio,
        },
    })
}
const updateProduct =  async (req , res ) => {
    const id = req.params.id;
    const {name ,price} = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(
            id, 
            {name , price},
            { new: true , runValidators: true }
        )
        
    if(!updatedProduct) {
        res.status(400).json({ok:false,message:"Error al actualizar producto."});
        return
    }
    res.status(200).json({ok:true , message:"Producto actualizado correctamente."})    
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
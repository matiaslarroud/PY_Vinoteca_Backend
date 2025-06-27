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

module.exports = {setProduct , getProduct};
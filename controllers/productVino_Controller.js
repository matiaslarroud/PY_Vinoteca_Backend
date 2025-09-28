const Product = require('../models/productoVino_Model.js')
const getNextSequence = require("../controllers/counter_Controller");

const setProduct =  async (req , res ) => {
    const newId = await getNextSequence("ProductoVino");
    const nombreProducto = req.body.name;
    const precioProducto = req.body.precioCosto;
    const stockProducto = req.body.stock;
    const bodegaProducto = req.body.bodega;
    const parajeProducto = req.body.paraje;
    const crianzaProducto = req.body.crianza;
    const gananciaProducto = req.body.ganancia;
    const tipoVino = req.body.tipo;
    const varietalProducto = req.body.varietal;
    const volumenProducto = req.body.volumen;
    const depositoProducto = req.body.deposito;
    const productType = 'ProductoVino'

    
    if (!nombreProducto || !productType || !precioProducto || !stockProducto || !bodegaProducto || !parajeProducto || !crianzaProducto || !gananciaProducto || !tipoVino || !varietalProducto || !volumenProducto || !depositoProducto) {
        res.status(400).json({ok:false , message:'No se puede cargar el producto sin todos los datos.'});
        return
    }

    const newProduct = new Product({
        _id: newId,
        name: nombreProducto , 
        precioCosto: precioProducto , 
        stock: stockProducto , 
        bodega: bodegaProducto , 
        paraje: parajeProducto , 
        crianza: crianzaProducto , 
        ganancia: gananciaProducto , 
        tipo: tipoVino , 
        varietal: varietalProducto , 
        volumen: volumenProducto , 
        deposito: depositoProducto,
        tipoProducto: productType
    });
    await newProduct.save()
        .then(() => { 
            res.status(201).json({
                ok:true , 
                message:'Producto agregado correctamente.',
                data: newProduct
            })
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
    const bodegaProducto = req.body.bodega;
    const parajeProducto = req.body.paraje;
    const crianzaProducto = req.body.crianza;
    const gananciaProducto = req.body.ganancia;
    const tipoVino = req.body.tipo;
    const varietalProducto = req.body.varietal;
    const volumenProducto = req.body.volumen;
    const depositoProducto = req.body.deposito;
    
    if (!nombreProducto || !precioProducto || !stockProducto || !bodegaProducto || !parajeProducto || !crianzaProducto || !gananciaProducto || !varietalProducto || !volumenProducto || !depositoProducto) {
        res.status(400).json({ok:false , message:'No se puede actualizar el producto sin todos los datos.'});
        return
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(
            id, 
            {
                name: nombreProducto , 
                stock: stockProducto,
                precioCosto: precioProducto,
                bodega: bodegaProducto,
                paraje: parajeProducto,
                crianza:crianzaProducto,
                ganancia: gananciaProducto,
                tipo: tipoVino,
                varietal:varietalProducto,
                volumen:volumenProducto,
                deposito: depositoProducto,
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
        message:"Producto actualizado correctamente.",
        data: updatedProduct
    })    
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
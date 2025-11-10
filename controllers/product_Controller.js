const Product = require('../models/producto_Model')
const getNextSequence = require("../controllers/counter_Controller");

const setProduct =  async (req , res ) => {
    const newId = await getNextSequence("Producto");
    const nombreProducto = req.body.name;
    const precioProducto = req.body.precioCosto;
    const stockProducto = req.body.stock;
    const tipoProducto = req.body.tipoProducto;
    const gananciaProducto = req.body.ganancia;
    const depositoProducto = req.body.deposito;
    
    if (!nombreProducto || !tipoProducto || !precioProducto || !stockProducto  || !gananciaProducto  || !depositoProducto) {
        res.status(400).json({ok:false , message:'No se puede cargar el producto sin todos los datos.'});
        return
    }

    const newProduct = new Product({
        _id: newId,
        name: nombreProducto , 
        tipoProducto: tipoProducto,
        precioCosto: precioProducto , 
        stock: stockProducto ,  
        ganancia: gananciaProducto , 
        deposito: depositoProducto,
        estado:true
    });
    await newProduct.save()
        .then(() => { 
            res.status(201).json({ok:true , message:'Producto agregado correctamente.'})
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

const stockUpdate = async(req,res) => {
    const id = req.params.id;
    const cantidadVendida = req.body.cantidadVendida;
    
    if (isNaN(cantidadVendida)) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Cantidad inválida, debe ser un número',
    })}

    const producto = await Product.findById(id);
    producto.stock -= Number(cantidadVendida);
    await producto.save();

    if (!producto) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Producto no encontrado',
        });
    }

    res.status(200).json({ok:true , message:"Stock actualizado correctamente."})   

}

const getProductTipos = async(req,res) => {
    const discriminadores = Product.discriminators || {}
    const tipos = Object.keys(discriminadores).map(tipo => tipo.replace('Producto_', '')) 
    res.status(200).json({
        ok:true,
        data:tipos,
    })
}

const lowStockProducts = async (req, res) => {
  try {
    const listProducts = await Product.find({
        $expr: { $lte: ["$stock", "$stockMinimo"] } // stock <= stockMinimo
    });


    res.status(200).json({
      ok: true,
      data: listProducts,
    });
  } catch (error) {
    console.error("Error al obtener productos con stock bajo:", error);
    res.status(500).json({
      ok: false,
      message: "Error al obtener productos con stock bajo",
    });
  }
};


const getProductTipoID = async(req,res) => {
    const id = req.params.id;
    const producto = await Product.findById(id);
    if (!producto) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de producto no encontrado',
        });
    }
    const tipo = producto.__t ? producto.__t.replace('Producto_', '') : 'Producto';

    res.status(200).json({
        ok: true,
        data:tipo,
    });
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
    const tipoProducto = req.body.tipoProducto;
    const precioProducto = req.body.precioCosto;
    const stockProducto = req.body.stock;
    const gananciaProducto = req.body.ganancia;
    const depositoProducto = req.body.deposito;
    
    if (!nombreProducto || !tipoProducto || !precioProducto || !stockProducto || !gananciaProducto || !depositoProducto) {
        res.status(400).json({ok:false , message:'No se puede actualizar el producto sin todos los datos.'});
        return
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(
            id, 
            {
                name: nombreProducto , 
                tipoProducto: tipoProducto,
                stock: stockProducto,
                precioCosto: precioProducto,
                ganancia: gananciaProducto,
                deposito: depositoProducto,
            },
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

const getProduct_query = async (req , res) => {
    const query = req.params.query;
    const listProducts = await Product.find({
        nombre: { $regex: query, $options: 'i' } // 'i' para ignorar mayúsculas
    })

    if(!listProducts) {
        res.status(400).json({ok:false,message:"EProductos no encontrados"});
        return
    }
    res.status(200).json({
        ok:true ,
        data: listProducts, 
        message:"Productos encontrados correctamente.",
    });
}

module.exports = {setProduct , getProduct , getProductID , lowStockProducts , updateProduct , deleteProduct , getProduct_query , getProductTipos , getProductTipoID , stockUpdate};
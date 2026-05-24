const mongoose = require("mongoose");

const Product = require('../models/producto_Model')
const ProductoVino = require("../models/productoVino_Model");
const ProductoInsumo = require("../models/productoInsumo_Model");
const ProductoPicada = require("../models/productoPicada_Model");
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
    const productos = await Product.find({estado:true}).lean();

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
    if(producto.stock - Number(cantidadVendida) < 0)
    {
      return res.status(400).json({
            ok: false,
            message: '❌ La cantidad solicitada supera al stock actual del producto.',
        });
    }
      
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

const getProductTipos = async(req, res) => {
    try {
        // Obtener solo los tipos de productos que tienen documentos en la BD
        const tipos = await Product.distinct('__t');
        
        // Limpiar el prefijo 'Producto_' si lo tienen
        const tiposLimpios = tipos
            .filter(tipo => tipo) // Eliminar null/undefined
            .map(tipo => tipo.replace('Producto_', ''));
        
        res.status(200).json({
            ok: true,
            data: tiposLimpios,
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            error: error.message,
        });
    }
}

// const lowStockProducts = async (req, res) => {
//   try {
//     const listProducts = await Product.find({
//         $expr: { $lte: ["$stock", "$stockMinimo"] } // stock <= stockMinimo
//     });


//     res.status(200).json({
//       ok: true,
//       data: listProducts,
//     });
//   } catch (error) {
//     console.error("Error al obtener productos con stock bajo:", error);
//     res.status(500).json({
//       ok: false,
//       message: "Error al obtener productos con stock bajo",
//     });
//   }
// };

const lowStockProducts = async (req, res) => {
  try {

    // 🔹 Productos VINO con bajo stock
    const lowStockVinosDocs = await ProductoVino.find({
      estado: true,
      $expr: { $lte: ["$stock", "$stockMinimo"] }
    });

    const lowStockVinos = lowStockVinosDocs.map(s => ({
      _id: s._id,
      name: s.name,
      proveedor:s.proveedor,
      tipoProducto: s.tipoProducto,
      stock: s.stock,
      stockMinimo: s.stockMinimo
    }));


    // 🔹 Productos INSUMO con bajo stock
    const lowStockInsumosDocs = await ProductoInsumo.find({
      estado: true,
      $expr: { $lte: ["$stock", "$stockMinimo"] }
    });

    const lowStockInsumos = lowStockInsumosDocs.map(s => ({
      _id: s._id,
      name: s.name,
      proveedor:s.proveedor,
      tipoProducto: s.tipoProducto,
      stock: s.stock,
      stockMinimo: s.stockMinimo
    }));


    // 🔹 Productos PICADA con bajo stock
    const lowStockPicadasDocs = await ProductoPicada.find({
      estado: true,
      $expr: { $lte: ["$stock", "$stockMinimo"] }
    });

    const lowStockPicadas = lowStockPicadasDocs.map(s => ({
      _id: s._id,
      name: s.name,
      tipoProducto: s.tipoProducto,
      stock: s.stock,
      stockMinimo: s.stockMinimo
    }));


    // 🔹 Unificar ambos listados
    const lowStockProducts = [...lowStockVinos, ...lowStockInsumos , ...lowStockPicadas];

    return res.status(200).json({
      ok: true,
      data: lowStockProducts
    });

  } catch (error) {
    console.error("Error al obtener productos con stock bajo:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al obtener productos con stock bajo"
    });
  }
};

const lowStockProductsByProveedor = async (req, res) => {
  try {
    const proveedorIDParam = req.params.id;

    // 🔹 Productos VINO con bajo stock
    const lowStockVinosDocs = await ProductoVino.find({
      estado: true,
      proveedor: proveedorIDParam,
      $expr: { $lte: ["$stock", "$stockMinimo"] }
    });

    const lowStockVinos = lowStockVinosDocs.map(s => ({
      _id: s._id,
      name: s.name,
      tipoProducto: s.tipoProducto,
      stock: s.stock,
      stockMinimo: s.stockMinimo
    }));


    // 🔹 Productos INSUMO con bajo stock
    const lowStockInsumosDocs = await ProductoInsumo.find({
      estado: true,
      proveedor: proveedorIDParam,
      $expr: { $lte: ["$stock", "$stockMinimo"] }
    });

    const lowStockInsumos = lowStockInsumosDocs.map(s => ({
      _id: s._id,
      name: s.name,
      tipoProducto: s.tipoProducto,
      stock: s.stock,
      stockMinimo: s.stockMinimo
    }));


    // 🔹 Unificar ambos listados
    const lowStockProducts = [...lowStockVinos, ...lowStockInsumos];

    return res.status(200).json({
      ok: true,
      data: lowStockProducts
    });

  } catch (error) {
    console.error("Error al obtener productos con stock bajo:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al obtener productos con stock bajo"
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

const updateOfertaProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const enOferta = Boolean(req.body.enOferta);
    const precioOferta = req.body.precioOferta != null ? Number(req.body.precioOferta) : null;

    if (enOferta && (!precioOferta || precioOferta <= 0)) {
      return res.status(400).json({
        ok: false,
        message: '❌ Se requiere un precio de oferta mayor a 0 para activar la promoción.'
      });
    }

    const update = { enOferta };
    update.precioOferta = enOferta ? precioOferta : null;

    const updated = await Product.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ ok: false, message: '❌ Producto no encontrado.' });
    }

    res.json({
      ok: true,
      message: `✔️ Oferta ${enOferta ? 'activada' : 'desactivada'} correctamente.`,
      data: { _id: updated._id, enOferta: updated.enOferta, precioOferta: updated.precioOferta }
    });
  } catch {
    res.status(500).json({ ok: false, message: '❌ Error al actualizar la oferta del producto.' });
  }
};

module.exports = {setProduct , getProduct , getProductID , lowStockProducts , lowStockProductsByProveedor , updateProduct , deleteProduct , getProduct_query , getProductTipos , getProductTipoID , stockUpdate , updateOfertaProducto};
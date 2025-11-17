const Product = require('../models/productoVino_Model.js')
const getNextSequence = require("../controllers/counter_Controller");

const setProduct =  async (req , res ) => {
    const newId = await getNextSequence("ProductoVino");
    const nombreProducto = req.body.name;
    const precioProducto = req.body.precioCosto;
    const stockProducto = req.body.stock;
    const stockMinimoProducto = req.body.stockMinimo;
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
        tipoProducto: productType ,
        estado:true
    });

    if(stockMinimoProducto){
        newProduct.stockMinimo = stockMinimoProducto
    }

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
                stockMinimo: stockMinimoProducto,
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
    const bodegaP = req.body.bodega;
    const parajeP = req.body.paraje;
    const crianzaP = req.body.crianza;
    const tipoP = req.body.tipo;
    const varietalP = req.body.varietal;
    const volumenP = req.body.volumen;
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
  const coincideBodega = bodegaP ? Number(c.bodega) === Number(bodegaP) : true;
  const coincideParaje = parajeP ? Number(c.paraje) === Number(parajeP) : true;
  const coincideCrianza = crianzaP ? Number(c.crianza) === Number(crianzaP) : true;
  const coincideTipo = tipoP ? Number(c.tipo) === Number(tipoP) : true;
  const coincideVarietal = varietalP ? Number(c.varietal) === Number(varietalP) : true;
  const coincideVolumen = volumenP ? Number(c.volumen) === Number(volumenP) : true;
  const coincidePrecioCosto = precioCostoP ? Number(c.precioCosto) === Number(precioCostoP) : true;
  const coincideGanancia = gananciaP ? Number(c.ganancia) === Number(gananciaP) : true;

  // Si todos los criterios activos coinciden => mantener cliente
  return (
    coincideEstado &&
    coincideNombre &&
    coincideStock &&
    coincideStockMinimo &&
    coincideDeposito &&
    coincideBodega &&
    coincideParaje &&
    coincideCrianza &&
    coincideTipo &&
    coincideVarietal &&
    coincideVolumen &&
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
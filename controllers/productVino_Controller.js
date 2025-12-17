const Product = require('../models/productoVino_Model.js')
const getNextSequence = require("../controllers/counter_Controller");

const setProduct =  async (req , res ) => {
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
    const proveedor = req.body.proveedor;
    const productType = 'ProductoVino'

    
    if (!nombreProducto || !proveedor || !productType || !precioProducto || !stockProducto || !bodegaProducto || !parajeProducto || !crianzaProducto || !gananciaProducto || !tipoVino || !varietalProducto || !volumenProducto || !depositoProducto) {
        res.status(400).json({ok:false , message:"❌ Faltan completar algunos campos obligatorios."});
        return
    }

    const newId = await getNextSequence("Producto");
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
        proveedor: proveedor,
        estado:true
    });

    if(stockMinimoProducto){
        newProduct.stockMinimo = stockMinimoProducto
    }

    await newProduct.save()
        .then(() => { 
            res.status(201).json({
                ok:true , 
                message:'✔️ Producto agregado correctamente.',
                data: newProduct
            })
        })
        .catch((err) => {
            res.status(400).json({
                ok:false,
                message:`❌ Error al agregar producto. ERROR:\n${err}`
            })
        })
    
}

const getProduct = async(req,res) => {
    const productos = await Product.find({estado:true}).lean();

    res.status(200).json({
        ok:true,
        data:productos,
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
        message:"✔️ Producto obtenido con exito.",
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
    const proveedor = req.body.proveedor;
    
    if (!nombreProducto || !proveedor || !precioProducto || !stockProducto || !bodegaProducto || !parajeProducto || !crianzaProducto || !gananciaProducto || !varietalProducto || !volumenProducto || !depositoProducto) {
        res.status(400).json({ok:false , message:"❌ Faltan completar algunos campos obligatorios."});
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
                proveedor:proveedor
            },
            { new: true , runValidators: true }
        )
        
    if(!updatedProduct) {
        res.status(400).json({
            ok:false,
            message:"❌ Error al actualizar producto."
        });
        return
    }
    res.status(200).json({
        ok:true , 
        message:"✔️ Producto actualizado correctamente.",
        data: updatedProduct
    })    
}

//Validaciones de eliminacion
const ProveedorSolicitudPresupuesto = require("../models/proveedorSolicitudPresupuestoDetalle_Model.js");
const ProveedorPresupuesto = require("../models/proveedorPresupuestoDetalle_Model.js");
const ClientePresupuesto = require("../models/clientePresupuestoDetalle_Model.js");
const ClienteNotaPedido = require("../models/clienteNotaPedidoDetalle_Model.js");

const deleteProduct = async (req , res) => {
    const id = req.params.id;

    if(!id) {
        res.status(400).json({ok:false,message:"❌ Error al eliminar producto."});
        return
    }

    const solicitudesProveedor = await ProveedorSolicitudPresupuesto.find({
        estado:true,
        producto:id
    }).lean();

    const presupuestosProveedor = await ProveedorPresupuesto.find({
        estado:true,
        producto:id
    }).lean();

    const presupuestoClientes = await ClientePresupuesto.find({
        estado:true,
        producto:id
    }).lean();

    const pedidosClientes = await ClienteNotaPedido.find({
        estado:true,
        producto:id
    }).lean();

    // Si aparece en Solicitudes Proveedor → verifico si es un vino
    for (const s of solicitudesProveedor) {
        const prod = await Product.findById(s.producto).lean();
        if (prod && prod.tipoProducto === "ProductoVino") {
            return res.status(400).json({
                ok:false,
                message:"❌ No se puede eliminar el vino porque posee servicios asociados."
            });
        }
    }

    // ✔ Si aparece en Presupuestos Proveedor → verifico si es un vino
    for (const p of presupuestosProveedor) {
        const prod = await Product.findById(p.producto).lean();
        if (prod && prod.tipoProducto === "ProductoVino") {
            return res.status(400).json({
                ok:false,
                message:"❌ No se puede eliminar el vino porque posee servicios asociados."
            });
        }
    }

    // ✔ Si aparece en Presupuestos Cliente → verifico si es un vino
    for (const p of presupuestoClientes) {
        const prod = await Product.findById(p.producto).lean();
        if (prod && prod.tipoProducto === "ProductoVino") {
            return res.status(400).json({
                ok:false,
                message:"❌ No se puede eliminar el vino porque posee servicios asociados."
            });
        }
    }

    // ✔ Si aparece en Notas de Pedido Cliente → verifico si es un vino
    for (const p of pedidosClientes) {
        const prod = await Product.findById(p.producto).lean();
        if (prod && prod.tipoProducto === "ProductoVino") {
            return res.status(400).json({
                ok:false,
                message:"❌ No se puede eliminar el vino porque posee servicios asociados."
            });
        }
    }

    const deletedProduct = await Product.findByIdAndUpdate(
        id, 
        { estado:false },
        { new: true , runValidators: true }
    );

    if (!deletedProduct) {
        return res.status(400).json({
            ok:false,
            message:"❌ Error al eliminar el vino."
        });
    }

    return res.status(200).json({
        ok:true,
        message:"✔️ Vino eliminado correctamente."
    });
};


const ProductoVinoDetalle = require('../models/productoVinoDetalle_Model.js');
const ProductoVino = require('../models/productoVino_Model.js');

const buscarProducto = async(req,res) => {
  try {
        const stockP = req.body.stock;
        const stockMinimoP = req.body.stockMinimo;
        const depositoP = req.body.deposito;
        const nombreP = req.body.name;
        const bodegaP = req.body.bodega;
        const proveedorP = req.body.proveedor;
        const parajeP = req.body.paraje;
        const crianzaP = req.body.crianza;
        const tipoP = req.body.tipo;
        const varietalP = req.body.varietal;
        const volumenP = req.body.volumen;
        const vinoIDP = req.body.vinoID;
        const precioCostoP = req.body.precioCosto;
        const gananciaP = req.body.ganancia;
        const detalles = req.body.detalles;

        // 1️⃣ Obtenemos todas las uvas que vienen en los detalles
        const uvasBuscadas = detalles && detalles.length > 0
        ? detalles.map(d => d.uva)
        : [];

        // 2️⃣ Buscamos los ProductoVinoDetalle que contengan alguna de esas uvas
        let detallesFiltrados = [];
        if (uvasBuscadas.length > 0) {
            detallesFiltrados = await ProductoVinoDetalle.find({
                uva: { $in: uvasBuscadas },
            });
        } if (uvasBuscadas.length > 0 && detallesFiltrados.length === 0) {
            res.status(500).json({ ok: false, message: "❌ Error al buscar vinos" });       
        } else if (!detalles) {
            detallesFiltrados = await ProductoVinoDetalle.find();
        }
        
        // 3️⃣ Obtenemos los IDs únicos de los vinos asociados
        const vinosIDs = [
            ...new Set(
                detallesFiltrados
                .map(d => d.vino)
                .filter(id => id !== undefined && id !== null)
            ),
        ];

        // 4️⃣ Buscamos los presupuestos relacionados
        let vinos = await ProductoVino.find(
            vinosIDs.length > 0 ? { _id: { $in: vinosIDs } } : {}
        );
            
        // Primero traemos todos los clientes
        const productos = await Product.find();

        // Luego filtramos dinámicamente
        const productosFiltrados = vinos.filter(c => {
            const coincideEstado = c.estado === true;
        // Cada condición solo se evalúa si el campo tiene valor
        const coincideVino = vinoIDP ? (c._id) === Number(vinoIDP) : true;
        const coincideNombre = nombreP ? c.name?.toLowerCase().includes(nombreP.toLowerCase()) : true;
        const coincideStock = stockP ? Number(c.stock) === Number(stockP) : true;
        const coincideStockMinimo = stockMinimoP ? Number(c.stockMinimo) === Number(stockMinimoP) : true;
        const coincideProveedor = proveedorP ? Number(c.proveedor) === Number(proveedorP) : true;
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
            coincideVino &&
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
            coincideGanancia &&
            coincideProveedor
        );
        });

        res.status(200).json({ ok: true, data: productosFiltrados });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: "❌ Error al buscar vinos" });
    }
}

module.exports = {setProduct , getProduct , getProductID , updateProduct , deleteProduct , buscarProducto};
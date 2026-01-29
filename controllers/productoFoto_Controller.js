const ProductoFoto = require("../models/productoFoto_Model.js");
const Producto = require("../models/producto_Model.js");
const  cloudinary = require("../config/cloudinary.js") ;
const getNextSequence = require("../controllers/counter_Controller");

// POST: agregar fotos
const setProductoFoto = async (req, res) => {
    try {
        const { productoID } = req.params;

        if (!productoID) {
            return res.status(400).json({
                ok: false,
                message: "❌ No llegó productoID en la URL"
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                ok: false,
                message: "❌ No se enviaron imágenes."
            });
        }

        const fotosGuardadas = [];

        for (const file of req.files) {
            const uploadResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder: "vinoteca_productos" },
                    (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    }
                ).end(file.buffer);
            });

            const newId = await getNextSequence("ProductoFoto");
            const nuevaFoto = new ProductoFoto({
                _id: newId,
                productoID,
                imagenURL: uploadResult.secure_url,
                public_id: uploadResult.public_id,
                orden: 0,
                estado:true
            });

            await nuevaFoto.save();
            fotosGuardadas.push(nuevaFoto);
        }

        return res.status(201).json({
            ok: true,
            message: "✔️ Imágenes subidas y guardadas correctamente",
            fotos: fotosGuardadas
        });

    } catch (error) {
        return res.status(500).json({
            ok: false,
            message: "❌ Error en el servidor"
        });
    }
};


// GET: listar fotos de un producto
const getProductoFoto = async (req, res) => {
    try {
        const { productoID } = req.params;

        if (!productoID) {
            return res.status(400).json({ ok: false, message: "❌ ID de producto faltante" });
        }

        const fotos = await ProductoFoto.find({ productoID:productoID , estado:true })
            .sort({ orden: 1 });
        
        const producto = await Producto.find({_id: productoID , estado:true}).lean();

        res.json({ 
            ok: true, 
            message:"✔️ Fotos obtenidas correctamente." , 
            data:fotos , 
            producto: producto
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ ok: false, message: "❌ Error al obtener fotos." });
    }
};

// CALCULO DE PRECIO FINAL PRODUCTO
const calcularPrecioProducto = (producto) => {
  if (
    producto.tipoProducto === "ProductoVino" ||
    producto.tipoProducto === "ProductoInsumo"
  ) {
    if (producto.precioCosto != null && producto.ganancia != null) {
      return producto.precioCosto + (producto.precioCosto * producto.ganancia / 100);
    }
    return 0;
  }

  // Picadas
  if (producto.precioVenta != null) {
    return producto.precioVenta;
  }

  return 0;
};


// GET: catálogo de productos
const getCatalogoProductos = async (req, res) => {
  try {
    // 1️⃣ Traer productos activos con datos necesarios
    const productos = await Producto.find({ estado: true })
      .select("_id name stock tipoProducto precioCosto ganancia precioVenta")
      .lean();

    // 2️⃣ Traer todas las fotos activas
    const fotos = await ProductoFoto.find({ estado: true })
      .sort({ orden: 1 })
      .lean();

    // 3️⃣ Mapa productoID -> imagen
    const fotosPorProducto = {};

    for (const foto of fotos) {
      if (!fotosPorProducto[foto.productoID]) {
        fotosPorProducto[foto.productoID] = foto.imagenURL;
      }
    }

    // 4️⃣ Armar catálogo final con precio calculado
    const catalogo = productos.map(prod => ({
      _id: prod._id,
      name: prod.name,
      stock: prod.stock,
      tipoProducto: prod.tipoProducto,
      precio: calcularPrecioProducto(prod),
      imagen: fotosPorProducto[prod._id] || null
    }));

    res.json({
      ok: true,
      productos: catalogo
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: "❌ Error al obtener catálogo"
    });
  }
};



// GET: foto de un producto
const getProductoFotoID = async (req, res) => {
    try {
        const { fotoID } = req.params;

        if(!fotoID){
            res.status(400).json({
                ok:false,
                message:'❌ El id no llego al controlador correctamente',
            })
            return
        }

       const foto = await ProductoFoto.findById(fotoID);

        res.json({ ok: true , message:"✔️ Foto obtenida correctamente." ,  foto });

    } catch (error) {
        console.log(error);
        res.status(500).json({ ok: false, message: "❌ Error al obtener fotos." });
    }
};

// PUT: actualizar foto
const updateProductoFoto = async (req, res) => {
    try {
        const { fotoID } = req.params;
        const { orden } = req.body;

        if( !fotoID || !orden ){
            res.status(400).json({ok:false , message:"❌ Error al recibir los datos."})
            return
        }

        const foto = await ProductoFoto.findByIdAndUpdate(
            fotoID,
            { orden },
            { new: true }
        );

        if (!foto) {
            return res.status(404).json({ ok: false, message: "❌ Foto no encontrada." });
        }

        res.json({ ok: true, foto });

    } catch (error) {
        console.log(error);
        res.status(500).json({ ok: false , message:"✔️ Foto actualizada correctamente."});
    }
};

// DELETE: eliminar foto
const deleteProductoFoto = async (req, res) => {
    try {
        const { fotoID } = req.params;

        const foto = await ProductoFoto.findById(fotoID);

        if (!foto) {
            return res.status(404).json({ ok: false, message: "❌ Foto no encontrada." });
        }

        // 🔹 borrar de Cloudinary
        await cloudinary.uploader.destroy(foto.public_id);

        // 🔹 marcar como eliminada (soft Delete)
        foto.estado = false;

        console.log(foto)
        await foto.save();

        return res.json({
            ok: true,
            message: "✔️ Foto eliminada correctamente."
        });

    } catch (error) {
        res.status(500).json({ ok: false, message: "❌ Error al eliminar foto." });
    }
};


module.exports = {setProductoFoto , getCatalogoProductos , getProductoFoto , getProductoFotoID , updateProductoFoto , deleteProductoFoto }
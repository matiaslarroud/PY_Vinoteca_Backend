const ProductoFoto = require("../models/productoFoto_Model.js");
const  cloudinary = require("../config/cloudinary.js") ;
const getNextSequence = require("../controllers/counter_Controller");

// POST: agregar fotos
const setProductoFoto = async (req, res) => {
    try {
        const newId = await getNextSequence("ProductoFoto");
        const { productoID } = req.params;

        if (!productoID) {
            return res.status(400).json({
                ok: false,
                message: "No llegó productoID en la URL"
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                ok: false,
                message: "No se enviaron imágenes."
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
            message: "Imágenes subidas y guardadas correctamente",
            fotos: fotosGuardadas
        });

    } catch (error) {
        console.error("Error subiendo imágenes:", error);
        return res.status(500).json({
            ok: false,
            message: "Error en el servidor"
        });
    }
};


// GET: listar fotos de un producto
const getProductoFoto = async (req, res) => {
    try {
        const { productoID } = req.params;

        if (!productoID) {
            return res.status(400).json({ ok: false, message: "ID de producto faltante" });
        }

        const fotos = await ProductoFoto.find({ productoID:productoID , estado:true })
            .sort({ orden: 1 });

        res.json({ ok: true, data:fotos });

    } catch (error) {
        console.log(error);
        res.status(500).json({ ok: false, message: "Error al obtener fotos." });
    }
};


// GET: foto de un producto
const getProductoFotoID = async (req, res) => {
    try {
        const { fotoID } = req.params;

       const foto = await ProductoFoto.findById(fotoID);

        res.json({ ok: true, foto });

    } catch (error) {
        console.log(error);
        res.status(500).json({ ok: false, message: "Error al obtener fotos." });
    }
};

// PUT: actualizar foto
const updateProductoFoto = async (req, res) => {
    try {
        const { fotoID } = req.params;
        const { orden } = req.body;

        const foto = await ProductoFoto.findByIdAndUpdate(
            fotoID,
            { orden },
            { new: true }
        );

        if (!foto) {
            return res.status(404).json({ ok: false, message: "Foto no encontrada." });
        }

        res.json({ ok: true, foto });

    } catch (error) {
        console.log(error);
        res.status(500).json({ ok: false, message: "Error al actualizar foto." });
    }
};

// DELETE: eliminar foto
const deleteProductoFoto = async (req, res) => {
    try {
        const { fotoID } = req.params;

        const foto = await ProductoFoto.findById(fotoID);

        if (!foto) {
            return res.status(404).json({ ok: false, message: "Foto no encontrada." });
        }

        // 🔹 borrar de Cloudinary
        await cloudinary.uploader.destroy(foto.public_id);

        // 🔹 marcar como eliminada (soft Delete)
        foto.estado = false;

        console.log(foto)
        await foto.save();

        return res.json({
            ok: true,
            message: "Foto eliminada correctamente."
        });

    } catch (error) {
        console.log("Error al eliminar foto:", error);
        res.status(500).json({ ok: false, message: "Error al eliminar foto." });
    }
};


module.exports = {setProductoFoto , getProductoFoto , getProductoFotoID , updateProductoFoto , deleteProductoFoto }
const mongoose = require("mongoose");

const ProductoFoto_Schema = mongoose.Schema({
    _id: Number,
    productoID: {
        type: Number,
        ref: "Producto",
        required: true
    },

    imagenURL: {
        type: String,
        required: true
    },

    public_id: {
        type: String, // <- Cloudinary ID para borrar imágenes
        required: true
    },

    orden: {
        type: Number,
        default: 0
    }, 
    
    estado: {type: Boolean , required:true}
},
    
    {
        timestamps: true
    }
);

const ProductoFoto = mongoose.model("ProductoFoto", ProductoFoto_Schema , "ProductoFoto");

module.exports = ProductoFoto;
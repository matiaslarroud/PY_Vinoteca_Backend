const mongoose = require("mongoose");

const Remito_Schema = mongoose.Schema({
    _id: Number,
    totalPrecio: {type: Number },
    totalBultos: {type: Number },
    fecha: {type: Date , required:true},
    comprobanteCompra: {
            type: Number,
            ref: 'Proveedor_ComprobanteCompra',
        },
    transporte: {
            type: Number,
            ref: 'Transporte',
        },
    estado: {type: Boolean , required:true},
},
    
    {
        timestamps: true
    }
)
const Proveedor_Remito = mongoose.model("Proveedor_Remito", Remito_Schema , "Proveedor_Remito");
module.exports = Proveedor_Remito;
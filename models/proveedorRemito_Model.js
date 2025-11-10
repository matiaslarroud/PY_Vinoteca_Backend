const mongoose = require("mongoose");

const Remito_Schema = mongoose.Schema({
    _id: Number,
    totalPrecio: {type: Number , require:true},
    totalBultos: {type: Number , require:true},
    fecha: {type: Date , require:true},
    comprobanteCompra: {
            type: Number,
            ref: 'Proveedor_ComprobanteCompra',
        },
    transporte: {
            type: Number,
            ref: 'Transporte',
        },
    estado: {type: Boolean , require:true},
},
    
    {
        timestamps: true
    }
)
const Proveedor_Remito = mongoose.model("Proveedor_Remito", Remito_Schema , "Proveedor_Remito");
module.exports = Proveedor_Remito;
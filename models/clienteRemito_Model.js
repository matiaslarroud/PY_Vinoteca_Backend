const mongoose = require("mongoose");

const Remito_Schema = mongoose.Schema({
    _id: Number,
    totalPrecio: {type: Number , require:true},
    totalBultos: {type: Number , require:true},
    fecha: {type: Date , require:true},
    comprobanteVentaID: {
            type: Number,
            ref: 'Cliente_ComprobanteVenta',
        },
    transporteID: {
            type: Number,
            ref: 'Transporte',
        },
    entregado: {type: Boolean , require:true},
},
    
    {
        timestamps: true
    }
)
const Cliente_Remito = mongoose.model("Cliente_Remito", Remito_Schema , "Cliente_Remito");
module.exports = Cliente_Remito;
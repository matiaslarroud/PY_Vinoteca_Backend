const mongoose = require("mongoose");

const Remito_Schema = mongoose.Schema({
    totalPrecio: {type: Number , require:true},
    totalBultos: {type: Number , require:true},
    fecha: {type: Date , require:true},
    comprobanteVentaID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cliente_ComprobanteVenta',
        },
    transporteID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Transporte',
        },
    entregado: {type: Boolean , require:true},
},
    
    {
        timestamps: true
    }
)
const Cliente_Remito = mongoose.model("Cliente_Remito", Remito_Schema);
module.exports = Cliente_Remito;
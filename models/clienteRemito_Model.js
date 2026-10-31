const mongoose = require("mongoose");

const Remito_Schema = mongoose.Schema({
    _id: Number,
    totalPrecio: {type: Number },
    totalBultos: {type: Number },
    fecha: {type: Date , required:true},
    comprobanteVentaID: {
            type: Number,
            ref: 'Cliente_ComprobanteVenta',
        },
    transporteID: {
            type: Number,
            ref: 'Transporte',
        },
    entregado: {type: Boolean },
    estado: {type: Boolean , required:true},
},
    
    {
        timestamps: true
    }
)
// Índices para las consultas por documento padre / estado.
Remito_Schema.index({ estado: 1 });
Remito_Schema.index({ comprobanteVentaID: 1, estado: 1 });
const Cliente_Remito = mongoose.model("Cliente_Remito", Remito_Schema , "Cliente_Remito");
module.exports = Cliente_Remito;
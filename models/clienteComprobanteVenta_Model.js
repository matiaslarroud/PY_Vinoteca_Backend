const mongoose = require("mongoose");

const ComprobanteVenta_Schema = mongoose.Schema({
    total: {type: Number , require:true},
    tipoComprobante: {type: String , require:true},
    descuento: {type: Number},
    fecha: {type: Date , require:true},
    notaPedido: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cliente_NotaPedido',
        },
    facturado: {type: Boolean , require:true},
},
    
    {
        timestamps: true
    }
)
const Cliente_ComprobanteVenta = mongoose.model("Cliente_ComprobanteVenta", ComprobanteVenta_Schema);

module.exports = Cliente_ComprobanteVenta;
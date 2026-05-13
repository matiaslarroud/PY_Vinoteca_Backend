const mongoose = require("mongoose");

const ComprobanteVenta_Schema = mongoose.Schema({
    _id: Number,
    total: {type: Number , require:true},
    tipoComprobante: {
        type: String , 
        ref: 'TipoComprobante',
        require:true},
    fecha: {type: Date , require:true},
    notaPedido: {
            type: Number,
            ref: 'Cliente_NotaPedido',
        },
    facturado: {type: Boolean , require:true},
    remitoCreado: {type: Boolean , require:true},
    estado: {type: Boolean , require:true},
},
    
    {
        timestamps: true
    }
)
ComprobanteVenta_Schema.index({ estado: 1 });
ComprobanteVenta_Schema.index({ notaPedido: 1 });
const Cliente_ComprobanteVenta = mongoose.model("Cliente_ComprobanteVenta", ComprobanteVenta_Schema , "Cliente_ComprobanteVenta");

module.exports = Cliente_ComprobanteVenta;
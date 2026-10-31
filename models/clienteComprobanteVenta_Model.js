const mongoose = require("mongoose");

const ComprobanteVenta_Schema = mongoose.Schema({
    _id: Number,
    total: {type: Number , required:true},
    tipoComprobante: {
        type: String , 
        ref: 'TipoComprobante',
        },
    fecha: {type: Date , required:true},
    notaPedido: {
            type: Number,
            ref: 'Cliente_NotaPedido',
        },
    facturado: {type: Boolean },
    remitoCreado: {type: Boolean },
    estado: {type: Boolean , required:true},
},
    
    {
        timestamps: true
    }
)
ComprobanteVenta_Schema.index({ estado: 1 });
ComprobanteVenta_Schema.index({ notaPedido: 1 });
// Una nota de pedido no puede tener más de un comprobante activo (evita la doble facturación).
ComprobanteVenta_Schema.index(
    { notaPedido: 1 },
    { unique: true, partialFilterExpression: { estado: true }, name: 'notaPedido_unico_activo' }
);
const Cliente_ComprobanteVenta = mongoose.model("Cliente_ComprobanteVenta", ComprobanteVenta_Schema , "Cliente_ComprobanteVenta");

module.exports = Cliente_ComprobanteVenta;
const mongoose = require("mongoose");

const NotaPedidoDetalle_Schema = mongoose.Schema({
        subtotal: {type: Number , require:true},
        notaPedido: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Cliente_NotaPedido',
                required: true
        },
        producto: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Producto',
                required: true
        },
        precio: {type: Number , require:true},
        cantidad: {type: Number , require:true},
    },
    
    {
        timestamps: true
    }
)
const NotaPedidoDetalle = mongoose.model("NotaPedidoDetalle", NotaPedidoDetalle_Schema);

module.exports = NotaPedidoDetalle;
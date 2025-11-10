const mongoose = require("mongoose");

const NotaPedidoDetalle_Schema = mongoose.Schema({
    _id: Number,
        importe: {type: Number , require:true},
        notaPedido: {
                type: Number,
                ref: 'Cliente_NotaPedido',
                required: true
        },
        producto: {
                type: Number,
                ref: 'Producto',
                required: true
        },
        precio: {type: Number , require:true},
        cantidad: {type: Number , require:true},
        estado: {type: Boolean , require:true},
    },
    
    {
        timestamps: true
    }
)
const NotaPedidoDetalle = mongoose.model("Cliente_NotaPedidoDetalle", NotaPedidoDetalle_Schema , "Cliente_NotaPedidoDetalle");

module.exports = NotaPedidoDetalle;
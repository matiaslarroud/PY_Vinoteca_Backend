const mongoose = require("mongoose");

const NotaPedidoDetalle_Schema = mongoose.Schema({
    _id: Number,
        importe: {type: Number , required:true},
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
        precio: {type: Number , required:true},
        cantidad: {type: Number , required:true},
        estado: {type: Boolean , required:true},
    },
    
    {
        timestamps: true
    }
)
const NotaPedidoDetalle = mongoose.model("Cliente_NotaPedidoDetalle", NotaPedidoDetalle_Schema , "Cliente_NotaPedidoDetalle");

module.exports = NotaPedidoDetalle;
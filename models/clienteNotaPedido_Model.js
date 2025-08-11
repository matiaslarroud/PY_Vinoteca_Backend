const mongoose = require("mongoose");

const NotaPedido_Schema = mongoose.Schema({
    total: {type: Number , require:true},
    fecha: {type: Date , require:true},
    fechaEntrega: {type: Date , require:true},
    cliente: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cliente',
            required: true
        },
    empleado: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Empleado',
            required: true
        },
    medioPago: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MedioPago',
            required: true
        },
    presupuesto: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cliente_Presupuesto'
        },
    facturado: {type: Boolean , require:true},
    envio: {type: Boolean , require:true},
    envioDireccion: {
        type: String,
        required: function () {
            return this.envio === true;
        }
    }
},
    
    {
        timestamps: true
    }
)
const Cliente_NotaPedido = mongoose.model("Cliente_NotaPedido", NotaPedido_Schema);

module.exports = Cliente_NotaPedido;
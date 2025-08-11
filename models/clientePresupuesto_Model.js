const mongoose = require("mongoose");

const Presupuesto_Schema = mongoose.Schema({
    total: {type: Number , require:true},
    fecha: {type: Date , require:true},
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
    },
    
    {
        timestamps: true
    }
)
const Cliente_Presupuesto = mongoose.model("Cliente_Presupuesto", Presupuesto_Schema);

module.exports = Cliente_Presupuesto;
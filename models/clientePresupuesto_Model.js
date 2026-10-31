const mongoose = require("mongoose");

const Presupuesto_Schema = mongoose.Schema({
    _id: Number,
    total: {type: Number , required:true},
    fecha: {type: Date , required:true},
    cliente: {
            type: Number,
            ref: 'Cliente',
            required: true
        },
    empleado: {
            type: Number,
            ref: 'Empleado',
            required: true
        },
    estado: {type: Boolean , required:true},
    // Vigencia: mientras esté vigente, la nota de pedido respeta los precios negociados.
    diasValidez: {type: Number , min:1 , max:30},
    fechaVencimiento: {type: Date},
    },
    
    {
        timestamps: true
    }
)
Presupuesto_Schema.index({ estado: 1 });
Presupuesto_Schema.index({ cliente: 1 });
Presupuesto_Schema.index({ empleado: 1 });
const Cliente_Presupuesto = mongoose.model("Cliente_Presupuesto", Presupuesto_Schema , "Cliente_Presupuesto");

module.exports = Cliente_Presupuesto;
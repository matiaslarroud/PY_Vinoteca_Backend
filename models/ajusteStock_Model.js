const mongoose = require("mongoose");

// Registro de auditoría de los ajustes manuales de stock (rotura, inventario, vencimiento, etc.).
// El stock nunca se edita directamente: cada cambio manual queda registrado acá.
const AjusteStock_Schema = mongoose.Schema({
    _id: Number,
    producto: {
            type: Number,
            ref: 'Producto',
            required: true
        },
    cantidad: {type: Number , required:true},
    stockAnterior: {type: Number , required:true},
    stockNuevo: {type: Number , required:true},
    motivo: {type: String , required:true, trim:true, maxlength:200},
    usuario: {
            type: Number,
            ref: 'Usuario',
            required: true
        },
    fecha: {type: Date , required:true},
    },
    {
        timestamps: true
    }
)
AjusteStock_Schema.index({ producto: 1, fecha: -1 });
const AjusteStock = mongoose.model("AjusteStock", AjusteStock_Schema , "AjusteStock");

module.exports = AjusteStock;

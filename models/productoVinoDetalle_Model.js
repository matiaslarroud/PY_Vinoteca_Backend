const mongoose = require("mongoose");

const VinoDetalle_Schema = mongoose.Schema({
    _id: Number,
        vino: {
                type: Number,
                ref: 'ProductoVino',
                required: true
        },
        uva: {
                type: Number,
                ref: 'Vino_Uva',
                required: true
        },
        estado: {type: Boolean , required:true},
    },
    
    {
        timestamps: true
    }
)
// Índices para las consultas por documento padre / estado.
VinoDetalle_Schema.index({ vino: 1, estado: 1 });
VinoDetalle_Schema.index({ uva: 1 });
const VinoDetalle = mongoose.model("ProductoVinoDetalle", VinoDetalle_Schema, "ProductoVinoDetalle");

module.exports = VinoDetalle;
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
        }
    },
    
    {
        timestamps: true
    }
)
const VinoDetalle = mongoose.model("ProductoVinoDetalle", VinoDetalle_Schema, "ProductoVinoDetalle");

module.exports = VinoDetalle;
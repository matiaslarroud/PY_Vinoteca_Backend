const mongoose = require("mongoose");

const TransporteDetalle_Schema = mongoose.Schema({
        transporteID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Transporte',
            required: true
        },
        pais: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Pais',
                required: true
            },
        provincia: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Provincia',
                required: true
            },
        localidad: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Localidad',
                required: true
            },
    },
    
    {
        timestamps: true
    }
)
const TransporteDetalle = mongoose.model('TransporteDetalle', TransporteDetalle_Schema);

module.exports = TransporteDetalle;
const mongoose = require("mongoose");

const NotaPedido_Schema = mongoose.Schema({
    _id: Number,
    total: {type: Number , required:true},
    fecha: {type: Date , required:true},
    fechaEntrega: {type: Date },
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
    medioPago: {
            type: Number,
            ref: 'MedioPago',
            required: true
        },
    presupuesto: {
            type: Number,
            ref: 'Cliente_Presupuesto'
        },
    envio: {type: Boolean },
    provincia: {
        type: Number,
        ref: 'Provincia',
        required: function () {
            return this.envio === true;
        }
    },
    localidad: {
        type: Number,
        ref: 'Localidad',
        required: function () {
            return this.envio === true;
        }
    },
    barrio: {
        type: Number,
        ref: 'Barrio',
        required: function () {
            return this.envio === true;
        }
    },
    calle: {
        type: Number,
        ref: 'Calle',
       required: function () {
            return this.envio === true;
        }
    },    
    altura: {
        type: String,
        required: function () {
            return this.envio === true;
        }
    },
    deptoNumero: {
        type: String,
        require:false
    },
    deptoLetra: {
        type: String,
        require:false
    },
    descuento: {type: Number },
    estado: {type: Boolean , required:true},
},
    
    {
        timestamps: true
    }
)
NotaPedido_Schema.index({ estado: 1 });
NotaPedido_Schema.index({ cliente: 1 });
NotaPedido_Schema.index({ presupuesto: 1 });
const Cliente_NotaPedido = mongoose.model("Cliente_NotaPedido", NotaPedido_Schema , "Cliente_NotaPedido");

module.exports = Cliente_NotaPedido;
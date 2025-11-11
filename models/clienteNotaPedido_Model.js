const mongoose = require("mongoose");

const NotaPedido_Schema = mongoose.Schema({
    _id: Number,
    total: {type: Number , require:true},
    fecha: {type: Date , require:true},
    fechaEntrega: {type: Date , require:true},
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
    envio: {type: Boolean , require:true},
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
    descuento: {type: Number , require:true},
    estado: {type: Boolean , require:true},
},
    
    {
        timestamps: true
    }
)
const Cliente_NotaPedido = mongoose.model("Cliente_NotaPedido", NotaPedido_Schema , "Cliente_NotaPedido");

module.exports = Cliente_NotaPedido;
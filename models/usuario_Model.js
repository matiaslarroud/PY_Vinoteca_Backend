const mongoose = require("mongoose");

const Usuario_Schema = mongoose.Schema({
    _id: Number,
    name: {type: String , required:true},
    password: {type: String , required:true},
    rol: {type: String , required:true},
    cliente: {
        type: Number,
        ref: 'Cliente',
        required: false
    },
    estado: {type: Boolean , required:true},
    },
    
    {
        timestamps: true
    }
)
const Usuario = mongoose.model("Usuario", Usuario_Schema, "Usuario");

module.exports = Usuario;
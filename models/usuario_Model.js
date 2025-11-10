const mongoose = require("mongoose");

const Usuario_Schema = mongoose.Schema({
    _id: Number,
    name: {type: String , require:true},
    password: {type: String , require:true},
    rol: {type: String , require:true},
    estado: {type: Boolean , require:true},
    },
    
    {
        timestamps: true
    }
)
const Usuario = mongoose.model("Usuario", Usuario_Schema, "Usuario");

module.exports = Usuario;
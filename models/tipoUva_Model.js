const mongoose = require("mongoose");

const UvaTipo_Schema = mongoose.Schema({
    name: {type: String , require:true},
    tipo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vino_Tipo',
        required: true
    } ,
},
    {
        timestamps: true
    }  
    
)

const UvaTipo = mongoose.model("Uva_Tipo", UvaTipo_Schema);

module.exports = UvaTipo;
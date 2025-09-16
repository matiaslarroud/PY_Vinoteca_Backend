const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  _id: String,  // Nombre de la colección
  seq: { type: Number, default: 0 } // Último número usado
});

module.exports = mongoose.model("Counter", counterSchema);

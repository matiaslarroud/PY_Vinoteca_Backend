const Counter = require("../models/counter_Model");

const getNextSequence = async (collectionName) => {
  const counter = await Counter.findOneAndUpdate(
    { _id: collectionName },
    { $inc: { seq: 1 } },
    { new: true, upsert: true } // devuelve el documento actualizado o lo crea si no existe
  );
  return counter.seq;
};

module.exports = getNextSequence;

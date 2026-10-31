const Counter = require("../models/counter_Model");

// Devuelve el próximo número de la secuencia. Si se pasa `session`, el incremento forma parte
// de la transacción: si ésta se aborta, el número no se consume (sin huecos en la numeración).
// `cantidad` permite reservar un bloque de números de una vez (devuelve el primero del bloque).
const getNextSequence = async (collectionName, session = null, cantidad = 1) => {
  const counter = await Counter.findOneAndUpdate(
    { _id: collectionName },
    { $inc: { seq: cantidad } },
    { new: true, upsert: true, session }
  );
  return counter.seq - cantidad + 1;
};

module.exports = getNextSequence;

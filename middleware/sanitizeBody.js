// Elimina del body las claves que empiezan con "$" o contienen ".", para que un cliente
// no pueda colar operadores de MongoDB ({ "$ne": null }, { "$regex": ... }) en los filtros.
const limpiar = (valor) => {
  if (Array.isArray(valor)) return valor.map(limpiar);
  if (valor && typeof valor === 'object') {
    for (const clave of Object.keys(valor)) {
      if (clave.startsWith('$') || clave.includes('.')) {
        delete valor[clave];
      } else {
        valor[clave] = limpiar(valor[clave]);
      }
    }
  }
  return valor;
};

const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') limpiar(req.body);
  next();
};

module.exports = sanitizeBody;

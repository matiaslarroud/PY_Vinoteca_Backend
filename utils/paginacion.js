const { httpError } = require('./http');

// Paginación opcional de los listados: ?page=1&limit=50.
// Sin ninguno de los dos parámetros se devuelve todo, como antes (compatibilidad con el frontend actual).
const LIMITE_POR_DEFECTO = 50;
const LIMITE_MAXIMO = 200;

const leerPaginacion = (query = {}) => {
  if (query.page === undefined && query.limit === undefined) return null;

  const page = query.page === undefined ? 1 : Number(query.page);
  const limit = query.limit === undefined ? LIMITE_POR_DEFECTO : Number(query.limit);
  if (!Number.isInteger(page) || page < 1) {
    throw httpError(400, '❌ El parámetro page debe ser un entero mayor o igual a 1.');
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > LIMITE_MAXIMO) {
    throw httpError(400, `❌ El parámetro limit debe ser un entero entre 1 y ${LIMITE_MAXIMO}.`);
  }
  return { page, limit, skip: (page - 1) * limit };
};

const datosPaginacion = (p, total) => ({ page: p.page, limit: p.limit, total, pages: Math.ceil(total / p.limit) });

// `p` es el resultado de leerPaginacion. Conviene leerlo al principio del controlador, fuera
// del try/catch, para que un parámetro inválido llegue al manejador global como 400.
// Devuelve { data } o, si se pidió una página, { data, paginacion: { page, limit, total, pages } }.
// Las páginas van de la más nueva a la más vieja (_id descendente), igual que el orden por
// defecto de las tablas del frontend.
const paginar = async (Modelo, filtro, p, { sort = { _id: -1 } } = {}) => {
  if (!p) return { data: await Modelo.find(filtro).lean() };

  const [data, total] = await Promise.all([
    Modelo.find(filtro).sort(sort).skip(p.skip).limit(p.limit).lean(),
    Modelo.countDocuments(filtro),
  ]);
  return { data, paginacion: datosPaginacion(p, total) };
};

module.exports = { leerPaginacion, paginar, datosPaginacion, LIMITE_MAXIMO };

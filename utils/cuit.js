// CUIT: se guarda tal como se escribe, y además, si es un CUIT real, en cuitNumero (solo dígitos).
// El índice único es sobre cuitNumero: los clientes sin CUIT o con valores viejos de relleno no chocan.

const PESOS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

const soloDigitos = (valor) => String(valor ?? '').replace(/\D/g, '');

// 11 dígitos con dígito verificador correcto (módulo 11).
const esCuitValido = (digitos) => {
  if (!/^\d{11}$/.test(digitos)) return false;
  const suma = PESOS.reduce((acc, peso, i) => acc + peso * Number(digitos[i]), 0);
  const resto = 11 - (suma % 11);
  const verificador = resto === 11 ? 0 : resto;
  return verificador !== 10 && verificador === Number(digitos[10]);
};

// Devuelve { cuit, cuitNumero } listo para guardar, o null si el texto no es un CUIT válido.
// Vacío → sin CUIT (se permite).
const leerCuit = (valor) => {
  const texto = String(valor ?? '').trim();
  if (!texto) return { cuit: null, cuitNumero: null };
  const digitos = soloDigitos(texto);
  return esCuitValido(digitos) ? { cuit: texto, cuitNumero: digitos } : null;
};

module.exports = { soloDigitos, esCuitValido, leerCuit };

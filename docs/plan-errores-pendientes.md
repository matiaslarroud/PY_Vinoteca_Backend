# Plan: errores pendientes (después de las Fases 1–3)

Rama: `revision-2026` en los dos repos. Un commit por bloque.

**Importante:** el backend nuevo y el frontend actual tienen que salir **juntos**. Los bloques A y B son el mínimo para poder desplegar. El C se puede hacer en el frontend actual o absorberlo en la migración (Fase 5).

---

## A. Backend: lo que quedó abierto

> **Estado:** A1, A2 y A3 hechos, con tests (23 en total, todos pasan). A4 queda para la Fase 4.

### A1. La edición de productos pisa el stock (prioridad alta)

**Problema:** `PUT /products/vino/:id`, `/products/insumo/:id` y `/products/:id` guardan el `stock` que manda la pantalla. Si alguien abre la edición de un vino y mientras tanto se vende una unidad, al guardar el stock "vuelve" al valor viejo. Además, `updateProduct` genérico (`product_Controller.js:260`) rechaza stock 0 y ganancia 0 (`!stockProducto`, `!gananciaProducto`).

**Cambios:**
1. Quitar `stock` de los tres `updateProduct` (`productVino_Controller.js:119`, `productInsumo_Controller.js:100`, `product_Controller.js:270`). El stock inicial se sigue cargando al crear.
2. En `product_Controller.js:260` validar con `== null` en lugar de `!`.
3. Endpoint nuevo `POST /products/:id/ajusteStock` con `{ cantidad, motivo }`:
   - `cantidad` entero distinto de 0 (positivo suma, negativo resta).
   - `$inc` condicional, usando `sumarStock` / `descontarStock` de `utils/stock.js`. No permite dejar stock negativo.
   - Guarda el ajuste en una colección nueva `AjusteStock` (producto, cantidad, motivo, usuario, fecha) para auditoría.
4. Tests: editar un producto no cambia su stock; el ajuste negativo por encima del stock da 400; el ajuste queda registrado.

### A2. Presupuesto de cliente (prioridad alta)

**Problema principal:** la Nota de Pedido **hereda el precio del presupuesto** sin límite de tiempo, así que un presupuesto viejo mantiene precios desactualizados para siempre. El precio negociado es intencional (lo decide el vendedor); lo que falta es la vigencia y el control de los importes.

**Cambios en `clientePresupuesto_Controller.js`:**
1. **Precio negociado (decisión del usuario):** el vendedor puede editar el precio de cada línea (precio especial o redondeo manual), sin límite.
   - El servidor valida precio > 0 y cantidad entera, y recalcula `importe = precio × cantidad`.
   - Cada línea guarda también `precioLista` (el de ese día, `calcularPrecioEfectivo`), para mostrar en pantalla e informes cuánto se negoció.
   - El total se valida con `validarTotalConAjuste` (5%), igual que la nota.
1b. **Vigencia (propuesta del usuario):**
   - Campo `diasValidez` por presupuesto: por defecto **5**, mínimo 1, máximo **30**. Se guarda `fechaVencimiento` = fecha + `diasValidez`.
   - Al editar el presupuesto se pueden cambiar los días (dentro de 1–30) y se recalcula el vencimiento desde la fecha original.
   - Presupuestos viejos (sin `fechaVencimiento`): se consideran vencidos, así que la nota toma el precio actual.
   - Al crear la Nota de Pedido desde un presupuesto: si está **vigente**, se respeta el precio del presupuesto; si está **vencido**, se toma el precio actual del producto.
   - La pantalla muestra el estado "Vigente hasta dd/mm" o "Vencido: se usarán precios actuales".
   - Cambio en `prepararDetalles` de `clienteNotaPedido_Controller.js`: el precio del presupuesto solo tiene prioridad si `fechaVencimiento >= hoy`.
2. `updatePresupuesto` deja de tomar `fecha` del body (`:161`) y solo edita presupuestos activos.
3. Unificar el criterio de "tiene nota de pedido" en los tres lugares: solo cuentan **notas activas**.
   - `deletePresupuesto` (`:255`) hoy cuenta también las notas eliminadas, así que un presupuesto con una nota anulada no se puede borrar pero sí editar.
   - `getPresupuesto` (`:103`) trae todas las notas: pasa a `NotaPedido.distinct('presupuesto', { estado: true })`.
4. `validarCantidad` en las líneas, `getNextSequence` dentro de la sesión, `withTransaction` y detalles en lote (`insertMany`), como en la nota.
5. Tests: presupuesto vigente → la nota respeta el precio negociado; vencido → toma el precio actual; `diasValidez` 0 o 31 → 400; importe mal calculado → se recalcula; total fuera de tolerancia → 400; nota anulada libera el presupuesto.

### A3. Errores de clave duplicada (prioridad media)

**Problema:** un CUIT repetido (índice único de Cliente) termina como error 500 genérico.

**Cambio:** en el manejador global de `app.js`, mapear `err.code === 11000` a **409** con un mensaje legible ("Ya existe un registro con ese CUIT"). Test incluido.

### A4. Paginación (prioridad baja, va con el frontend)

`?page&limit` opcional en caja, notas, comprobantes, remitos, recibos y productos. Sin parámetros devuelve todo, como hoy. Conviene hacerla junto con el `DataTable` de la Fase 4, que es quien la va a usar.

---

## B. Frontend: compatibilidad con el backend nuevo (bloquea el despliegue)

1. **Botón de cambio de BD:** `pages/gestion/indexGestion.js:10,21` llama a `/ping/switchDb`, que ya no existe. Quitar el botón y mostrar, si se quiere, un indicador de entorno (`NEXT_PUBLIC_ENTORNO`).
2. **Stock en la edición de productos:** en `updateVino.js`, `updateInsumo.js` y `updatePicada.js`, el stock pasa a solo lectura, con un botón "Ajustar stock" que abre un modal (cantidad ± y motivo) contra el endpoint de A1.
3. **Mensajes de error del servidor:** las pantallas tienen que mostrar el `message` que devuelve el backend en lugar de un texto fijo. Casos nuevos que el usuario va a ver:
   - 409 "la nota ya está facturada" / "ya tiene comprobante" / "ya tiene remito".
   - 400 de total fuera de la tolerancia del 5%.
   - 400 de stock insuficiente, y en la orden de producción la lista `faltantes` (insumo, requerido, disponible).
4. **Comprobante de venta:** la edición solo cambia el tipo de comprobante. Bloquear en la pantalla la edición de líneas y total para que no parezca que se guardan.
5. **Recibos y pagos:** mostrar el error de sobrepago / límite de cuenta corriente.

---

## C. Frontend: bugs puntuales (en la pantalla actual o dentro de la Fase 5)

| Bug | Dónde | Arreglo |
|---|---|---|
| El orden muta el estado y rompe la tabla | `indexNotaPedido.js:40-72`, `indexVino.js:38-56` | Ordenar una copia (`[...lista].sort`) |
| `fetch` dentro de `useState` (se ejecuta en cada render) | `createNotaPedido.js:42` | Moverlo a `useEffect` |
| Se mutan los detalles en lugar de copiarlos | `createNotaPedido.js:305` | Actualizar con `map` y objeto nuevo |
| Una consulta de cliente por cada nota (N+1) | `indexNotaPedido.js:160` | Traer los clientes una vez y armar un mapa |
| Mensaje de WhatsApp sin codificar (se corta con `&`, `#`) | `tienda/index.js:160` | `encodeURIComponent` |

---

## D. Antes de desplegar

1. Producción: definir `MONGODB_URI` (sin ella el servidor no arranca).
2. Correr una consulta **de solo lectura** que liste notas con más de un comprobante activo. Si aparece alguna, el índice único no se crea; hay que decidir a mano qué comprobante anular (sin script de reparación, según lo acordado).
3. Remitos de cliente viejos: el campo `comprobanteVenta` nunca se guardó (el schema lo descartaba), así que esos remitos siguen sin vínculo con su factura. Solo afecta a los ya emitidos; no se corrige por código.
4. `npm test` en verde y recorrido manual de venta y compra contra la BD de prueba.

---

## Decisiones tomadas

- **Ajuste de stock:** solo administrador.
- **Presupuesto sin stock:** se permite, con aviso. Un presupuesto no compromete mercadería.
- **Nota desde un presupuesto:** cada línea se precarga con `min(cantidad presupuestada, stock real)`. Las líneas sin stock quedan marcadas y no se cargan. Nunca se vende lo que no hay en stock físico (la nota además descuenta con `$inc` condicional, así que dos ventas simultáneas tampoco pueden dejarlo negativo).
  - Endpoint nuevo `GET /cliente/presupuesto/:id/paraNota`: devuelve las líneas con cantidad sugerida, stock disponible y el precio que va a aplicar la nota (negociado si está vigente, actual si venció). Así la pantalla y el servidor usan la misma regla.

## Orden sugerido

A1 + A2 + A3 (backend, con tests) → B (frontend, para poder desplegar) → D (despliegue) → C y A4 dentro de las Fases 4–5.

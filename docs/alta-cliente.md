# Alta de un cliente nuevo

Todos los clientes usan **el mismo código**: los repos `PY_Vinoteca_Backend` (rama `master`) y
`PY_Vinoteca_Frontend` (rama `main`). En GitHub no se crea nada por cliente. Lo que distingue a
cada uno son:

- **Sus variables de entorno**, en su proyecto de Coolify.
- **Su base de datos**, con el documento `Configuracion` (nombre, logo, color, datos fiscales y módulos).

## 1. Base de datos (MongoDB Atlas)

1. Elegí un nombre de base para el cliente, por ejemplo `Cliente2`. Las bases se crean solas al
   primer uso, así que no hace falta crearla a mano.
2. En **Security → Database Access**, creá un usuario solo para esta base (rol `readWrite` sobre
   `Cliente2`).
3. Armá la URI:
   `mongodb+srv://<usuario>:<password>@vinOteca.thjyjhn.mongodb.net/Cliente2?retryWrites=true&w=majority`.
   Revisá que tenga el nombre de la base: sin eso, el backend se conecta a una base vacía `test`.
4. Comprobá que la IP del VPS esté en **Security → Network Access**.

## 2. DNS

En el proveedor del dominio del cliente, creá dos registros **A** que apunten a la IP del VPS:

- `api.<dominio>`: backend.
- `<dominio>` o `app.<dominio>`: frontend.

## 3. Proyecto en Coolify

1. Entrá a **Projects → + Add** y ponele el nombre del cliente. Ya trae el environment `production`.
2. Creá el **backend**: **+ New → Private Repository (with GitHub App)**.
   - Repo `PY_Vinoteca_Backend`, rama `master`, build pack Nixpacks.
   - Ports Exposes: `4000`. Health check: `/api/v1/ping`.
   - Dominio: `https://api.<dominio>`.
   - Variables de entorno:

     | Variable | Valor |
     |---|---|
     | `MONGODB_URI` | La URI del paso 1 |
     | `JWT_SECRET` | Un texto aleatorio largo, **distinto para cada cliente** |
     | `ROUTE` | `/api/v1` |
     | `BASE_URL` | `https://<dominio>` (varios separados por coma) |
     | `NODE_ENV` | `production` |
     | `PORT` | `4000` |
     | `TRUST_PROXY` | `1` |
     | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Credenciales de Cloudinary |
     | `NIXPACKS_NODE_VERSION` | `22` |

3. Desplegá y abrí `https://api.<dominio>/api/v1/ping` para comprobar que responde.
4. Creá el **frontend**: **+ New → Private Repository**.
   - Repo `PY_Vinoteca_Frontend`, rama `main`, Nixpacks.
   - Ports Exposes: `3000`. Dominio: `https://<dominio>`.
   - Variables, marcadas como **Build Variable** (Next.js las fija al compilar):
     - `NEXT_PUBLIC_BACKEND_URL` = `https://api.<dominio>/api/v1`
     - `NIXPACKS_NODE_VERSION` = `22`
5. En las dos aplicaciones, activá **Auto Deploy** para que se actualicen con cada push.
6. En **Advanced → Resource Limits**, poné un límite de memoria (por ejemplo 512 MB), así un
   cliente no afecta a los demás.

## 4. Inicializar el negocio

Desde la **Terminal** de la aplicación backend en Coolify (ya tiene `MONGODB_URI` cargada):

```bash
ADMIN_USUARIO=admin ADMIN_PASSWORD='<contraseña inicial>' node scripts/inicializarNegocio.js \
  --razon-social "Razón Social SRL" --nombre-fantasia "Nombre del local" \
  --cuit "30-00000000-0" --color "#1e6b52" --whatsapp "5492215555555" \
  --apagar vinos,picadas,produccion
```

- Crea la configuración, las tablas base (condiciones de IVA, tipos de comprobante, medios de pago)
  y el usuario administrador si no existe.
- Se puede correr más de una vez: solo crea lo que falta.
- `--apagar` recibe los módulos que el cliente no usa: `vinos`, `picadas`, `produccion`, `ofertas`, `tienda`.
- Pedile al cliente que cambie la contraseña del administrador en el primer ingreso.

## 5. Terminar la configuración desde el sistema

Entrá como administrador en `https://<dominio>` y completá **Gestión → Configuración**:

- Datos de la empresa, que aparecen en facturas, remitos y presupuestos.
- Logo, color principal, alícuota de IVA y WhatsApp de la tienda.
- Módulos activos. Se pueden cambiar en cualquier momento.

## 6. Backups

En Atlas, revisá que la base esté incluida en los backups del cluster. El plan gratuito M0 no
tiene backups automáticos: en ese caso programá un `mongodump` diario hacia un almacenamiento externo.

## Checklist

- [ ] `https://api.<dominio>/api/v1/ping` responde.
- [ ] El login muestra el nombre y el logo del cliente.
- [ ] El menú muestra solo los módulos activos.
- [ ] Una factura de prueba en PDF sale con los datos de la empresa.

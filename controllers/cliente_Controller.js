const Cliente = require("../models/cliente_Model");
const getNextSequence = require("../controllers/counter_Controller");
const ComprobanteVenta = require("../models/clienteComprobanteVenta_Model");

const setCliente = async (req,res) => {
    const nombreC = req.body.name;
    const apellidoC = req.body.lastname;
    const nacimientoC = new Date(req.body.fechaNacimiento);
    const telefonoC = req.body.telefono;
    const emailC = req.body.email;
    const cuitC = req.body.cuit;
    const paisC = req.body.pais;
    const provinciaC = req.body.provincia;
    const localidadC = req.body.localidad;
    const altura = req.body.altura;
    const deptoNumero = req.body.deptoNumero;
    const deptoLetra = req.body.deptoLetra;
    const barrioC = req.body.barrio;
    const calleC = req.body.calle;
    const ivaC = req.body.condicionIva;
    const cuentaCorrienteC = req.body.cuentaCorriente ? true : false;
    const saldoCuentaCorriente = req.body.saldoCuentaCorriente;

    if(!nombreC || !altura || !apellidoC || !nacimientoC || !telefonoC || !emailC || !cuitC
         || !paisC || !provinciaC || !localidadC || !barrioC || !calleC || !ivaC){
        res.status(400).json({ok:false , message:"❌ Faltan completar algunos campos obligatorios."})
        return
    }
    const newId = await getNextSequence("Cliente");
    const newCliente = new Cliente ({
        _id: newId,
        name: nombreC , lastname: apellidoC , fechaNacimiento: nacimientoC , telefono: telefonoC , email: emailC , cuit: cuitC ,
        pais: paisC , provincia: provinciaC , localidad: localidadC , barrio: barrioC , calle: calleC , condicionIva: ivaC, cuentaCorriente: cuentaCorrienteC ,
        altura: altura , deptoNumero: deptoNumero , deptoLetra: deptoLetra , estado:true
    });    

    if (cuentaCorrienteC) {
        if (!saldoCuentaCorriente) {
            res.status(400).json({ok:false , message:'❌ Error al cargar saldo de cuenta corriente.'})
            return
        }
        newCliente.saldoCuentaCorriente = saldoCuentaCorriente;
        newCliente.saldoActualCuentaCorriente = saldoCuentaCorriente;
    }

    await newCliente.save()
        .then( () => {
            res.status(201).json({ok:true, message:'✔️ Cliente agregado correctamente.'})
        })
        .catch((err) => {
            res.status(400).json({
                ok:false,
                message:`❌  Error al agregar cliente. ERROR:\n${err}`
            })
        })

}

const getCliente = async(req, res) => {
    const clientes = await Cliente.find({estado:true}).lean();

    res.status(200).json({
        ok:true,
        data: clientes
    })
}

const getClienteID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente',
        })
        return
    }

    const cliente = await Cliente.findById(id).lean();
    if(!cliente){
        res.status(404).json({
            ok:false,
            message:'❌ El id no corresponde a un cliente.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        message:"✔️ Cliente obtenido con exito.",
        data:cliente,
    })
}

const updateCliente = async(req,res) => {
    const id = req.params.id;
    
    const nombreC = req.body.name;
    const apellidoC = req.body.lastname;
    const nacimientoC = new Date(req.body.fechaNacimiento);
    const telefonoC = req.body.telefono;
    const emailC = req.body.email;
    const cuitC = req.body.cuit;
    const paisC = req.body.pais;
    const provinciaC = req.body.provincia;
    const localidadC = req.body.localidad;
    const barrioC = req.body.barrio;
    const calleC = req.body.calle;
    const ivaC = req.body.condicionIva;
    const cuentaCorrienteC = req.body.cuentaCorriente;
    const altura = req.body.altura;
    const deptoNumero = req.body.deptoNumero;
    const deptoLetra = req.body.deptoLetra;
    const saldoCuentaCorriente = req.body.saldoCuentaCorriente;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente.',
        })
        return
    }

    const updatedClienteData = {
        name: nombreC , lastname: apellidoC , fechaNacimiento: nacimientoC , telefono: telefonoC , email: emailC , cuit: cuitC ,
        pais: paisC , provincia: provinciaC , localidad: localidadC , barrio: barrioC , calle: calleC , condicionIva: ivaC , cuentaCorriente:cuentaCorrienteC ,
        altura: altura , deptoNumero: deptoNumero , deptoLetra: deptoLetra
    };

    if(!nombreC || !altura || !apellidoC || !nacimientoC || !telefonoC || !emailC || !cuitC
         || !paisC || !provinciaC || !localidadC || !barrioC || !calleC || !ivaC){
        res.status(400).json({ok:false , message:"❌ Faltan completar algunos campos obligatorios."})
        return
    }  

    if (cuentaCorrienteC) {
        if (!saldoCuentaCorriente) {
            return res.status(400).json({
                ok:false,
                message:'❌ Error al cargar saldo de cuenta corriente.'
            });
        }

        // Traer cliente actual
        const cliente = await Cliente.findById(id);

        // Actualizamos el saldo de cuenta corriente si el cliente ya lo poseia cuenta corriente asignada
        if(cliente.cuentaCorriente === true) {
            // Calcular diferencia
            const diferenciaCuentaCorriente =
                saldoCuentaCorriente - cliente.saldoCuentaCorriente;

            // Actualizar ambos saldos en base al cliente actual
            updatedClienteData.saldoCuentaCorriente =
                cliente.saldoCuentaCorriente + diferenciaCuentaCorriente;

            updatedClienteData.saldoActualCuentaCorriente =
                cliente.saldoActualCuentaCorriente + diferenciaCuentaCorriente;
        } else {
            updatedClienteData.cuentaCorriente = true;
            updatedClienteData.saldoCuentaCorriente = saldoCuentaCorriente;
            updatedClienteData.saldoActualCuentaCorriente = saldoCuentaCorriente;
        }
        
    }

    if(!cuentaCorrienteC){
        // Traer cliente actual
        const cliente = await Cliente.findById(id);

        // Borramos el saldo de su cuenta corriente
        if(cliente.cuentaCorriente === true) {
            updatedClienteData.saldoCuentaCorriente = '';
            updatedClienteData.saldoActualCuentaCorriente = '';
        }
    }


    const updatedCliente = await Cliente.findByIdAndUpdate(
        id,
        updatedClienteData,
        { new: true , runValidators: true }
    ) 

    if(!updatedCliente){
        res.status(400).json({
            ok:false,
            message:'❌ Error al actualizar cliente.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'✔️ Cliente actualizado correctamente.',
    })
}

//Validaciones de eliminacion
const Presupuesto = require("../models/clientePresupuesto_Model");
const NotaPedido = require("../models/clienteNotaPedido_Model");
const ReciboPago = require("../models/clienteReciboPago_Model");

const deleteCliente = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'❌ El id no llego al controlador correctamente.'
        })
        return
    }

    const tienePresupuestos = await Presupuesto.exists({ cliente: id });
    if (tienePresupuestos) {
      return res.status(400).json({
        ok: false,
        message: "❌ Error al eliminar. Existen tablas relacionadas a este cliente."
      });
    }

    const tieneNotasPedido = await NotaPedido.exists({ cliente: id });
    if (tieneNotasPedido) {
      return res.status(400).json({
        ok: false,
        message: "❌ Error al eliminar. Existen tablas relacionadas a este cliente."
      });
    }

    const tieneRecibosPago = await ReciboPago.exists({ clienteID: id });
    if (tieneRecibosPago) {
      return res.status(400).json({
        ok: false,
        message: "❌ Error al eliminar. Existen tablas relacionadas a este cliente."
      });
    }

    const deletedCliente = await Cliente.findByIdAndUpdate(
        id,
        {
           estado:false
        },
        { new: true , runValidators: true }
    )
    if(!deletedCliente){
        res.status(400).json({
            ok:false,
            message: '❌ Error durante el borrado.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'✔️ Cliente eliminado correctamente.'
    })
}

const buscarCliente = async(req,res) => {
  try {
    const {
      name, lastname, telefono, email, cuit,
      pais, provincia, localidad, barrio, calle,
      altura, deptoNumero, deptoLetra, condicionIva, cuentaCorriente
    } = req.body;

    const query = { estado: true };
    if (name)         query.name      = { $regex: name, $options: 'i' };
    if (lastname)     query.lastname  = { $regex: lastname, $options: 'i' };
    if (telefono)     query.telefono  = { $regex: telefono, $options: 'i' };
    if (email)        query.email     = { $regex: email, $options: 'i' };
    if (cuit)         query.cuit      = { $regex: cuit, $options: 'i' };
    if (pais)         query.pais      = pais;
    if (provincia)    query.provincia = provincia;
    if (localidad)    query.localidad = localidad;
    if (barrio)       query.barrio    = barrio;
    if (calle)        query.calle     = calle;
    if (altura)       query.altura    = Number(altura);
    if (deptoNumero)  query.deptoNumero = Number(deptoNumero);
    if (deptoLetra)   query.deptoLetra = { $regex: `^${deptoLetra}$`, $options: 'i' };
    if (condicionIva) query.condicionIva = condicionIva;
    if (typeof cuentaCorriente === 'boolean') query.cuentaCorriente = cuentaCorriente;

    const clientes = await Cliente.find(query).lean();
    res.status(200).json({ ok: true, message: "✔️ Clientes obtenidos correctamente.", data: clientes });
  } catch (error) {
    res.status(500).json({ ok: false, message: "❌ Error al buscar clientes" });
  }
}

const getClientesInactivos = async (req, res) => {
  try {
    const dias = parseInt(req.query.dias) || 30;
    const umbral = new Date();
    umbral.setDate(umbral.getDate() - dias);

    // 1. Mapa notaPedidoID → clienteID
    const notasPedido = await NotaPedido.find({ estado: true }).lean();
    const mapaNotaCliente = {};
    for (const np of notasPedido) {
      mapaNotaCliente[np._id] = np.cliente;
    }

    // 2. Agrupar comprobantes por cliente: MAX(fecha) y SUM(total)
    const comprobantes = await ComprobanteVenta.find({ estado: true }).lean();
    const mapaCliente = {};
    for (const cv of comprobantes) {
      const clienteID = mapaNotaCliente[cv.notaPedido];
      if (!clienteID) continue;
      if (!mapaCliente[clienteID]) {
        mapaCliente[clienteID] = { ultimaCompra: cv.fecha, totalHistorico: 0 };
      }
      if (new Date(cv.fecha) > new Date(mapaCliente[clienteID].ultimaCompra)) {
        mapaCliente[clienteID].ultimaCompra = cv.fecha;
      }
      mapaCliente[clienteID].totalHistorico += Number(cv.total) || 0;
    }

    // 3. Filtrar clientes sin compras recientes
    const clientes = await Cliente.find({ estado: true }).lean();
    const hoy = new Date();
    const resultado = [];

    for (const c of clientes) {
      const datos = mapaCliente[c._id];
      const ultimaCompra = datos?.ultimaCompra || null;

      if (!ultimaCompra || new Date(ultimaCompra) < umbral) {
        const diasSinComprar = ultimaCompra
          ? Math.floor((hoy - new Date(ultimaCompra)) / (1000 * 60 * 60 * 24))
          : null;

        resultado.push({
          clienteID: c._id,
          nombre: `${c.name} ${c.lastname}`,
          email: c.email,
          telefono: c.telefono,
          fechaUltimaCompra: ultimaCompra ? new Date(ultimaCompra).toISOString().split('T')[0] : null,
          diasSinComprar,
          totalHistorico: datos?.totalHistorico || 0,
          cuentaCorriente: c.cuentaCorriente
        });
      }
    }

    resultado.sort((a, b) => {
      if (a.diasSinComprar === null) return 1;
      if (b.diasSinComprar === null) return -1;
      return b.diasSinComprar - a.diasSinComprar;
    });

    return res.status(200).json({
      ok: true,
      data: resultado,
      message: `✔️ ${resultado.length} cliente(s) inactivos encontrados.`
    });

  } catch (error) {
    console.error('❌ Error getClientesInactivos:', error);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno del servidor.'
    });
  }
};

module.exports = { setCliente , getCliente , getClienteID , updateCliente , deleteCliente , buscarCliente , getClientesInactivos };
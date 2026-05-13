const Cliente = require("../models/cliente_Model");
const getNextSequence = require("../controllers/counter_Controller");

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

module.exports = { setCliente , getCliente , getClienteID , updateCliente , deleteCliente , buscarCliente };
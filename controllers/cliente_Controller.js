const Cliente = require("../models/cliente_Model");
const getNextSequence = require("../controllers/counter_Controller");

const setCliente = async (req,res) => {
    const newId = await getNextSequence("Cliente");
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

    if(!nombreC || !altura || !apellidoC || !nacimientoC || !telefonoC || !emailC || !cuitC
         || !paisC || !provinciaC || !localidadC || !barrioC || !calleC || !ivaC){
        res.status(400).json({ok:false , message:'Error al cargar los datos.'})
        return
    }
    const newCliente = new Cliente ({
        _id: newId,
        name: nombreC , lastname: apellidoC , fechaNacimiento: nacimientoC , telefono: telefonoC , email: emailC , cuit: cuitC ,
        pais: paisC , provincia: provinciaC , localidad: localidadC , barrio: barrioC , calle: calleC , condicionIva: ivaC, cuentaCorriente: cuentaCorrienteC ,
        altura: altura , deptoNumero: deptoNumero , deptoLetra: deptoLetra , estado:true
    });
    await newCliente.save()
        .then( () => {
            res.status(201).json({ok:true, message:'Cliente agregado correctamente.'})
        })
        .catch((err)=>{console.log(err)});

}

const getCliente = async(req, res) => {
    const clientes = await Cliente.find({estado:true});

    res.status(200).json({
        ok:true,
        data: clientes,
    })
}

const getClienteID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const cliente = await Cliente.findById(id);
    if(!cliente){
        res.status(400).json({
            ok:false,
            message:'El id no corresponde a un cliente.'
        })
        return
    }

    res.status(200).json({
        ok:true,
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

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.',
        })
        return
    }

    if(!nombreC || !altura || !apellidoC || !nacimientoC || !telefonoC || !emailC || !cuitC
         || !paisC || !provinciaC || !localidadC || !barrioC || !calleC || !ivaC){
        res.status(400).json({ok:false , message:'Error al cargar los datos.'})
        return
    }

    const updatedCliente = await Cliente.findByIdAndUpdate(
        id,
        {
            name: nombreC , lastname: apellidoC , fechaNacimiento: nacimientoC , telefono: telefonoC , email: emailC , cuit: cuitC ,
            pais: paisC , provincia: provinciaC , localidad: localidadC , barrio: barrioC , calle: calleC , condicionIva: ivaC , cuentaCorriente:cuentaCorrienteC ,
            altura: altura , deptoNumero: deptoNumero , deptoLetra: deptoLetra
        },
        { new: true , runValidators: true }
    )

    if(!updatedCliente){
        res.status(400).json({
            ok:false,
            message:'Error al actualizar cliente.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'Cliente actualizado correctamente.',
    })
}

const deleteCliente = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.'
        })
        return
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
            message: 'Error durante el borrado.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'Cliente eliminado correctamente.'
    })
}

const buscarCliente = async(req,res) => {
  try {
    const nombreC = req.body.name;
    const apellidoC = req.body.lastname;
    const telefonoC = req.body.telefono;
    const emailC = req.body.email;
    const cuitC = req.body.cuit;
    const paisC = req.body.pais;
    const provinciaC = req.body.provincia;
    const localidadC = req.body.localidad;
    const barrioC = req.body.barrio;
    const calleC = req.body.calle;
    const alturaC = req.body.altura;
    const deptoNumeroC = req.body.deptoNumero;
    const deptoLetraC = req.body.deptoLetra;
    const condicionIvaC = req.body.condicionIva;
    const cuentaCorrienteC = req.body.cuentaCorriente;
// Primero traemos todos los clientes
const clientes = await Cliente.find();

// Luego filtramos dinámicamente
const clientesFiltrados = clientes.filter(c => {
  // Cada condición solo se evalúa si el campo tiene valor
  const coincideNombre = nombreC ? c.name?.toLowerCase().includes(nombreC.toLowerCase()) : true;
  const coincideApellido = apellidoC ? c.lastname?.toLowerCase().includes(apellidoC.toLowerCase()) : true;
  const coincideTelefono = telefonoC ? c.telefono?.toLowerCase().includes(telefonoC.toLowerCase()) : true;
  const coincideEmail = emailC ? c.email?.toLowerCase().includes(emailC.toLowerCase()) : true;
  const coincideCuit = cuitC ? c.cuit?.toLowerCase().includes(cuitC.toLowerCase()) : true;
  const coincidePais = paisC ? String(c.pais) === String(paisC) : true;
  const coincideProvincia = provinciaC ? String(c.provincia) === String(provinciaC) : true;
  const coincideLocalidad = localidadC ? String(c.localidad) === String(localidadC) : true;
  const coincideBarrio = barrioC ? String(c.barrio) === String(barrioC) : true;
  const coincideCalle = calleC ? String(c.calle) === String(calleC) : true;
  const coincideAltura = alturaC ? Number(c.altura) === Number(alturaC) : true;
  const coincideDeptoNumero = deptoNumeroC ? Number(c.deptoNumero) === Number(deptoNumeroC) : true;
  const coincideDeptoLetra = deptoLetraC ? c.deptoLetra?.toLowerCase() === deptoLetraC.toLowerCase() : true;
  const coincideCondicionIva = condicionIvaC ? String(c.condicionIva) === String(condicionIvaC) : true;
  const coincideCuentaCorriente = typeof cuentaCorrienteC === "boolean" ? p.cuentaCorriente === cuentaCorrienteC : true;

  // Si todos los criterios activos coinciden => mantener cliente
  return (
    coincideNombre &&
    coincideApellido &&
    coincideTelefono &&
    coincideEmail &&
    coincideCuit &&
    coincidePais &&
    coincideProvincia &&
    coincideLocalidad &&
    coincideBarrio &&
    coincideCalle &&
    coincideAltura &&
    coincideDeptoNumero &&
    coincideDeptoLetra &&
    coincideCondicionIva &&
    coincideCuentaCorriente
  );
});


    res.status(200).json({ ok: true, data: clientesFiltrados });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: "Error al buscar clientes" });
  }
}

module.exports = { setCliente , getCliente , getClienteID , updateCliente , deleteCliente , buscarCliente };
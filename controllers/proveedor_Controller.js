const Proveedor = require("../models/proveedor_Model");
const getNextSequence = require("../controllers/counter_Controller");

const setProveedor = async (req,res) => {
    const newId = await getNextSequence("Proveedor");
    const nombreC = req.body.name;
    const telefonoC = req.body.telefono;
    const emailC = req.body.email;
    const cuitC = req.body.cuit;
    const paisC = req.body.pais;
    const provinciaC = req.body.provincia;
    const localidadC = req.body.localidad;
    const barrioC = req.body.barrio;
    const calleC = req.body.calle;
    const alturaC = req.body.altura;
    const ivaC = req.body.condicionIva;

    if(!nombreC || !telefonoC || !emailC || !cuitC
         || !paisC || !provinciaC || !localidadC || !barrioC || !calleC || !ivaC){
        res.status(400).json({ok:false , message:'Error al cargar los datos.'})
        return
    }
    const newProveedor = new Proveedor ({
        _id: newId,
        name: nombreC , telefono: telefonoC , email: emailC , cuit: cuitC , estado:true,
        pais: paisC , provincia: provinciaC , localidad: localidadC , barrio: barrioC , calle: calleC , altura: alturaC , condicionIva: ivaC
    });
    await newProveedor.save()
        .then( () => {
            res.status(201).json({ok:true, message:'Proveedor agregado correctamente.'})
        })
        .catch((err)=>{console.log(err)});

}

const getProveedor = async(req, res) => {
    const proveedores = await Proveedor.find({estado:true});

    res.status(200).json({
        ok:true,
        data: proveedores,
    })
}

const getProveedorID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const proveedor = await Proveedor.findById(id);
    if(!proveedor){
        res.status(400).json({
            ok:false,
            message:'El id no corresponde a un proveedor.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:proveedor,
    })
}

const updateProveedor = async(req,res) => {
    const id = req.params.id;
    
    const nombreC = req.body.name;
    const telefonoC = req.body.telefono;
    const emailC = req.body.email;
    const cuitC = req.body.cuit;
    const paisC = req.body.pais;
    const provinciaC = req.body.provincia;
    const localidadC = req.body.localidad;
    const barrioC = req.body.barrio;
    const calleC = req.body.calle;
    const alturaC = req.body.altura;
    const ivaC = req.body.condicionIva;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.',
        })
        return
    }

    if(!nombreC || !telefonoC || !emailC || !cuitC
         || !paisC || !provinciaC || !localidadC || !barrioC || !calleC || !ivaC){
        res.status(400).json({ok:false , message:'Error al cargar los datos.'})
        return
    }

    const updatedProveedor = await Proveedor.findByIdAndUpdate(
        id,
        {
            name: nombreC , telefono: telefonoC , email: emailC , cuit: cuitC ,
            pais: paisC , provincia: provinciaC , localidad: localidadC , barrio: barrioC , calle: calleC , altura:alturaC , condicionIva: ivaC 
        },
        { new: true , runValidators: true }
    )

    if(!updatedProveedor){
        res.status(400).json({
            ok:false,
            message:'Error al actualizar proveedor.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'Proveedor actualizado correctamente.',
    })
}

const deleteProveedor = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.'
        })
        return
    }

    const deletedProveedor = await  Proveedor.findByIdAndUpdate(
        id,
        {
            estado:false
        },
        { new: true , runValidators: true }
    );
    if(!deletedProveedor){
        res.status(400).json({
            ok:false,
            message: 'Error durante el borrado.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'Proveedor eliminado correctamente.'
    })
}

const buscarProveedor = async(req,res) => {
  try {
    const nombreC = req.body.name;
    const telefonoC = req.body.telefono;
    const emailC = req.body.email;
    const cuitC = req.body.cuit;
    const paisC = req.body.pais;
    const provinciaC = req.body.provincia;
    const localidadC = req.body.localidad;
    const barrioC = req.body.barrio;
    const calleC = req.body.calle;
    const alturaC = req.body.altura;
    const condicionIvaC = req.body.condicionIva;
// Primero traemos todos los clientes
const proveedores = await Proveedor.find();

// Luego filtramos dinámicamente
const proveedoresFiltrados = proveedores.filter(c => {
  // Cada condición solo se evalúa si el campo tiene valor
  const coincideNombre = nombreC ? c.name?.toLowerCase().includes(nombreC.toLowerCase()) : true;
  const coincideTelefono = telefonoC ? c.telefono?.toLowerCase().includes(telefonoC.toLowerCase()) : true;
  const coincideEmail = emailC ? c.email?.toLowerCase().includes(emailC.toLowerCase()) : true;
  const coincideCuit = cuitC ? c.cuit?.toLowerCase().includes(cuitC.toLowerCase()) : true;

  const coincidePais = paisC ? String(c.pais) === String(paisC) : true;
  const coincideProvincia = provinciaC ? String(c.provincia) === String(provinciaC) : true;
  const coincideLocalidad = localidadC ? String(c.localidad) === String(localidadC) : true;
  const coincideBarrio = barrioC ? String(c.barrio) === String(barrioC) : true;
  const coincideCalle = calleC ? String(c.calle) === String(calleC) : true;
  const coincideAltura = alturaC ? Number(c.altura) === Number(alturaC) : true;
  const coincideCondicionIva = condicionIvaC ? String(c.condicionIva) === String(condicionIvaC) : true;

  // Si todos los criterios activos coinciden => mantener cliente
  return (
    coincideNombre &&
    coincideTelefono &&
    coincideEmail &&
    coincideCuit &&
    coincidePais &&
    coincideProvincia &&
    coincideLocalidad &&
    coincideBarrio &&
    coincideCalle &&
    coincideAltura &&
    coincideCondicionIva
  );
});


    res.status(200).json({ ok: true, data: proveedoresFiltrados });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: "Error al buscar proveedores" });
  }
}

module.exports = { setProveedor , getProveedor , getProveedorID , updateProveedor , deleteProveedor , buscarProveedor};
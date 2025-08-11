const Proveedor = require("../models/proveedor_Model");

const setProveedor = async (req,res) => {
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

    if(!nombreC || !apellidoC || !nacimientoC || !telefonoC || !emailC || !cuitC
         || !paisC || !provinciaC || !localidadC || !barrioC || !calleC || !ivaC){
        res.status(400).json({ok:false , message:'Error al cargar los datos.'})
        return
    }
    const newProveedor = new Proveedor ({
        name: nombreC , lastname: apellidoC , fechaNacimiento: nacimientoC , telefono: telefonoC , email: emailC , cuit: cuitC ,
        pais: paisC , provincia: provinciaC , localidad: localidadC , barrio: barrioC , calle: calleC , condicionIva: ivaC
    });
    await newProveedor.save()
        .then( () => {
            res.status(201).json({ok:true, message:'Proveedor agregado correctamente.'})
        })
        .catch((err)=>{console.log(err)});

}

const getProveedor = async(req, res) => {
    const proveedores = await Proveedor.find();

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
    if(!Proveedor){
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

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.',
        })
        return
    }

    if(!nombreC || !apellidoC || !nacimientoC || !telefonoC || !emailC || !cuitC
         || !paisC || !provinciaC || !localidadC || !barrioC || !calleC || !ivaC){
        res.status(400).json({ok:false , message:'Error al cargar los datos.'})
        return
    }

    const updatedProveedor = await Proveedor.findByIdAndUpdate(
        id,
        {
            name: nombreC , lastname: apellidoC , fechaNacimiento: nacimientoC , telefono: telefonoC , email: emailC , cuit: cuitC ,
            pais: paisC , provincia: provinciaC , localidad: localidadC , barrio: barrioC , calle: calleC , condicionIva: ivaC 
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

    const deletedProveedor = await Proveedor.findByIdAndDelete(id);
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

module.exports = { setProveedor , getProveedor , getProveedorID , updateProveedor , deleteProveedor };
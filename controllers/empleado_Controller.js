const Empleado = require("../models/empleado_Model");

const setEmpleado = async (req,res) => {
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

    if(!nombreC || !apellidoC || !nacimientoC || !telefonoC || !emailC || !cuitC
         || !paisC || !provinciaC || !localidadC || !barrioC || !calleC){
        res.status(400).json({ok:false , message:'Error al cargar los datos.'})
        return
    }
    const newEmpleado = new Empleado ({
        name: nombreC , lastname: apellidoC , fechaNacimiento: nacimientoC , telefono: telefonoC , email: emailC , cuit: cuitC ,
        pais: paisC , provincia: provinciaC , localidad: localidadC , barrio: barrioC , calle: calleC
    });
    await newEmpleado.save()
        .then( () => {
            res.status(201).json({ok:true, message:'Empleado agregado correctamente.'})
        })
        .catch((err)=>{console.log(err)});

}

const getEmpleado = async(req, res) => {
    const empleados = await Empleado.find();

    res.status(200).json({
        ok:true,
        data: empleados,
    })
}

const getEmpleadoID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const empleado = await Empleado.findById(id);
    if(!empleado){
        res.status(400).json({
            ok:false,
            message:'El id no corresponde a un empleado.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:empleado,
    })
}

const updateEmpleado = async(req,res) => {
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

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.',
        })
        return
    }

    if(!nombreC || !apellidoC || !nacimientoC || !telefonoC || !emailC || !cuitC
         || !paisC || !provinciaC || !localidadC || !barrioC || !calleC){
        res.status(400).json({ok:false , message:'Error al cargar los datos.'})
        return
    }

    const updatedEmpleado = await Empleado.findByIdAndUpdate(
        id,
        {
            name: nombreC , lastname: apellidoC , fechaNacimiento: nacimientoC , telefono: telefonoC , email: emailC , cuit: cuitC ,
            pais: paisC , provincia: provinciaC , localidad: localidadC , barrio: barrioC , calle: calleC
        },
        { new: true , runValidators: true }
    )

    if(!updatedEmpleado){
        res.status(400).json({
            ok:false,
            message:'Error al actualizar empleado.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'Empleado actualizado correctamente.',
    })
}

const deleteEmpleado = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.'
        })
        return
    }

    const deletedEmpleado = await Empleado.findByIdAndDelete(id);
    if(!deletedEmpleado){
        res.status(400).json({
            ok:false,
            message: 'Error durante el borrado.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'Empleado eliminado correctamente.'
    })
}

module.exports = { setEmpleado , getEmpleado , getEmpleadoID , updateEmpleado , deleteEmpleado };
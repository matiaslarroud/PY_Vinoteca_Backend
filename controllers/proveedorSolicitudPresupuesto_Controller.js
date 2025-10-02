const SolicitudPresupuesto = require("../models/proveedorSolicitudPresupuesto_Model");
const SolicitudPresupuestoDetalle = require("../models/proveedorSolicitudPresupuestoDetalle_Model");
const getNextSequence = require("./counter_Controller");

const obtenerFechaHoy = () => {
  const hoy = new Date();
  return hoy.toISOString().split("T")[0];
}

const setSolicitudPresupuesto = async (req,res) => {
    const newId = await getNextSequence("Proveedor_SolicitudPresupuesto");
    const fechaP = obtenerFechaHoy();
    const provedorP = req.body.proveedor;
    const empleadoID = req.body.empleado;

    if( !fechaP || !provedorP || !empleadoID ){
        res.status(400).json({ok:false , message:'Error al cargar los datos.'})
        return
    }
    const newSolicitudPresupuesto = new SolicitudPresupuesto ({
        _id: newId,
        fecha: fechaP , proveedor: provedorP, empleado:empleadoID 
    });
    await newSolicitudPresupuesto.save()
        .then( () => {
            res.status(201).json({
                ok:true, 
                message:'Solicitud de presupuesto agregado correctamente.',
                data: newSolicitudPresupuesto
            })
        })
        .catch((err)=>{console.log(err)});

}

const getSolicitudPresupuesto = async(req, res) => {
    const presupuestos = await SolicitudPresupuesto.find();

    res.status(200).json({
        ok:true,
        data: presupuestos,
    })
}

const getSolicitudPresupuestoID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const presupuesto = await SolicitudPresupuesto.findById(id);
    if(!presupuesto){
        res.status(400).json({
            ok:false,
            message:'El id no corresponde a una solicitud de presupuesto.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:presupuesto,
    })
}

const updateSolicitudPresupuesto = async(req,res) => {
    const id = req.params.id;
    
    const proveedorID = req.body.proveedor;
    const empleadoID = req.body.empleado;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.',
        })
        return
    }

    const updatedPresupuesto = await SolicitudPresupuesto.findByIdAndUpdate(
        id,
        {   
            proveedor: proveedorID,
            empleado:empleadoID 
        },
        { new: true , runValidators: true }
    )

    if(!updatedPresupuesto){
        res.status(400).json({
            ok:false,
            message:'Error al actualizar la solicitud de presupuesto.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:updatedPresupuesto,
        message:'Solicitud de presupuesto actualizado correctamente.',
    })
}

const deleteSolicitudPresupuesto = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.'
        })
        return
    }

    const deletedPresupuesto = await SolicitudPresupuesto.findByIdAndDelete(id);
    if(!deletedPresupuesto){
        res.status(400).json({
            ok:false,
            message: 'Error durante el borrado.'
        })
        return
    }
    const deletedPresupuestoDetalle = await SolicitudPresupuestoDetalle.deleteMany({solicitudPresupuesto:id});
    if(!deletedPresupuestoDetalle){
        res.status(400).json({
            ok:false,
            message: 'Error durante el borrado del detalle.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'Solicitud de presupuesto eliminado correctamente.'
    })
}

module.exports = { setSolicitudPresupuesto , getSolicitudPresupuesto , getSolicitudPresupuestoID , updateSolicitudPresupuesto , deleteSolicitudPresupuesto };
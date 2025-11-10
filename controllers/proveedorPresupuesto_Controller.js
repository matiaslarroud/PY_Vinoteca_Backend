const Presupuesto = require("../models/proveedorPresupuesto_Model");
const PresupuestoDetalle = require("../models/proveedorPresupuestoDetalle_Model");
const getNextSequence = require("./counter_Controller");

const obtenerFechaHoy = () => {
  const hoy = new Date();
  return hoy.toISOString().split("T")[0];
}

const setPresupuesto = async (req,res) => {
    const newId = await getNextSequence("Proveedor_Presupuesto");
    const totalP = req.body.total;
    const fechaP = obtenerFechaHoy();
    const proveedorID = req.body.proveedor;
    const empleadoID = req.body.empleado;
    const medioPagoID = req.body.medioPago;
    const solicitudP = req.body.solicitudPresupuesto;


    if(!totalP || !fechaP || !proveedorID || !medioPagoID || !empleadoID ){
        res.status(400).json({ok:false , message:'Error al cargar los datos.'})
        return
    }
    
    const newPresupuesto = new Presupuesto ({
        _id: newId,
        total: totalP , 
        fecha: fechaP , 
        proveedor: proveedorID ,
        medioPago : medioPagoID,
        empleado: empleadoID ,
        estado:true
    });

    if (solicitudP){
        newPresupuesto.solicitudPresupuesto = solicitudP
    }

    await newPresupuesto.save()
        .then( () => {
            res.status(201).json({
                ok:true, 
                message:'Presupuesto agregado correctamente.',
                data: newPresupuesto
            })
        })
        .catch((err)=>{console.log(err)});

}

const getPresupuesto = async(req, res) => {
    const presupuestos = await Presupuesto.find({estado:true});

    res.status(200).json({
        ok:true,
        data: presupuestos,
    })
}

const getPresupuestoID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const presupuesto = await Presupuesto.findById(id);
    if(!presupuesto){
        res.status(400).json({
            ok:false,
            message:'El id no corresponde a un presupuesto.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:presupuesto,
    })
}

const updatePresupuesto = async(req,res) => {
    const id = req.params.id;
    
    const totalP = req.body.total;
    const fechaP = req.body.fecha;
    const proveedorID = req.body.proveedor;
    const empleadoID = req.body.empleado;
    const medioPagoID = req.body.medioPago;
    const solicitudP = req.body.solicitudPresupuesto;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.',
        })
        return
    }

    const updatedPresupuesto = await Presupuesto.findByIdAndUpdate(
        id,
        {   
            total: totalP , 
            fecha: fechaP , 
            proveedor: proveedorID,
            empleado:empleadoID,
            solicitudPresupuesto:solicitudP,
            medioPago: medioPagoID
        },
        { new: true , runValidators: true }
    )

    if(!updatedPresupuesto){
        res.status(400).json({
            ok:false,
            message:'Error al actualizar el presupuesto.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:updatedPresupuesto,
        message:'Presupuesto actualizado correctamente.',
    })
}

const deletePresupuesto = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.'
        })
        return
    }

    const deletedPresupuesto = await Presupuesto.findByIdAndUpdate(
        id,
        {   
            estado:false
        },
        { new: true , runValidators: true }
    )
;
    if(!deletedPresupuesto){
        res.status(400).json({
            ok:false,
            message: 'Error durante el borrado.'
        })
        return
    }
    const deletedPresupuestoDetalle = await PresupuestoDetalle.updateMany(
        {presupuesto:id},
        {   
            estado:false
        },
        { new: true , runValidators: true }
    )
    
    if(!deletedPresupuestoDetalle){
        res.status(400).json({
            ok:false,
            message: 'Error durante el borrado del detalle.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'Presupuesto eliminado correctamente.'
    })
}

module.exports = { setPresupuesto , getPresupuesto , getPresupuestoID , updatePresupuesto , deletePresupuesto };
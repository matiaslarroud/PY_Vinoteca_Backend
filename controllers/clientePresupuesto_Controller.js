const Presupuesto = require("../models/clientePresupuesto_Model");
const getNextSequence = require("../controllers/counter_Controller");

const obtenerFechaHoy = () => {
  const hoy = new Date();
  return hoy.toISOString().split("T")[0];
}

const setPresupuesto = async (req,res) => {
    const newId = await getNextSequence("Cliente_Presupuesto");
    const totalP = req.body.total;
    const fechaP = obtenerFechaHoy();
    const clienteID = req.body.cliente;
    const empleadoID = req.body.empleado;

    if(!totalP || !fechaP || !clienteID || !empleadoID ){
        res.status(400).json({ok:false , message:'Error al cargar los datos.'})
        return
    }
    const newPresupuesto = new Presupuesto ({
        _id: newId,
        total: totalP , fecha: fechaP , cliente: clienteID,
        empleado:empleadoID 
    });
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
    const presupuestos = await Presupuesto.find();

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
    const clienteID = req.body.cliente;
    const empleadoID = req.body.empleado;

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
            total: totalP , fecha: fechaP , cliente: clienteID,
            empleado:empleadoID 
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

    const deletedPresupuesto = await Presupuesto.findByIdAndDelete(id);
    if(!deletedPresupuesto){
        res.status(400).json({
            ok:false,
            message: 'Error durante el borrado.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'Presupuesto eliminado correctamente.'
    })
}

module.exports = { setPresupuesto , getPresupuesto , getPresupuestoID , updatePresupuesto , deletePresupuesto };
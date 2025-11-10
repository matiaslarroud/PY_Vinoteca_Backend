const OrdenCompra = require("../models/proveedorOrdenCompra_Model");
const OrdenCompraDetalle = require("../models/proveedorOrdenCompraDetalle_Model");
const getNextSequence = require("./counter_Controller");

const obtenerFechaHoy = () => {
  const hoy = new Date();
  return hoy.toISOString().split("T")[0];
}

const setOrdenCompra = async (req,res) => {
    const newId = await getNextSequence("Proveedor_OrdenCompra");
    const total = req.body.total;
    const fecha = obtenerFechaHoy();
    const fechaEntrega = req.body.fechaEntrega;
    const proveedorID = req.body.proveedor;
    const empleadoID = req.body.empleado;
    const medioPagoID = req.body.medioPago;
    const presupuesto = req.body.presupuesto;


    if(!total || !fecha || !proveedorID || !medioPagoID || !empleadoID || !presupuesto || !fechaEntrega ){
        res.status(400).json({ok:false , message:'Error al cargar los datos.'})
        return
    }
    
    const newOrdenCompra = new OrdenCompra ({
        _id: newId,
        total: total , 
        fecha: fecha , 
        fechaEntrega: fechaEntrega , 
        proveedor: proveedorID ,
        medioPago : medioPagoID,
        empleado: empleadoID ,
        presupuesto : presupuesto ,
        estado:true
    });

    await newOrdenCompra.save()
        .then( () => {
            res.status(201).json({
                ok:true, 
                message:'Orden de compra agregada correctamente.',
                data: newOrdenCompra
            })
        })
        .catch((err)=>{console.log(err)});

}

const getOrdenCompra = async(req, res) => {
    const ordenes = await OrdenCompra.find({estado:true});

    res.status(200).json({
        ok:true,
        data: ordenes,
    })
}

const getOrdenCompraID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const ordenCompra = await OrdenCompra.findById(id);
    if(!ordenCompra){
        res.status(400).json({
            ok:false,
            message:'El id no corresponde a una orden de compra.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:ordenCompra,
    })
}

const updateOrdenCompra = async(req,res) => {
    const id = req.params.id;
    
    const total = req.body.total;
    const fecha = req.body.fecha;
    const fechaEntrega = req.body.fechaEntrega;
    const proveedorID = req.body.proveedor;
    const empleadoID = req.body.empleado;
    const medioPagoID = req.body.medioPago;
    const presupuesto = req.body.presupuesto;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.',
        })
        return
    }

    const updatedOrdenCompra = await OrdenCompra.findByIdAndUpdate(
        id,
        {   
            total: total , 
            fecha: fecha , 
            fechaEntrega: fechaEntrega , 
            proveedor: proveedorID ,
            medioPago : medioPagoID,
            empleado: empleadoID ,
            presupuesto : presupuesto ,
        },
        { new: true , runValidators: true }
    )

    if(!updatedOrdenCompra){
        res.status(400).json({
            ok:false,
            message:'Error al actualizar la orden de compra.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:updatedOrdenCompra,
        message:'Orden de compra actualizado correctamente.',
    })
}

const deleteOrdenCompra = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.'
        })
        return
    }

    const deletedOrdenCompra = await OrdenCompra.findByIdAndUpdate(
        id,
        {   
            estado:false
        },
        { new: true , runValidators: true }
    )
;
    if(!deletedOrdenCompra){
        res.status(400).json({
            ok:false,
            message: 'Error durante el borrado.'
        })
        return
    }
    const deletedOrdenCompraDetalle = await OrdenCompraDetalle.updateMany(
        {ordenCompra:id},
        {   
            estado:false
        },
        { new: true , runValidators: true }
    )
    
    if(!deletedOrdenCompraDetalle){
        res.status(400).json({
            ok:false,
            message: 'Error durante el borrado del detalle.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'Orden de compra eliminado correctamente.'
    })
}

module.exports = { setOrdenCompra , getOrdenCompra , getOrdenCompraID , updateOrdenCompra , deleteOrdenCompra };
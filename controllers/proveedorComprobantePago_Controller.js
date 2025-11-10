const ComprobantePago = require("../models/proveedorComprobantePago_Model");
const getNextSequence = require("./counter_Controller");

const obtenerFechaHoy = () => {
  const hoy = new Date();
  return hoy.toISOString().split("T")[0];
}

const setComprobantePago = async (req,res) => {
    const newId = await getNextSequence("Proveedor_ComprobantePago");
    const total = req.body.total;
    const medioPago = req.body.medioPago;
    const fecha = obtenerFechaHoy();
    const comprobanteCompra = req.body.comprobanteCompra;


    if( !total || !fecha || !medioPago || !comprobanteCompra ){
        res.status(400).json({ok:false , message:'Error al cargar los datos.'})
        return
    }
    
    const newComprobantePago = new ComprobantePago ({
        _id: newId,
        total: total , 
        fecha: fecha , 
        comprobanteCompra : comprobanteCompra ,
        medioPago : medioPago ,
        estado:true
    });

    await newComprobantePago.save()
        .then( () => {
            res.status(201).json({
                ok:true, 
                message:'Comprobante de pago agregado correctamente.',
                data: newComprobantePago
            })
        })
        .catch((err)=>{console.log(err)});

}

const getComprobantePago = async(req, res) => {
    const comprobantes = await ComprobantePago.find({estado:true});

    res.status(200).json({
        ok:true,
        data: comprobantes,
    })
}

const getComprobantePagoID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const comprobantePago = await ComprobantePago.findById(id);
    if(!comprobantePago){
        res.status(400).json({
            ok:false,
            message:'El id no corresponde a un comprobante de pago.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:comprobantePago,
    })
}

const updateComprobantePago = async(req,res) => {
    const id = req.params.id;
    
    const total = req.body.total;
    const fecha = req.body.fecha;
    const medioPago = req.body.medioPago;
    const comprobanteCompra = req.body.comprobanteCompra;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.',
        })
        return
    }

    const updatedComprobantePago = await ComprobantePago.findByIdAndUpdate(
        id,
        {   
            total: total , 
            fecha: fecha , 
            comprobanteCompra : comprobanteCompra ,
            medioPago : medioPago ,
        },
        { new: true , runValidators: true }
    )

    if(!updatedComprobantePago){
        res.status(400).json({
            ok:false,
            message:'Error al actualizar la comprobante de pago.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:updatedComprobantePago,
        message:'Comprobante de pago actualizado correctamente.',
    })
}

const deleteComprobantePago = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.'
        })
        return
    }

    const deletedComprobantePago = await ComprobantePago.findByIdAndUpdate(
        id,
        {   
            estado:false
        },
        { new: true , runValidators: true }
    )
;
    if(!deletedComprobantePago){
        res.status(400).json({
            ok:false,
            message: 'Error durante el borrado.'
        })
        return
    }
    
    res.status(200).json({
        ok:true,
        message:'Comprobante de pago eliminado correctamente.'
    })
}

module.exports = { setComprobantePago , getComprobantePago , getComprobantePagoID , updateComprobantePago , deleteComprobantePago };
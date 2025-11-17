const OrdenCompraDetalle = require("../models/proveedorOrdenCompraDetalle_Model");
const getNextSequence = require("./counter_Controller");

const setOrdenCompraDetalle = async (req,res) => {
    const newId = await getNextSequence("Proveedor_OrdenCompraDetalle");
    const ordenCompra = req.body.ordenCompra;
    const producto = req.body.producto;
    const cantidad = req.body.cantidad;
    const importe = req.body.importe;
    const precio = req.body.precio;


    if(!ordenCompra || !producto || !cantidad || !importe || !precio ){
        res.status(400).json({ok:false , message:'Error al cargar los datos.'})
        return
    }
    
    const newOrdenCompraDetalle = new OrdenCompraDetalle ({
        _id: newId,
        ordenCompra: ordenCompra , 
        producto: producto , 
        cantidad: cantidad , 
        importe: importe ,
        precio : precio,
        estado:true
    });

    await newOrdenCompraDetalle.save()
        .then( () => {
            res.status(201).json({
                ok:true, 
                message:'Orden de compra agregada correctamente.',
                data: newOrdenCompraDetalle
            })
        })
        .catch((err)=>{console.log(err)});

}

const getOrdenCompraDetalle = async(req, res) => {
    const ordenes = await OrdenCompraDetalle.find({estado:true});

    res.status(200).json({
        ok:true,
        data: ordenes,
    })
}

const getOrdenCompraDetalleID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const ordenCompraDetalle = await OrdenCompraDetalle.findById(id);
    if(!ordenCompraDetalle){
        res.status(400).json({
            ok:false,
            message:'El id no corresponde a un detalle de  orden de compra.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:ordenCompraDetalle,
    })
}

const getOrdenCompraDetalleByOrdenCompra = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const ordenCompraDetalle = await OrdenCompraDetalle.find({ordenCompra:id , estado:true});
    if(!ordenCompraDetalle){
        res.status(400).json({
            ok:false,
            message:'El id no corresponde al detalle de una orden de compra.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:ordenCompraDetalle,
    })
}

const updateOrdenCompraDetalle = async(req,res) => {
    const id = req.params.id;
    
    const ordenCompra = req.body.ordenCompra;
    const producto = req.body.producto;
    const cantidad = req.body.cantidad;
    const importe = req.body.importe;
    const precio = req.body.precio;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.',
        })
        return
    }

    const updatedOrdenCompraDetalle = await OrdenCompraDetalle.findByIdAndUpdate(
        id,
        {   
            ordenCompra: ordenCompra , 
            producto: producto , 
            cantidad: cantidad , 
            importe: importe ,
            precio : precio,
        },
        { new: true , runValidators: true }
    )

    if(!updatedOrdenCompraDetalle){
        res.status(400).json({
            ok:false,
            message:'Error al actualizar detalle de la orden de compra.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:updatedOrdenCompraDetalle,
        message:'Orden de compra actualizado correctamente.',
    })
}

const deleteOrdenCompraDetalle = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.'
        })
        return
    }

    const deletedOrdenCompraDetalle = await OrdenCompraDetalle.findByIdAndUpdate(
        id,
        {   
            estado:false
        },
        { new: true , runValidators: true }
    )
;
    if(!deletedOrdenCompraDetalle){
        res.status(400).json({
            ok:false,
            message: 'Error durante el borrado.'
        })
        return
    }
    const deletedByOrdenCompra = await OrdenCompraDetalle.updateMany(
        {ordenCompra:id},
        {   
            estado:false
        },
        { new: true , runValidators: true }
    )
    
    if(!deletedByOrdenCompra){
        res.status(400).json({
            ok:false,
            message: 'Error durante el borrado del detalle.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'Orden de compra detalle eliminado correctamente.'
    })
}

module.exports = { setOrdenCompraDetalle ,getOrdenCompraDetalleByOrdenCompra  , getOrdenCompraDetalle , getOrdenCompraDetalleID , updateOrdenCompraDetalle , deleteOrdenCompraDetalle };
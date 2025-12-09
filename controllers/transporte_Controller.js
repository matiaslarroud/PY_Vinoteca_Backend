const Transporte = require('../models/transporte_Model')
const getNextSequence = require("../controllers/counter_Controller");

const setTransporte =  async (req , res ) => {
    const razonSocial = req.body.name;
    const telefonoTransporte = req.body.telefono;
    const emailTransporte = req.body.email;
    const cuitTransporte = req.body.cuit;
    const paisTransporte = req.body.pais;
    const provinciaTransporte = req.body.provincia;
    const localidadTransporte = req.body.localidad;
    const barrioTransporte = req.body.barrio;
    const calleTransporte = req.body.calle;
    const condicionIvaTransporte = req.body.condicionIva;
    
    if (!razonSocial || !telefonoTransporte || !emailTransporte || !cuitTransporte || !paisTransporte || 
        !provinciaTransporte || !localidadTransporte || !barrioTransporte || !calleTransporte || !condicionIvaTransporte   ) {
        res.status(400).json({ok:false , message:"❌ Faltan completar algunos campos obligatorios."});
        return
    }
    const newId = await getNextSequence("Transporte");
    const newTransporte = new Transporte({
        _id: newId,
        estado:true,
        name: razonSocial,
        telefono: telefonoTransporte,
        email: emailTransporte, 
        cuit: cuitTransporte,
        pais: paisTransporte,  
        provincia: provinciaTransporte,
        localidad: localidadTransporte,
        barrio: barrioTransporte,
        calle: calleTransporte,
        condicionIva: condicionIvaTransporte
    });
    
    await newTransporte.save()
        .then(() => { 
            res.status(201).json({
                ok:true ,
                data: newTransporte,
                message:'✔️ Transporte agregado correctamente.'
            })
        })
        .catch((err) => {
            res.status(400).json({
                ok:false,
                message:`❌  Error al agregar transporte. ERROR:\n${err}`
            })
        })
}

const getTransporte = async(req,res) => {
    const transportes = await Transporte.find({estado:true}).lean();

    res.status(200).json({
        ok:true,
        data:transportes,
    })
}

const getTransporteID = async(req,res) => {
    const id = req.params.id;
    if(!id) {
        res.status(400).json({ok:false, message:"❌ El id no llego al controlador correctamente."})
        return
    }
    
    const transporte = await Transporte.findById(id);
    if (!Transporte) {
        res.status(400).json({ok:false, message:"❌ El id no corresponde a un transporte."});
        return
    }
    res.status(200).json({
        ok:true,
        message:"✔️ Transporte obtenido con exito.",
        data: transporte
    })
}
const updateTransporte =  async (req , res ) => {
    const id = req.params.id;
    
    const razonSocial = req.body.name;
    const telefonoTransporte = req.body.telefono;  
    const emailTransporte = req.body.email;
    const cuitTransporte = req.body.cuit;
    const paisTransporte = req.body.pais;
    const provinciaTransporte = req.body.provincia;
    const localidadTransporte = req.body.localidad;
    const barrioTransporte = req.body.barrio;
    const calleTransporte = req.body.calle;
    const condicionIvaTransporte = req.body.condicionIva;
    
    if (!razonSocial || !telefonoTransporte || !emailTransporte || !cuitTransporte || !paisTransporte || 
        !provinciaTransporte || !localidadTransporte || !barrioTransporte || !calleTransporte || !condicionIvaTransporte) {
        res.status(400).json({ok:false , message:"❌ Faltan completar algunos campos obligatorios."});
        return
    }
    
    const updatedTransporte = await Transporte.findByIdAndUpdate(
            id, 
            {
                name: razonSocial,
                telefono: telefonoTransporte,
                email: emailTransporte,
                cuit: cuitTransporte,
                pais: paisTransporte,
                provincia: provinciaTransporte,
                localidad: localidadTransporte,
                barrio: barrioTransporte,
                calle: calleTransporte,
                condicionIva: condicionIvaTransporte
            },
            { new: true , runValidators: true }
        )
        
    if(!updatedTransporte) {
        res.status(400).json({
            ok:false,
            message:"❌ Error al actualizar transporte."
        });
        return
    }
    res.status(200).json({
        ok:true , 
        data: updatedTransporte,
        message:"✔️ Transporte actualizado correctamente."
    })    
}


//Validaciones de eliminacion
const RemitoCliente = require("../models/clienteRemito_Model");
const RemitoProveedor = require("../models/proveedorRemito_Model");

const deleteTransporte = async (req , res) => {
    const transporteID = req.params.id;

    if(!transporteID){
        res.status(400).json({
            ok:false,
            message:"❌ Error al eliminar transporte."
        })
        return
    }

    const clienteRemito = await RemitoCliente.find({transporteID:transporteID , estado:true}).lean();
    const proveedorRemito = await RemitoProveedor.find({transporte:transporteID , estado:true}).lean();
    
    if(clienteRemito.length !== 0 || proveedorRemito.length !== 0){
        res.status(400).json({
            ok:false,
            message:"❌ Error al eliminar. Existen tablas relacionadas a este transporte."
        })
        return
    }
    const deletedTransporte = await Transporte.findByIdAndUpdate(
        transporteID, 
        {
            estado: false
        },
        { new: true , runValidators: true }
    )
    if(!deletedTransporte) {
        res.status(400).json({ok:false,message:"❌ Error al eliminar transporte."});
        return
    }
    res.status(200).json({ok:true , message:"✔️ Transporte eliminado correctamente."});
}

module.exports = {setTransporte , getTransporte , getTransporteID , updateTransporte , deleteTransporte};
const Transporte = require('../models/transporte_Model')

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
        res.status(400).json({ok:false , message:'No se puede cargar el transporte sin todos los datos.'});
        return
    }

    const newTransporte = new Transporte({
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
                message:'Transporte agregado correctamente.'
            })
        })
        .catch((error) => { console.log(error) }) 
    
}

const getTransporte = async(req,res) => {
    const transportes = await Transporte.find();

    res.status(200).json({
        ok:true,
        data:transportes,
    })
}

const getTransporteID = async(req,res) => {
    const id = req.params.id;
    if(!id) {
        res.status(400).json({ok:false, message:"El id no llego al controlador correctamente."})
        return
    }
    
    const transporte = await Transporte.findById(id);
    if (!Transporte) {
        res.status(400).json({ok:false, message:"El id no corresponde a un transporte."});
        return
    }
    res.status(200).json({
        ok:true,
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
        res.status(400).json({ok:false , message:'No se puede actualizar el transporte sin todos los datos.'});
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
            message:"Error al actualizar transporte."
        });
        return
    }
    res.status(200).json({
        ok:true , 
        data: updatedTransporte,
        message:"Transporte actualizado correctamente."
    })    
}

const deleteTransporte = async (req , res) => {
    const id = req.params.id;
    const deletedTransporte = await Transporte.findByIdAndDelete(id)
    if(!deletedTransporte) {
        res.status(400).json({ok:false,message:"Error al eliminar transporte."});
        return
    }
    res.status(200).json({ok:true , message:"Transporte eliminado correctamente."});
}

module.exports = {setTransporte , getTransporte , getTransporteID , updateTransporte , deleteTransporte};
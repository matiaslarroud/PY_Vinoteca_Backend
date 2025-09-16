const Paraje = require('../models/bodega-paraje_Model');
const getNextSequence = require("../controllers/counter_Controller");

const setParaje = async (req , res ) => {
    const newId = await getNextSequence("Bodega_Paraje");
    const nombreParaje = req.body.name; 
    const bodegaParaje = req.body.bodega;   
    const paisParaje = req.body.pais;
    const provinciaParaje = req.body.provincia;
    const localidadParaje = req.body.localidad;
    const barrioParaje = req.body.barrio;
    const calleParaje = req.body.calle;
    const alturaParaje = req.body.altura;
    
    if (!nombreParaje || !bodegaParaje || !paisParaje || !provinciaParaje || !localidadParaje || !barrioParaje || !calleParaje) {
        res.status(400).json({ok:false , message:'No se puede cargar la Paraje sin la carga de todos los datos.'});
        return
    }

    const newParaje = new Paraje({
        _id: newId,
        name: nombreParaje , 
        bodega: bodegaParaje,
        pais: paisParaje ,  
        provincia: provinciaParaje ,  
        localidad: localidadParaje ,  
        barrio: barrioParaje ,  
        calle: calleParaje,
        altura: alturaParaje
    });
    
    if(!newParaje){
        res.status(400).json({
            ok:false,
            message:"Error al agregar paraje."
        })
        return
    }

    await newParaje.save()
        .then(() => { 
            res.status(201).json(
                {
                    ok:true,
                    message:"Paraje agregado correctamente."
                })
        })
        .catch((error) => { console.log(error) }) 
    
}

const getParaje = async(req,res) => {
    const parajes = await Paraje.find();

    if(!parajes){
        res.status(400).json({
            ok:false,
            message:"Error al obtener parajes."
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:"Parajes obtenidos correctamente.",
        data:parajes
    })
}

const getParajeID = async(req,res) => {
    const parajeID = req.params.id;
    
    if(!parajeID){
        res.status(400).json({
            ok:false,
            message:"Error al obtener paraje."
        })
        return
    }
    const parajeEncontrado = await Paraje.findById(parajeID);
    
    if(!parajeEncontrado){
        res.status(400).json({
            ok:false,
            message:"Error al obtener paraje."
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:"Paraje encontrado correctamente.",
        data: parajeEncontrado
    })
}

const updateParaje = async(req,res) => {
    const parajeID = req.params.id;
    
    if(!parajeID){
        res.status(400).json({
            ok:false,
            message:"Error al obtener paraje."
        })
        return
    }
    const nameP = req.body.name;
    const bodegaP = req.body.bodega;
    const paisP = req.body.pais;
    const provinciaP = req.body.provincia;
    const localidadP = req.body.localidad;
    const barrioP = req.body.barrio;
    const calleP = req.body.calle;
    const alturaP = req.body.altura;

    if(!nameP  || !bodegaP || !paisP || !provinciaP || !localidadP || !barrioP || !calleP){
        res.status(400).json({
            ok:false,
            message:"Error al actualizar paraje."
        })
        return
    }
    const updatedParaje = await Paraje.findByIdAndUpdate(
        parajeID,
        {
            name: nameP,
            bodega: bodegaP,
            pais:paisP,
            provincia:provinciaP,
            localidad:localidadP,
            barrio:barrioP,
            calle:calleP,
            altura: alturaP
        },
        { new: true , runValidators: true }
    )

    
    if(!updatedParaje){
        res.status(400).json({
            ok:false,
            message:"Error al actualizar paraje."
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:"Paraje actualizado correctamente."
    })
}

const deleteParaje = async(req,res) => {
    const parajeID=req.params.id;
    if(!parajeID){
        res.status(400).json({
            ok:false,
            message:"Error al obtener paraje."
        })
        return
    }
    const deletedParaje = await Paraje.findByIdAndDelete(parajeID);
    if(!deletedParaje){
        res.status(400).json({
            ok:false,
            message:"Error al eliminar paraje."
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:"Paraje eliminado correctamente."
    })
}

module.exports = {setParaje , getParaje , getParajeID , updateParaje , deleteParaje};
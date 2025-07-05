const Bodega = require('../models/bodega_Model.js');

const setBodega = async (req , res ) => {
    const nombreBodega = req.body.name;    
    const paisBodega = req.body.pais;
    const provinciaBodega = req.body.provincia;
    const localidadBodega = req.body.localidad;
    const barrioBodega = req.body.barrio;
    const calleBodega = req.body.calle;
    
    if (!nombreBodega || !paisBodega || !provinciaBodega || !localidadBodega || !barrioBodega || !calleBodega) {
        res.status(400).json({ok:false , message:'No se puede cargar la bodega sin la carga de todos los datos.'});
        return
    }

    const newBodega = new Bodega({
        name: nombreBodega , 
        pais: paisBodega ,  
        provincia: provinciaBodega ,  
        localidad: localidadBodega ,  
        barrio: barrioBodega ,  
        calle: calleBodega
    });

    await newBodega.save()
        .then(() => { 
            console.log("BODEGA CREADA EXITOSAMENTE");
            res.status(201).json({ok:true});
        })
        .catch((error) => { console.log(error) }) 
    
}

const getBodega = () => {

}

const getBodegaID = () => {

}

const updateBodega = () => {

}

const deleteBodega = () => {

}

module.exports = {setBodega , getBodega , getBodegaID , updateBodega , deleteBodega};
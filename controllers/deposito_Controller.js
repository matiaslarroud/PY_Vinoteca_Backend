const Deposito = require("../models/deposito_Model");

const setDeposito = async(req,res) => {
    const nombreD = req.body.name;
    const paisD = req.body.pais;
    const provinciaD = req.body.provincia;
    const localidadD = req.body.localidad;
    const barrioD = req.body.barrio;
    const calleD = req.body.calle;
    const alturaD = req.body.altura;
    const deptoLetraD = req.body.deptoLetra;
    const deptoNumeroD = req.body.deptoNumero;

    if(!nombreD || !paisD || !provinciaD || !localidadD || !barrioD || !calleD || !alturaD){
        res.status(400).json({
            ok:false,
            message:"No se puede cargar un deposito sin sus datos"
        })
        return
    }

    const newDeposito = new Deposito(
        {
            name: nombreD , 
            pais: paisD ,
            provincia: provinciaD , 
            localidad: localidadD , 
            barrio: barrioD , 
            calle: calleD , 
            altura: alturaD , 
            deptoNumero: deptoNumeroD , 
            deptoLetra: deptoLetraD , 
        })

    await newDeposito.save()
        .then(() => {
            res.status(201).json({
                ok:true,
                message:"Deposito cargada correctamente."
            })
        })
        .catch((err) => {
            console.log(err);
        })
}

const getDeposito = async(req,res) => {
    const depositos = await Deposito.find();
    
    res.status(200).json({
        ok:true,
        data: depositos,
        message:"Depositos encontrados correctamente."
    })
}

const getDepositoID = async(req,res) => {
    const id = req.params.id ;

    if(!id){
        res.status(400).json({
            ok:false,
            message:"El id no llego al controlador correctamente"
        })
        return
    }

    const deposito = await Deposito.findById(id);

    if(!deposito){
        res.status(400).json({
            ok:false,
            message:"El id no corresponde a un deposito."
        })
        return
    }

    res.status(200).json({
        ok:true,
        data: deposito,
        message:"Deposito encontrado correctamente."
    })
}

const updateDeposito = async(req,res) => {
    const id = req.params.id;
    const nombreD = req.body.name;
    const paisD = req.body.pais;
    const provinciaD = req.body.provincia;
    const localidadD = req.body.localidad;
    const barrioD = req.body.barrio;
    const calleD = req.body.calle;
    const alturaD = req.body.altura;
    const deptoLetraD = req.body.deptoLetra;
    const deptoNumeroD = req.body.deptoNumero;

    if(!id){
        res.status(400).json({
            ok:false,
            message:"El id no llego al controlador correctamente."
        })
        return
    }

    if(!nombreD || !paisD || !provinciaD || !localidadD || !barrioD || !calleD || !alturaD){
        res.status(400).json({
            ok:false,
            message:"Error al actualizar deposito."
        })
        return
    }

    const updatedDeposito = await Deposito.findByIdAndUpdate(
        id,
        {
            name: nombreD , 
            pais: paisD ,
            provincia: provinciaD , 
            localidad: localidadD , 
            barrio: barrioD , 
            calle: calleD , 
            altura: alturaD , 
            deptoNumero: deptoNumeroD , 
            deptoLetra: deptoLetraD , 
        },
        { new: true , runValidators: true }
    )

    if(!updateDeposito){
        res.status(400).json({
            ok:false,
            message:'Error al actualizar la deposito.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        message: "Deposito actualizado correctamente."
    })
}

const deleteDeposito = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:"El id no llego al controlador correctamente."
        })
        return
    }
    const deletedDeposito = await Deposito.findByIdAndDelete(id);
    
    if(!deletedDeposito){
        res.status(400).json({
            ok:false,
            message:"Error al eliminar deposito."
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:"Deposito eliminado correctamente."
    })
}

module.exports = {setDeposito,getDeposito,getDepositoID,updateDeposito,deleteDeposito};
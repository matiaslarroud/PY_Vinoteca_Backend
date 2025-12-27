const Caja = require("../models/caja_Model.js");
const getNextSequence = require("./counter_Controller.js");

const obtenerFechaHoy = () => {
  const hoy = new Date();
  return hoy.toISOString().split("T")[0];
}

const setCaja = async(req,res) => {
    const fecha = obtenerFechaHoy();
    const total = req.body.total;
    const tipo = req.body.tipo;
    const persona = req.body.persona;
    const referencia = req.body.referencia;
    const medioPago = req.body.medioPago;
    if( tipo === null ||!total || !referencia || !medioPago){
        res.status(400).json({
            ok:false,
            message:"❌ Faltan completar algunos campos obligatorios."
        })
        return
    }
    const newId = await getNextSequence("Caja");
    const newCaja = await new Caja({
        _id: newId,
        fecha:fecha,
        tipo: tipo,
        total:total , 
        persona:persona , 
        referencia:referencia , 
        medioPago:medioPago , 
        estado:true
    });

    if(!newCaja){
        res.status(400).json({
            ok:false,
            message:"❌ Error al agregar movimiento de caja."
        })
        return
    }
    await newCaja.save()
        .then(()=>{
            res.status(201).json({
                ok:true,
                message:"✔️ Movimiento agregado correctamente."
            })
        })
        .catch((err) => {
            res.status(400).json({
                ok:false,
                message:`❌  Error al agregar movimiento. ERROR:\n${err}`
            })
        }) 
}

const getCaja = async(req,res) => {
    const movimientos = await Caja.find({estado:true}).lean();
    res.status(200).json({
        ok:true,
        data:movimientos
    })
}

const getCajaID = async(req,res) => {
    const cajaID = req.params.id;
    if(!cajaID){
        res.status(400).json({
            ok:false,
            message:"❌ Error al buscar movimiento solicitado."
        })
        return
    }
    const movimientoEncontrado = await Caja.findById(cajaID);
    if(!movimientoEncontrado){
        res.status(400).json({
            ok:false,
            message:"❌ Error al buscar movimiento solicitado."
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:movimientoEncontrado,
        message:"✔️ Movimiento obtenido correctamente."
    })
}

const updateCaja = async(req,res) => {

    const total = req.body.total;
    const tipo = req.body.tipo;
    const persona = req.body.persona;
    const referencia = req.body.referencia;
    const medioPago = req.body.medioPago;

    const cajaID = req.params.id;
    if(!cajaID){
        res.status(400).json({
            ok:false,
            message:"❌ Error al validar id del movimiento de caja."
        })
        return
    }

    if(!total || !referencia || !medioPago || tipo === null){
        res.status(400).json({
            ok:false,
            message: "❌ Faltan completar algunos campos obligatorios."
        })
        return
    }

    const updatedCaja = await Caja.findByIdAndUpdate(
        cajaID,
        {
            total:total,
            tipo:tipo,
            persona:persona,
            referencia:referencia,
            medioPago: medioPago
        },
        { new: true , runValidators: true }
    )
    if(!updatedCaja){
        res.status(400).json({
            ok:false,
            message:"❌ Error al actualizar movimiento."
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:"✔️ Movimiento actualizado correctamente."
    })
}

const deleteCaja = async(req,res) => {
    const movimientoID = req.params.id;
    if(!movimientoID){
        res.status(400).json({
            ok:false,
            message:"❌ Error validar ID del movimiento a eliminar."
        })
        return
    }

    const deletedCaja = await Caja.findByIdAndUpdate(
        movimientoID,
        {estado:false},
        { new: true , runValidators: true }
    )
    if(!deletedCaja){
        res.status(400).json({
            ok:false,
            message:"❌ Error eliminar movimiento."
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:"✔️ Movimiento eliminado correctamente."
    })
}

module.exports = {setCaja,getCaja,getCajaID,updateCaja,deleteCaja};
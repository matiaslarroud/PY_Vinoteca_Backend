const Presupuesto = require("../models/clientePresupuesto_Model");
const PresupuestoDetalle = require("../models/clientePresupuestoDetalle_Model");
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
        empleado:empleadoID , estado:true
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
    const presupuestos = await Presupuesto.find({estado:true});

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

    const deletedPresupuesto = await Presupuesto.findByIdAndUpdate(
        id,
        {   
            estado:false
        },
        { new: true , runValidators: true }
    )

    if(!deletedPresupuesto){
        res.status(400).json({
            ok:false,
            message: 'Error durante el borrado.'
        })
        return
    }
    const deletedPresupuestoDetalle = await PresupuestoDetalle.updateMany(
        {presupuesto:id},
        {   
            estado:false
        },
        { new: true , runValidators: true }
    )
    if(!deletedPresupuestoDetalle){
        res.status(400).json({
            ok:false,
            message: 'Error durante el borrado del detalle.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'Presupuesto eliminado correctamente.'
    })
}

const buscarPresupuesto = async (req, res) => {
    const { presupuestoID , cliente, empleado, total, detalles } = req.body;
    // 1️⃣ Obtenemos todos los productos que vienen en los detalles
    const productosBuscados = detalles && detalles.length > 0
      ? detalles.map(d => d.producto)
      : [];

    // 2️⃣ Buscamos los PresupuestoDetalle que contengan alguno de esos productos
    let detallesFiltrados = [];
    if (productosBuscados.length > 0) {
      detallesFiltrados = await PresupuestoDetalle.find({
        producto: { $in: productosBuscados },
      });
    } if (productosBuscados.length > 0 && detallesFiltrados.length === 0) {
        res.status(500).json({ ok: false, message: "Error al buscar presupuestos" });       
    } else if (!detalles) {
      detallesFiltrados = await PresupuestoDetalle.find();
    }

    // 3️⃣ Obtenemos los IDs únicos de los presupuestos asociados
    const presupuestosIDs = [...new Set(detallesFiltrados.map(d => String(d.presupuesto)))];

    // 4️⃣ Buscamos los presupuestos relacionados
    let presupuestos = await Presupuesto.find(
      presupuestosIDs.length > 0 ? { _id: { $in: presupuestosIDs } } : {}
    );

    // 5️⃣ Filtramos adicionalmente por cliente, empleado o total si existen
    const presupuestosFiltrados = presupuestos.filter(p => {
      const coincidePresupuesto = presupuestoID ? (p._id) === Number(presupuestoID) : true;
      const coincideCliente = cliente ? String(p.cliente) === String(cliente) : true;
      const coincideEmpleado = empleado ? String(p.empleado) === String(empleado) : true;
      const coincideTotal = total ? Number(p.total) === Number(total) : true;
      return coincideCliente && coincideEmpleado && coincideTotal && coincidePresupuesto;
    });

    if(presupuestosFiltrados.length > 0){
        res.status(200).json({ ok: true, data: presupuestosFiltrados });
    } else {
        res.status(500).json({ ok: false, message: "Error al buscar presupuestos" });
    }
};

module.exports = { setPresupuesto , getPresupuesto , getPresupuestoID , updatePresupuesto , deletePresupuesto , buscarPresupuesto };
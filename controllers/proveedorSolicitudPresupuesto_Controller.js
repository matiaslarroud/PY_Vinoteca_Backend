const SolicitudPresupuesto = require("../models/proveedorSolicitudPresupuesto_Model");
const SolicitudPresupuestoDetalle = require("../models/proveedorSolicitudPresupuestoDetalle_Model");
const getNextSequence = require("./counter_Controller");

const obtenerFechaHoy = () => {
  const hoy = new Date();
  return hoy.toISOString().split("T")[0];
}

const setSolicitudPresupuesto = async (req,res) => {
    const newId = await getNextSequence("Proveedor_SolicitudPresupuesto");
    const fechaP = obtenerFechaHoy();
    const provedorP = req.body.proveedor;
    const empleadoID = req.body.empleado;

    if( !fechaP || !provedorP || !empleadoID ){
        res.status(400).json({ok:false , message:'Error al cargar los datos.'})
        return
    }
    const newSolicitudPresupuesto = new SolicitudPresupuesto ({
        _id: newId,
        fecha: fechaP , proveedor: provedorP, empleado:empleadoID  , estado:true
    });
    await newSolicitudPresupuesto.save()
        .then( () => {
            res.status(201).json({
                ok:true, 
                message:'Solicitud de presupuesto agregado correctamente.',
                data: newSolicitudPresupuesto
            })
        })
        .catch((err)=>{console.log(err)});

}

const getSolicitudPresupuesto = async(req, res) => {
    const presupuestos = await SolicitudPresupuesto.find({estado:true});

    res.status(200).json({
        ok:true,
        data: presupuestos,
    })
}

const getSolicitudPresupuestoID = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const presupuesto = await SolicitudPresupuesto.findById(id);
    if(!presupuesto){
        res.status(400).json({
            ok:false,
            message:'El id no corresponde a una solicitud de presupuesto.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:presupuesto,
    })
}

const getSolicitudPresupuestoByProveedor = async(req,res) => {
    const id = req.params.id;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente',
        })
        return
    }

    const presupuestos = await SolicitudPresupuesto.find({proveedor:id});
    if(!presupuestos){
        res.status(400).json({
            ok:false,
            message:'El id no corresponde a un proveedor que tenga solicitudes de presupuestos.'
        })
        return
    }

    res.status(200).json({
        ok:true,
        data:presupuestos,
    })
}

const updateSolicitudPresupuesto = async(req,res) => {
    const id = req.params.id;
    
    const proveedorID = req.body.proveedor;
    const empleadoID = req.body.empleado;

    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.',
        })
        return
    }

    const updatedPresupuesto = await SolicitudPresupuesto.findByIdAndUpdate(
        id,
        {   
            proveedor: proveedorID,
            empleado:empleadoID 
        },
        { new: true , runValidators: true }
    )

    if(!updatedPresupuesto){
        res.status(400).json({
            ok:false,
            message:'Error al actualizar la solicitud de presupuesto.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:updatedPresupuesto,
        message:'Solicitud de presupuesto actualizado correctamente.',
    })
}

const deleteSolicitudPresupuesto = async(req,res) => {
    const id = req.params.id;
    if(!id){
        res.status(400).json({
            ok:false,
            message:'El id no llego al controlador correctamente.'
        })
        return
    }

    const deletedPresupuesto = await SolicitudPresupuesto.findByIdAndUpdate(
        id,
        {   
            estado: false
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
    const deletedPresupuestoDetalle = await SolicitudPresupuestoDetalle.updateMany(
        { solicitudPresupuesto: id }, 
        { estado: false }, 
        { new: true, runValidators: true }
    );
    if(!deletedPresupuestoDetalle){
        res.status(400).json({
            ok:false,
            message: 'Error durante el borrado del detalle.'
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:'Solicitud de presupuesto eliminado correctamente.'
    })
}

const buscarSolicitudPresupuesto = async (req, res) => {
    const { solicitudID , proveedor, empleado, detalles } = req.body;
    // 1️⃣ Obtenemos todos los productos que vienen en los detalles
    const productosBuscados = detalles && detalles.length > 0
      ? detalles.map(d => d.producto)
      : [];

    // 2️⃣ Buscamos los PresupuestoDetalle que contengan alguno de esos productos
    let detallesFiltrados = [];
    if (productosBuscados.length > 0) {
      detallesFiltrados = await SolicitudPresupuestoDetalle.find({
        producto: { $in: productosBuscados },
      });
    } if (productosBuscados.length > 0 && detallesFiltrados.length === 0) {
        res.status(500).json({ ok: false, message: "Error al buscar presupuestos" });       
    } else if (!detalles) {
      detallesFiltrados = await SolicitudPresupuestoDetalle.find();
    }

    // 3️⃣ Obtenemos los IDs únicos de los presupuestos asociados
    const presupuestosIDs = [...new Set(detallesFiltrados.map(d => d.solicitudPresupuesto))];

    // 4️⃣ Buscamos los presupuestos relacionados
    let presupuestos = await SolicitudPresupuesto.find(
      presupuestosIDs.length > 0 ? { _id: { $in: presupuestosIDs } } : {}
    );

    // 5️⃣ Filtramos adicionalmente por cliente, empleado o total si existen
    const presupuestosFiltrados = presupuestos.filter(p => {
      const coincideEstado = p.estado === true;
      const coincidePresupuestoSolicitud = solicitudID ? (p._id) === Number(solicitudID) : true;
      const coincideProveedor = proveedor ? String(p.proveedor) === String(proveedor) : true;
      const coincideEmpleado = empleado ? String(p.empleado) === String(empleado) : true;
      return coincideProveedor && coincideEmpleado && coincidePresupuestoSolicitud && coincideEstado;
    });

    if(presupuestosFiltrados.length > 0){
        res.status(200).json({ ok: true, data: presupuestosFiltrados });
    } else {
        res.status(500).json({ ok: false, message: "Error al buscar solicitudes de presupuesto." });
    }
};

module.exports = { setSolicitudPresupuesto , buscarSolicitudPresupuesto , getSolicitudPresupuesto , getSolicitudPresupuestoID , getSolicitudPresupuestoByProveedor , updateSolicitudPresupuesto , deleteSolicitudPresupuesto };
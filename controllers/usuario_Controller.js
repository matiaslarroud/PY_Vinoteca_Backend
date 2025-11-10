const Usuario = require("../models/usuario_Model.js");
const getNextSequence = require("./counter_Controller.js");


const setUsuario = async(req,res) => {
    const newId = await getNextSequence("Usuario");
    const nameU = req.body.name;
    const passwordU = req.body.password;
    const rolU = req.body.rol;
    if(!nameU || !passwordU || !rolU){
        res.status(400).json({
            ok:false,
            message:"No puede agregarse un usuario sin todos los datos."
        })
        return
    }
    console.log(newId + ' ------------ ' + nameU)
    const newUsuario = await new Usuario({
        _id: newId,
        name:nameU,
        password:passwordU , 
        rol:rolU , 
        estado:true});

    if(!newUsuario){
        res.status(400).json({
            ok:false,
            message:"Error al agregar nuevo usuario."
        })
        return
    }
    await newUsuario.save()
        .then(()=>{
            res.status(201).json({
                ok:true,
                message:"Usuario agregado correctamente."
            })
        })
        .catch((err)=>{
            res.status(400).json({
                ok:false,
                message:"Error al agregar Usuario."
            })
            console.log(err)
            return
        })    
}

const getUsuario = async(req,res) => {
    const usuarios = await Usuario.find({estado:true});
    if(!usuarios){
        res.status(400).json({
            ok:false,
            message:"Error al obtener usuarios."
        })
        return
    }
    res.status(200).json({
        ok:true,
        data: usuarios,
        message:"Usuarios encontrados correctamente."
    })
}

const getUsuarioID = async(req,res) => {
    const usuarioID = req.params.id;
    if(!usuarioID){
        res.status(400).json({
            ok:false,
            message:"Error al buscar usuario solicitado."
        })
        return
    }
    const usuarioEncontrado = await Usuario.findById(usuarioID);
    if(!usuarioEncontrado){
        res.status(400).json({
            ok:false,
            message:"Error al buscar usuario solicitado."
        })
        return
    }
    res.status(200).json({
        ok:true,
        data:usuarioEncontrado,
        message:"Usuario encontrado correctamente."
    })
}

const updateUsuario = async(req,res) => {
    const usuarioID = req.params.id;
    const nameU = req.body.name;
    const passwordU = req.body.password;
    const rolU = req.body.rol;

    if(!usuarioID || !nameU || !passwordU || !rolU){
        res.status(400).json({
            ok:false,
            message:"Error al actualizar usuario."
        })
        return
    }

    const updatedUsuario = await Usuario.findByIdAndUpdate(
        usuarioID,
        {name:nameU , password:passwordU , rol:rolU},
        { new: true , runValidators: true }
    )
    if(!updatedUsuario){
        res.status(400).json({
            ok:false,
            message:"Error al actualizar usuario."
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:"Usuario actualizado correctamente."
    })
}

const deleteUsuario = async(req,res) => {
    const usuarioID = req.params.id;
    if(!usuarioID){
        res.status(400).json({
            ok:false,
            message:"Error validar ID del usuario a eliminar."
        })
        return
    }
    const deletedUsuario = await Usuario.findByIdAndUpdate(
        usuarioID,
        {estado:false},
        { new: true , runValidators: true }
    )
    
    if(!deletedUsuario){
        res.status(400).json({
            ok:false,
            message:"Error eliminar usuario."
        })
        return
    }
    res.status(200).json({
        ok:true,
        message:"Usuario eliminado correctamente."
    })
}

const Login = async (req, res) => {
  const { usuario, password } = req.body;

  const user = await Usuario.findOne({ name:usuario });

  if (!user || user.password !== password) {

    return res.json({ ok: false, msg: "Credenciales inválidas" });
  }

  res.json({
    ok: true,
    usuario: { usuario: user.name, rol: user.rol },
  });
}

module.exports = {setUsuario,getUsuario,getUsuarioID,updateUsuario,deleteUsuario , Login };
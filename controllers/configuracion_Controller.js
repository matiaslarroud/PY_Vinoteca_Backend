const Configuracion = require("../models/configuracion_Model");
const cloudinary = require("../config/cloudinary.js");
const {
    MODULOS, obtenerConfiguracion, invalidarConfiguracion, configuracionPublica,
} = require("../utils/configuracion");

const CAMPOS_EMPRESA = [
    'razonSocial', 'nombreFantasia', 'cuit', 'condicionIva', 'inicioActividades',
    'pais', 'provincia', 'localidad', 'barrio', 'calle', 'altura', 'telefono', 'email',
];
const CAMPOS_MARCA = ['colorPrimario', 'whatsapp'];
const COLOR_HEX = /^#[0-9a-fA-F]{6}$/;

// Arma el $set solo con los campos conocidos: el resto del body se ignora.
const armarCambios = (body) => {
    const cambios = {};
    const errores = [];

    CAMPOS_EMPRESA.forEach((campo) => {
        const valor = body.empresa?.[campo];
        if (valor !== undefined) cambios[`empresa.${campo}`] = String(valor).trim();
    });

    CAMPOS_MARCA.forEach((campo) => {
        const valor = body.marca?.[campo];
        if (valor !== undefined) cambios[`marca.${campo}`] = String(valor).trim();
    });
    if (cambios['marca.colorPrimario'] !== undefined && !COLOR_HEX.test(cambios['marca.colorPrimario'])) {
        errores.push('el color debe tener el formato #RRGGBB');
    }

    if (body.fiscal?.alicuotaIva !== undefined) {
        const alicuota = Number(body.fiscal.alicuotaIva);
        if (!Number.isFinite(alicuota) || alicuota < 0 || alicuota > 1) {
            errores.push('la alícuota de IVA debe estar entre 0 y 1 (ej: 0.21)');
        } else {
            cambios['fiscal.alicuotaIva'] = alicuota;
        }
    }

    MODULOS.forEach((modulo) => {
        const valor = body.modulos?.[modulo];
        if (valor !== undefined) {
            if (typeof valor !== 'boolean') errores.push(`el módulo ${modulo} debe ser true o false`);
            else cambios[`modulos.${modulo}`] = valor;
        }
    });

    return { cambios, errores };
};

const guardar = async (cambios) => {
    await Configuracion.updateOne({ _id: 1 }, { $set: cambios }, { upsert: true, runValidators: true });
    invalidarConfiguracion();
    return obtenerConfiguracion();
};

// GET público: lo que necesitan el login y el menú antes de iniciar sesión.
const getConfiguracionPublica = async (req, res) => {
    const config = await obtenerConfiguracion();
    res.status(200).json({ ok: true, data: configuracionPublica(config) });
};

// GET completo: solo administrador.
const getConfiguracion = async (req, res) => {
    const config = await obtenerConfiguracion();
    res.status(200).json({ ok: true, data: config });
};

const updateConfiguracion = async (req, res) => {
    const { cambios, errores } = armarCambios(req.body || {});
    if (errores.length) {
        return res.status(400).json({ ok: false, message: `❌ Revise los datos: ${errores.join('; ')}.` });
    }
    if (!Object.keys(cambios).length) {
        return res.status(400).json({ ok: false, message: '❌ No se enviaron cambios.' });
    }
    const config = await guardar(cambios);
    res.status(200).json({ ok: true, message: '✔️ Configuración actualizada.', data: config });
};

// POST logo: sube la imagen a Cloudinary y reemplaza la anterior.
const setLogo = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ ok: false, message: '❌ No se envió la imagen del logo.' });
    }
    const anterior = (await obtenerConfiguracion()).marca.logoPublicId;

    const subida = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { folder: 'logos' },
            (err, result) => (err ? reject(err) : resolve(result))
        ).end(req.file.buffer);
    });

    const config = await guardar({ 'marca.logoUrl': subida.secure_url, 'marca.logoPublicId': subida.public_id });
    if (anterior) cloudinary.uploader.destroy(anterior).catch(() => {});
    res.status(200).json({ ok: true, message: '✔️ Logo actualizado.', data: config });
};

module.exports = { getConfiguracionPublica, getConfiguracion, updateConfiguracion, setLogo };

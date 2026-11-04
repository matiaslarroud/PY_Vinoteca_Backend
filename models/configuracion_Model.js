const mongoose = require("mongoose");

// Configuración del negocio: un único documento (_id 1) por base de datos.
// Todo lo que cambia de un cliente a otro (datos fiscales, marca, módulos) vive acá y no en el código.
const Configuracion_Schema = mongoose.Schema({
    _id: { type: Number, default: 1 },
    empresa: {
        razonSocial: { type: String, default: '' },
        nombreFantasia: { type: String, default: '' },
        cuit: { type: String, default: '' },
        condicionIva: { type: String, default: '' },
        inicioActividades: { type: String, default: '' },
        pais: { type: String, default: '' },
        provincia: { type: String, default: '' },
        localidad: { type: String, default: '' },
        barrio: { type: String, default: '' },
        calle: { type: String, default: '' },
        altura: { type: String, default: '' },
        telefono: { type: String, default: '' },
        email: { type: String, default: '' },
    },
    marca: {
        logoUrl: { type: String, default: '' },
        logoPublicId: { type: String, default: '' },
        colorPrimario: { type: String, default: '#7b1e2b' },
        whatsapp: { type: String, default: '' },
    },
    fiscal: {
        alicuotaIva: { type: Number, default: 0.21, min: 0, max: 1 },
    },
    // Módulos opcionales. Un módulo apagado oculta sus pantallas y su API responde 404.
    modulos: {
        vinos: { type: Boolean, default: true },
        picadas: { type: Boolean, default: true },
        produccion: { type: Boolean, default: true },
        ofertas: { type: Boolean, default: true },
        tienda: { type: Boolean, default: true },
    },
},
    {
        timestamps: true
    }
)

const Configuracion = mongoose.model("Configuracion", Configuracion_Schema, "Configuracion");

module.exports = Configuracion;

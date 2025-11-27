// src/NotaPedidoCliente_imprimir.js
const PDFDocument = require("pdfkit");
const ComprobantePago = require("../models/proveedorComprobantePago_Model");

const obtenerFechaHoy = () => {
  const hoy = new Date();
  return hoy.toISOString().split("T")[0];
};

const imprimir = async (req, res) => {
  try {
    const { id } = req.params;

    // Traer el Comprobante de compra con proveedor, empleado y medio de pago
    const comprobante = await ComprobantePago.findById(id)
    .populate({
        path: "comprobanteCompra",
        populate: [
          { 
            path: "ordenCompra", 
            populate: [{
              path:"proveedor",
              populate: [
                {path:"pais"},
                {path:"provincia"},
                {path:"localidad"},
                {path:"barrio"},
                {path:"calle"},
                {path:"condicionIva"},
              ]
            }]
          }
        ]
      })
    .populate("medioPago")

    if (!comprobante) {
      return res.status(404).json({ ok: false, msg: "Comprobante de pago no encontrado" });
    }

    // Configurar headers de respuesta
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=ComprobantePago_${id}.pdf`);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    // ---------------- Título ----------------
    doc.font("Helvetica-Bold")
      .fontSize(20)
      .text("Comprobante de Pago Proveedor", 50, 50, { align: "center" });

    // Texto a la derecha: fecha y código
    const fechaComprobante = new Date(comprobante.fecha).toLocaleDateString();
    const codigoComprobante = comprobante._id?.toString().slice(-6) || "N/A";

    doc.font("Helvetica")
      .fontSize(10)
      .text(`Fecha: ${fechaComprobante}\nN° Comprobante: ${codigoComprobante}`, 490, 55, {
        align: "left",
        width: 150
      });

    // Pequeño espacio antes del encabezado de empresa
    doc.moveDown(1);

    // ---------------- Encabezado con logo y datos de la empresa ----------------
    const path = require('path');
    const logoPath = path.resolve(__dirname, '../public/logo.jpg');
    const empresa = {
    razonSocial: "Entusiasmo por el Vino",
    inicioActividades: "23/03/2023",
    cuit: "30-12345678-9",
    pais: "Argentina",
    provincia: "Buenos Aires",
    localidad: "La Plata",
    barrio: "La Plata",
    calle: "Calle Falsa",
    altura: "123",
    telefono: "2392-556644",
    email: "vino@gmail.com"
    };

    // Posición inicial del encabezado
    const headerY = 100;
    const headerX = 150;
    const rowHeight = 10;

    // Logo a la izquierda
    doc.image(logoPath, 50, headerY-20, { width: 80 });

    // Tabla de datos a la derecha del logo
    let currentY = headerY;

    const datosEmpresa = [
      ["Razón Social:", empresa.razonSocial],
      ["País:", empresa.pais],
      ["Provincia:", empresa.provincia],
      ["Localidad:", empresa.localidad],
      ["Barrio:", empresa.barrio],
      ["Calle:", empresa.calle],
      ["Altura:", empresa.altura],
      ["Teléfono:", empresa.telefono],
      ["CUIT:", empresa.cuit],
      ["Email:", empresa.email],
      ["Inicio Act.:", empresa.inicioActividades]
    ];

    const col1X = headerX;
    const col2X = headerX + 220; // segunda columna

    const mitad = Math.ceil(datosEmpresa.length / 2);

    datosEmpresa.forEach(([label, value], index) => {
      const isFirstCol = index < mitad;
      const x = isFirstCol ? col1X : col2X;
      const y = isFirstCol
        ? currentY + index * rowHeight
        : currentY + (index - mitad) * rowHeight;

      doc.font("Helvetica-Bold").fontSize(9).text(label, x, y);
      doc.font("Helvetica").fontSize(9).text(value, x + 70, y, { width: 120 });
    });

    // Línea separadora a lo ancho de la página
    const headerEndY =
      currentY + Math.ceil(datosEmpresa.length / 2) * rowHeight; // altura final del bloque

      doc.moveTo(50, headerEndY + 2)   // desde el margen izquierdo
        .lineTo(550, headerEndY + 2)
        .lineWidth(1)   // hasta el margen derecho
        .stroke();
    
    // ---------------- Cuerpo ----------------

// ---------------- Datos del NotaPedido, cliente y empleado ----------------

    // Proveedor
    const cDatosProveedor = [
      ["Código:", comprobante.comprobanteCompra?.ordenCompra?.proveedor?._id || "N/A"],
      ["Nombre:", comprobante.comprobanteCompra?.ordenCompra?.proveedor?.name || "N/A"],
      ["CUIT:", comprobante.comprobanteCompra?.ordenCompra?.proveedor?.cuit || "N/A"],
      ["Email:", comprobante.comprobanteCompra?.ordenCompra?.proveedor?.email || "N/A"],
      ["Teléfono:", comprobante.comprobanteCompra?.ordenCompra?.proveedor?.telefono || "N/A"],
      ["País:", comprobante.comprobanteCompra?.ordenCompra?.proveedor?.pais?.name || "N/A"],
      ["Provincia:", comprobante.comprobanteCompra?.ordenCompra?.proveedor?.provincia?.name || "N/A"],
      ["Localidad:", comprobante.comprobanteCompra?.ordenCompra?.proveedor?.localidad?.name || "N/A"],
      ["Barrio:", comprobante.comprobanteCompra?.ordenCompra?.proveedor?.barrio?.name || "N/A"],
      ["Calle:", comprobante.comprobanteCompra?.ordenCompra?.proveedor?.calle?.name || "N/A"],
      ["Altura:", comprobante.comprobanteCompra?.ordenCompra?.proveedor?.altura || "N/A"],
      ["Cond. IVA:", comprobante.comprobanteCompra?.ordenCompra?.proveedor?.condicionIva?.name || "N/A"],
    ];

    // Medio de Pago
    const cDatosMedioPago = [
      ["Código:", comprobante.medioPago?._id || "N/A"],
      ["Nombre:", comprobante.medioPago?.name || "N/A"],
    ];

    // Definir posiciones de columnas
    const cCol1X = 50;     // Cliente col 1
    const cCol2X = 200;    // Cliente col 2
    const cCol3X = 380;    // Empleado
    let cCurrentY = headerEndY + 25; // más ajustado, sin espacio de más
    const cRowHeight = 10;

    // Título centrado para proveedor
    doc.font("Helvetica-Bold")
      .fontSize(12)
      .text("Proveedor", cCol1X, cCurrentY - 12, { width: 350, align: "center" });

    // Título centrado para Medio de Pago
    doc.font("Helvetica-Bold")
      .fontSize(12)
      .text("Medio de Pago", cCol3X, cCurrentY - 12, { width: 120, align: "center" });

    // Proveedor → repartimos mitad de datos en col1 y mitad en col2
    cDatosProveedor.forEach(([label, value], index) => {
      const mitad = Math.ceil(cDatosProveedor.length / 2);
      const x = index < mitad ? cCol1X : cCol2X;
      const y = index < mitad
        ? cCurrentY + index * cRowHeight
        : cCurrentY + (index - mitad) * cRowHeight;

      doc.font("Helvetica-Bold").fontSize(9).text(label, x, y);
      doc.font("Helvetica").fontSize(9).text(value, x + 50, y);
    });

    // Medio de Pago → todos en col3
    cDatosMedioPago.forEach(([label, value], index) => {
      const y = cCurrentY + index * cRowHeight;
      doc.font("Helvetica-Bold").fontSize(9).text(label, cCol3X, y);
      doc.font("Helvetica").fontSize(9).text(value, cCol3X + 50, y);
    });

    // Línea vertical separadora Cliente ↔ Medio de Pago
    const cTotalFilas = Math.max(
      Math.ceil(cDatosProveedor.length / 2),
      cDatosMedioPago.length
    );
    const cSepX = 360;
    const cSepYInicio = cCurrentY - 5;
    const cSepYFin = cCurrentY + cTotalFilas * cRowHeight + 5;

    doc.moveTo(cSepX, cSepYInicio)
      .lineTo(cSepX, cSepYFin)
      .lineWidth(1)
      .strokeColor("black")
      .stroke();

    // Línea horizontal debajo
    doc.moveTo(50, cSepYFin + 5)
      .lineTo(550, cSepYFin + 5)
      .stroke();

      // Pequeño espacio antes del medio de pago
      doc.moveDown(1);

    // ---------------- Medio de Pago ----------------
    const totalComprobante = comprobante.total || "N/A";
    doc.font("Helvetica-Bold").fontSize(18)
      .text(`TOTAL:  $ ${totalComprobante}`, 50, cSepYFin + 15, { width: 550, align: "center" });
    // doc.font("Helvetica").fontSize(15)
    //   .text(totalRecibo, 125, cSepYFin + 15 , { width: 300, align: "center" });

    // Línea horizontal debajo
    doc.moveTo(50, cSepYFin + 35)
      .lineTo(550, cSepYFin + 35)
      .stroke();

    // Finalizar PDF
    doc.end();

  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, msg: "No se pudo generar el PDF" });
  }
};

module.exports = { imprimir };

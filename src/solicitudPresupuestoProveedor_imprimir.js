// src/presupuestoCliente_imprimir.js
const PDFDocument = require("pdfkit");
const SolicitudPresupuesto = require("../models/proveedorSolicitudPresupuesto_Model");
const SolicitudPresupuestoDetalle = require("../models/proveedorSolicitudPresupuestoDetalle_Model");


const imprimir = async (req, res) => {
  try {
    const { id } = req.params;

    // Traer el presupuesto con cliente, empleado
    const solicitudPresupuesto = await SolicitudPresupuesto.findById(id)
    .populate({
      path: "proveedor",
      populate: [
        { path: "pais" },
        { path: "provincia" },
        { path: "localidad" },
        { path: "barrio" },
        { path: "calle" },
        { path: "condicionIva" }
      ]
    })
    .populate("empleado")

    if (!solicitudPresupuesto) {
      return res.status(404).json({ ok: false, msg: "Solicitud de presupuesto no encontrada" });
    }

    // Traer los detalles con productos
    const detalles = await SolicitudPresupuestoDetalle.find({ solicitudPresupuesto: id , estado:true})
      .populate("producto");
    solicitudPresupuesto.detalles = detalles;

    // Configurar headers de respuesta
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=presupuesto_${id}.pdf`);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    // ---------------- Título ----------------
    doc.font("Helvetica-Bold")
      .fontSize(20)
      .text("Solicitud de Presupuesto Proveedor", 50, 50, { align: "center" });

    // Texto a la derecha: fecha y código
    const fechaPresupuesto = new Date(solicitudPresupuesto.fecha).toLocaleDateString();
    const codigoSolicitudPresupuesto = solicitudPresupuesto._id?.toString().slice(-6) || "N/A"; // ejemplo: últimos 6 dígitos del ID

    doc.font("Helvetica")
      .fontSize(10)
      .text(`Fecha: ${fechaPresupuesto}\nN° Solicitud: ${codigoSolicitudPresupuesto}`, 490, 55, {
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

// ---------------- Datos del presupuesto, cliente y empleado ----------------

    // Cliente
    const cDatosProveedor = [
      ["Código:", solicitudPresupuesto.proveedor?._id || "N/A"],
      ["Nombre:", solicitudPresupuesto.proveedor?.name || "N/A"],
      ["CUIT:", solicitudPresupuesto.proveedor?.cuit || "N/A"],
      ["Email:", solicitudPresupuesto.proveedor?.email || "N/A"],
      ["Teléfono:", solicitudPresupuesto.proveedor?.telefono || "N/A"],
      ["País:", solicitudPresupuesto.proveedor?.pais?.name || "N/A"],
      ["Provincia:", solicitudPresupuesto.proveedor?.provincia?.name || "N/A"],
      ["Localidad:", solicitudPresupuesto.proveedor?.localidad?.name || "N/A"],
      ["Barrio:", solicitudPresupuesto.proveedor?.barrio?.name || "N/A"],
      ["Calle:", solicitudPresupuesto.proveedor?.calle?.name || "N/A"],
      ["Altura:", solicitudPresupuesto.proveedor?.altura || "N/A"],
      ["Cond. IVA:", solicitudPresupuesto.proveedor?.condicionIva?.name || "N/A"],
    ];

    // Empleado
    const cDatosEmpleado = [
      ["Código:", solicitudPresupuesto.empleado?._id || "N/A"],
      ["Nombre:", solicitudPresupuesto.empleado?.name || "N/A"],
      ["Apellido:", solicitudPresupuesto.empleado?.lastname || "N/A"],
      ["CUIT:", solicitudPresupuesto.empleado?.cuit || "N/A"],
    ];

    // Definir posiciones de columnas
    const cCol1X = 50;     // Cliente col 1
    const cCol2X = 200;    // Cliente col 2
    const cCol3X = 380;    // Empleado
    let cCurrentY = headerEndY + 25; // más ajustado, sin espacio de más
    const cRowHeight = 10;

    // Título centrado para Cliente
    doc.font("Helvetica-Bold")
      .fontSize(12)
      .text("Proveedor", cCol1X, cCurrentY - 12, { width: 350, align: "center" });

    // Título centrado para Empleado
    doc.font("Helvetica-Bold")
      .fontSize(12)
      .text("Empleado", cCol3X, cCurrentY - 12, { width: 120, align: "center" });

    // Cliente → repartimos mitad de datos en col1 y mitad en col2
    cDatosProveedor.forEach(([label, value], index) => {
      const mitad = Math.ceil(cDatosProveedor.length / 2);
      const x = index < mitad ? cCol1X : cCol2X;
      const y = index < mitad
        ? cCurrentY + index * cRowHeight
        : cCurrentY + (index - mitad) * cRowHeight;

      doc.font("Helvetica-Bold").fontSize(9).text(label, x, y);
      doc.font("Helvetica").fontSize(9).text(value, x + 50, y);
    });

    // Empleado → todos en col3
    cDatosEmpleado.forEach(([label, value], index) => {
      const y = cCurrentY + index * cRowHeight;
      doc.font("Helvetica-Bold").fontSize(9).text(label, cCol3X, y);
      doc.font("Helvetica").fontSize(9).text(value, cCol3X + 50, y);
    });

    // Línea vertical separadora Cliente ↔ Empleado
    const cTotalFilas = Math.max(
      Math.ceil(cDatosProveedor.length / 2),
      cDatosEmpleado.length
    );
    const cSepX = 360;
    const cSepYInicio = cCurrentY - 5;
    const cSepYFin = cCurrentY + cTotalFilas * cRowHeight + 5;

    doc.moveTo(cSepX, cSepYInicio)
      .lineTo(cSepX, cSepYFin)
      .lineWidth(1)
      .strokeColor("black")
      .stroke();

    // doc.lineWidth(0.5).strokeColor("black"); // reset

    // Línea horizontal debajo
    doc.moveTo(50, cSepYFin + 5)
      .lineTo(550, cSepYFin + 5)
      .stroke();


    // ---------------- Detalle de productos ----------------

    doc.moveDown(4);

    // Encabezado de columnas
doc.font("Helvetica-Bold").fontSize(9);
const startX = 30;
const colWidths = { num: 80 , tipo: 100, name: 250, qty: 80};
let rowY = doc.y + 10;

doc.text("#", startX, rowY, { width: colWidths.num, align: "center" });
doc.text("Tipo", startX + colWidths.num , rowY, { width: colWidths.tipo, align: "center" });
doc.text("Producto", startX + colWidths.num+ colWidths.tipo, rowY, { width: colWidths.name, align: "center" });
doc.text("Cantidad", startX + colWidths.num+ colWidths.tipo+ colWidths.name, rowY, { width: colWidths.qty, align: "center" });

doc.moveDown(0.5);

// Detalle de productos
doc.font("Helvetica").fontSize(9);
solicitudPresupuesto.detalles.forEach((det, i) => {
  const rowY = doc.y;
  const codigo = det.producto?._id || "N/A";
  const tipo = det.producto?.tipoProducto || "N/A";
  const nombreProducto = det.producto?.name || "Producto";
  const cantidad = det.cantidad || 0;

  doc.text(`${codigo}`, startX, rowY, { width: colWidths.num, align: "center" });
  if(tipo ==='ProductoPicada'){
    doc.text(`Picada`, startX + colWidths.num , rowY, { width: colWidths.tipo, align: "center" });
  }
  if(tipo ==='ProductoVino'){
    doc.text(`Vino`, startX + colWidths.num , rowY, { width: colWidths.tipo, align: "center" });
  }
  if(tipo ==='ProductoInsumo'){
    doc.text(`Insumo`, startX + colWidths.num , rowY, { width: colWidths.tipo, align: "center" });
  }
  doc.text(nombreProducto, startX + colWidths.num + colWidths.tipo, rowY, { width: colWidths.name, align: "center" });
  doc.text(cantidad, startX + colWidths.num + colWidths.tipo + colWidths.name, rowY, { width: colWidths.qty, align: "center" });

  doc.moveDown(0.5);
});

  
    // Finalizar PDF
    doc.end();

  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, msg: "No se pudo generar el PDF" });
  }
};

module.exports = { imprimir };

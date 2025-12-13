// src/RemitoCliente_imprimir.js
const PDFDocument = require("pdfkit");
const Remito = require("../models/clienteRemito_Model");
const RemitoDetalle = require("../models/clienteRemitoDetalle_Model");


const imprimir = async (req, res) => {
  try {
    const { id } = req.params;

    // Traer el Remito con cliente, empleado y medio de pago
    const remito = await Remito.findById(req.params.id)
      .populate({
        path: "comprobanteVentaID",
        populate: {
          path: "notaPedido",
          populate: [
            { 
              path: "cliente" ,
              populate: [
                { path: "pais" },
                { path: "provincia" },
                { path: "localidad" },
                { path: "barrio" },
                { path: "calle" },
                { path: "condicionIva" }
              ]
            }
          ]
        }
      })
      .populate({path: "transporteID"})

    const comprobante = remito.comprobanteVentaID;
    const pedido = comprobante?.notaPedido;
    const cliente = pedido?.cliente;
    const transporte = remito.transporteID;

    if (!remito) {
      return res.status(404).json({ ok: false, msg: "Remito no encontrado" });
    }

    // Traer los detalles con productos
    const detalles = await RemitoDetalle.find({ remitoID: id , estado:true})
      .populate("producto");
    remito.detalles = detalles;

    // Configurar headers de respuesta
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=Remito_${id}.pdf`);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    // ---------------- Título ----------------
    doc.font("Helvetica-Bold")
      .fontSize(20)
      .text("Remito Cliente", 50, 50, { align: "center" });

    // Texto a la derecha: fecha y código
    const fechaRemito = new Date(remito.fecha).toLocaleDateString();
    const codigoRemito = remito._id?.toString().slice(-6) || "N/A";

    doc.font("Helvetica")
      .fontSize(10)
      .text(`Fecha: ${fechaRemito}\nN° Remito: ${codigoRemito}\nN° Comp.: ${comprobante?._id}`, 490, 55, {
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

// ---------------- Datos del Remito, cliente y empleado ----------------

    // Cliente
    const cDatosCliente = [
      ["Código:", cliente?._id || "N/A"],
      ["Nombre:", cliente?.name || "N/A"],
      ["Apellido:", cliente?.lastname || "N/A"],
      ["CUIT:", cliente?.cuit || "N/A"],
      ["Email:", cliente?.email || "N/A"],
      ["Teléfono:", cliente?.telefono || "N/A"],
      ["País:", cliente?.pais?.name || "N/A"],
      ["Provincia:", cliente?.provincia?.name || "N/A"],
      ["Localidad:", cliente?.localidad?.name || "N/A"],
      ["Barrio:", cliente?.barrio?.name || "N/A"],
      ["Calle:", cliente?.calle?.name || cliente?.calle || "N/A"], // depende si es ref o string
      ["Altura:", cliente?.altura || "N/A"],
      ["Cond. IVA:", cliente?.condicionIva?.name || "N/A"],
    ];

    // Transporte
    const cDatosTransporte = [
      ["Código:", transporte?._id || "N/A"],
      ["Nombre:", transporte?.name || "N/A"],
      ["CUIT:", transporte?.cuit || "N/A"],
      ["Telefono:", transporte?.telefono || "N/A"],
      ["Email:", transporte?.email || "N/A"],
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
      .text("Cliente", cCol1X, cCurrentY - 12, { width: 350, align: "center" });

    // Título centrado para Empleado
    doc.font("Helvetica-Bold")
      .fontSize(12)
      .text("Transporte", cCol3X, cCurrentY - 12, { width: 120, align: "center" });

    // Cliente → repartimos mitad de datos en col1 y mitad en col2
    cDatosCliente.forEach(([label, value], index) => {
      const mitad = Math.ceil(cDatosCliente.length / 2);
      const x = index < mitad ? cCol1X : cCol2X;
      const y = index < mitad
        ? cCurrentY + index * cRowHeight
        : cCurrentY + (index - mitad) * cRowHeight;

      doc.font("Helvetica-Bold").fontSize(9).text(label, x, y);
      doc.font("Helvetica").fontSize(9).text(value, x + 50, y);
    });

    // Empleado → todos en col3
    cDatosTransporte.forEach(([label, value], index) => {
      const y = cCurrentY + index * cRowHeight;
      doc.font("Helvetica-Bold").fontSize(9).text(label, cCol3X, y);
      doc.font("Helvetica").fontSize(9).text(value, cCol3X + 50, y);
    });

    // Línea vertical separadora Cliente ↔ Empleado
    const cTotalFilas = Math.max(
      Math.ceil(cDatosCliente.length / 2),
      cDatosTransporte.length
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


    // ---------------- Detalle de productos ----------------

    doc.moveDown(4);

    // Encabezado de columnas
doc.font("Helvetica-Bold").fontSize(9);
const startX = 50;
const colWidths = { num: 30 , tipo: 50, name: 300, qty: 100};
let rowY = doc.y + 10;

doc.text("#", startX, rowY, { width: colWidths.num, align: "center" });
doc.text("Tipo", startX+ 50 , rowY, { width: colWidths.tipo, align: "center" });
doc.text("Producto", startX + colWidths.num+ colWidths.tipo, rowY, { width: colWidths.name, align: "center" });
doc.text("Cantidad", startX + colWidths.num+ colWidths.tipo + colWidths.name, rowY, { width: colWidths.qty, align: "center" });

doc.moveDown(0.5);

// Detalle de productos
doc.font("Helvetica").fontSize(9);
remito.detalles.forEach((det, i) => {
  const rowY = doc.y;
  const codigo = det.producto?._id || "N/A";
  const tipo = det.producto?.tipoProducto || "N/A";
  const nombreProducto = det.producto?.name || "Producto";
  const cantidad = det.cantidad || 0;

  doc.text(`${codigo}`, startX, rowY, { width: colWidths.num, align: "center" });
    if(tipo ==='ProductoPicada'){
      doc.text(`Picada`, startX + 50, rowY, { width: colWidths.tipo, align: "center" });
    }
    if(tipo ==='ProductoVino'){
      doc.text(`Vino`, startX + 50, rowY, { width: colWidths.tipo, align: "center" });
    }
    if(tipo ==='ProductoInsumo'){
      doc.text(`Insumo`, startX + 50, rowY, { width: colWidths.tipo, align: "center" });
    }
  doc.text(nombreProducto, startX + colWidths.num+ colWidths.tipo, rowY, { width: colWidths.name, align: "center" });
  doc.text(cantidad, startX + colWidths.num+ colWidths.tipo+ colWidths.name, rowY, { width: colWidths.qty, align: "center" });

  doc.moveDown(0.5);
});


    // ---------------- Total ----------------
    // Definir posición fija para el total (ej: 700px desde arriba)
    const totalY = 700;

    // Línea separadora encima del total
    doc.moveTo(50, totalY - 50)  // desde el margen izquierdo
      .lineTo(550, totalY - 50) // hasta el margen derecho
      .stroke();

    // Texto del total
    doc.font("Helvetica-Bold")
      .fontSize(14)
      .text(`Total bultos: ${remito.totalBultos}`, 50, totalY-35, { align: "right" });

    // Línea separadora encima del total
    doc.moveTo(50, totalY - 5)  // desde el margen izquierdo
      .lineTo(550, totalY - 5) // hasta el margen derecho
      .stroke();

    // Texto del total
    doc.font("Helvetica-Bold")
      .fontSize(14)
      .text(`Valor total: $${remito.totalPrecio}`, 50, totalY, { align: "right" });


    // Finalizar PDF
    doc.end();

  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, msg: "No se pudo generar el PDF" });
  }
};

module.exports = { imprimir };

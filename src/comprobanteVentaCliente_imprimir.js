// src/ComprobanteVentaCliente_imprimir.js
const PDFDocument = require("pdfkit");
const ComprobanteVenta = require("../models/clienteComprobanteVenta_Model");
const ComprobanteVentaDetalle = require("../models/clienteComprobanteVentaDetalle_Model");

const obtenerFechaHoy = () => {
  const hoy = new Date();
  return hoy.toISOString().split("T")[0];
};

const imprimir = async (req, res) => {
  try {
    const { id } = req.params;

    // Traer el ComprobanteVenta con cliente, empleado y medio de pago
    const comprobanteVenta = await ComprobanteVenta.findById(id)
      .populate({
        path: "notaPedido",
        populate: [
          { 
            path: "cliente", 
            populate: [
              { path: "pais" },
              { path: "provincia" },
              { path: "localidad" },
              { path: "barrio" },
              { path: "calle" },
              { path: "condicionIva" }
            ]
          },
          { path: "medioPago" },
          { path: "empleado" },
        ]
      })
      .populate("tipoComprobante");

    if (!comprobanteVenta) {
      return res.status(404).json({ ok: false, msg: "ComprobanteVenta no encontrado" });
    }

    // Traer los detalles con productos
    const detalles = await ComprobanteVentaDetalle.find({ comprobanteVenta: id })
      .populate("producto");
    comprobanteVenta.detalles = detalles;

    // Configurar headers de respuesta
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=ComprobanteVenta_${id}.pdf`);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    // Copias a imprimir
    const copias = ["ORIGINAL", "DUPLICADO", "TRIPLICADO"];

    copias.forEach((copia, index) => {
      if (index > 0) doc.addPage(); // Nueva página desde la 2da copia

      // ---------------- Título ----------------
      doc.font("Helvetica-Bold")
        .fontSize(20)
        .text("Comprobante de Venta Cliente", 50, 50, { align: "center" });

      // ---------------- Tipo de Comprobante (A o B en cuadrado) + Copia ----------------
      const tipo = comprobanteVenta.tipoComprobante?.name || "X"; // Default A si no existe
      const squareX = 250;
      const squareY = 80;
      const squareSize = 20;

      // Dibujar cuadrado
      doc.rect(squareX+1, squareY-1, squareSize, squareSize).stroke();

      // Letra dentro del cuadrado
      doc.font("Helvetica-Bold")
        .fontSize(10)
        .text(tipo, squareX + 8, squareY + 5);

      // Texto de la copia a la derecha del cuadrado
      doc.font("Helvetica")
        .fontSize(10)
        .text(copia, squareX + squareSize + 20, squareY + 5);

      // ---------------- Fecha y Código ----------------
      const fechaComprobanteVenta = new Date(comprobanteVenta.fecha).toLocaleDateString();
      const codigoComprobanteVenta = comprobanteVenta._id?.toString().slice(-6) || "N/A"; 
      const pedido = comprobanteVenta.notaPedido;

      doc.font("Helvetica")
        .fontSize(10)
        .text(`Fecha: ${fechaComprobanteVenta}\nN° Comp. Venta: ${codigoComprobanteVenta}\nN° Pedido: ${pedido?._id}`, 490, 55, {
          align: "left",
          width: 150
        });

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

      const headerY = 110;
      const headerX = 150;
      const rowHeight = 10;

      doc.image(logoPath, 50, headerY-30, { width: 80 });

      let currentY = headerY;

      const datosEmpresa = [
        ["Razón Social:", empresa.razonSocial],
        ["País:", empresa.pais],
        ["Provincia:", empresa.provincia],
        ["Localidad:", empresa.localidad],
        ["Calle:", empresa.calle],
        ["Altura:", empresa.altura],
        ["Teléfono:", empresa.telefono],
        ["CUIT:", empresa.cuit],
        ["Email:", empresa.email],
        ["Inicio Act.:", empresa.inicioActividades]
      ];

      const col1X = headerX;
      const col2X = headerX + 220; 
      const mitad = Math.ceil(datosEmpresa.length / 2);

      datosEmpresa.forEach(([label, value], i) => {
        const isFirstCol = i < mitad;
        const x = isFirstCol ? col1X : col2X;
        const y = isFirstCol ? currentY + i * rowHeight : currentY + (i - mitad) * rowHeight;

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

// ---------------- Datos del ComprobanteVenta, cliente y empleado ----------------

    // Cliente
    const cDatosCliente = [
      ["Código:", comprobanteVenta.notaPedido?.cliente?._id || "N/A"],
      ["Nombre:", comprobanteVenta.notaPedido?.cliente?.name || "N/A"],
      ["Apellido:", comprobanteVenta.notaPedido?.cliente?.lastname || "N/A"],
      ["CUIT:", comprobanteVenta.notaPedido?.cliente?.cuit || "N/A"],
      ["Email:", comprobanteVenta.notaPedido?.cliente?.email || "N/A"],
      ["Teléfono:", comprobanteVenta.notaPedido?.cliente?.telefono || "N/A"],
      ["País:", comprobanteVenta.notaPedido?.cliente?.pais?.name || "N/A"],
      ["Provincia:", comprobanteVenta.notaPedido?.cliente?.provincia?.name || "N/A"],
      ["Localidad:", comprobanteVenta.notaPedido?.cliente?.localidad?.name || "N/A"],
      ["Barrio:", comprobanteVenta.notaPedido?.cliente?.barrio?.name || "N/A"],
      ["Calle:", comprobanteVenta.notaPedido?.cliente?.calle?.name || "N/A"],
      ["Altura:", comprobanteVenta.notaPedido?.cliente?.altura || "N/A"],
      ["Cond. IVA:", comprobanteVenta.notaPedido?.cliente?.condicionIva?.name || "N/A"],
    ];

    // Empleado
    const cDatosEmpleado = [
      ["Código:", comprobanteVenta.notaPedido?.empleado?._id || "N/A"],
      ["Nombre:", comprobanteVenta.notaPedido?.empleado?.name || "N/A"],
      ["Apellido:", comprobanteVenta.notaPedido?.empleado?.lastname || "N/A"],
      ["CUIT:", comprobanteVenta.notaPedido?.empleado?.cuit || "N/A"],
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
      .text("Empleado", cCol3X, cCurrentY - 12, { width: 120, align: "center" });

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
    cDatosEmpleado.forEach(([label, value], index) => {
      const y = cCurrentY + index * cRowHeight;
      doc.font("Helvetica-Bold").fontSize(9).text(label, cCol3X, y);
      doc.font("Helvetica").fontSize(9).text(value, cCol3X + 50, y);
    });

    // Línea vertical separadora Cliente ↔ Empleado
    const cTotalFilas = Math.max(
      Math.ceil(cDatosCliente.length / 2),
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

    // Línea horizontal debajo
    doc.moveTo(50, cSepYFin + 5)
      .lineTo(550, cSepYFin + 5)
      .stroke();

      // Pequeño espacio antes del encabezado de empresa
      doc.moveDown(1);

    // ---------------- Medio de Pago ----------------
    const medioPagoNombre = comprobanteVenta.notaPedido?.medioPago?.name || "N/A";
    doc.font("Helvetica-Bold").fontSize(10)
      .text("Medio de Pago:", 50, cSepYFin +10 );
    doc.font("Helvetica").fontSize(10)
      .text(medioPagoNombre, 125, cSepYFin + 10 );

    // Línea horizontal debajo
    doc.moveTo(50, cSepYFin + 25)
      .lineTo(550, cSepYFin + 25)
      .stroke();

    // ---------------- Detalle de productos ----------------

      doc.moveDown(2);

      // Encabezado de columnas
  doc.font("Helvetica-Bold").fontSize(9);
  const startX = 50;
  const colWidths = { num: 30 , tipo: 50, name: 200, qty: 60, price: 80, importe: 80 };
  let rowY = doc.y-5;

  doc.text("#", startX, rowY, { width: colWidths.num, align: "center" });
  doc.text("Tipo", startX+ 50 , rowY, { width: colWidths.tipo, align: "center" });
  doc.text("Producto", startX + colWidths.num+ colWidths.tipo, rowY, { width: colWidths.name, align: "center" });
  doc.text("Cantidad", startX + colWidths.num+ colWidths.tipo+ colWidths.name, rowY, { width: colWidths.qty, align: "center" });
  doc.text("Precio", startX + colWidths.num+ colWidths.tipo + colWidths.name + colWidths.qty, rowY, { width: colWidths.price, align: "center" });
  doc.text("Importe", startX + colWidths.num+ colWidths.tipo + colWidths.name + colWidths.qty + colWidths.price, rowY, { width: colWidths.importe, align: "center" });

  doc.moveDown(0.5);

  // Detalle de productos
  doc.font("Helvetica").fontSize(9);
  comprobanteVenta.detalles.forEach((det, i) => {
    const rowY = doc.y;
    const codigo = det.producto?._id || "N/A";
    const tipo = det.producto?.tipoProducto || "N/A";
    const nombreProducto = det.producto?.name || "Producto";
    const cantidad = det.cantidad || 0;
    const precio = det.precio?.toFixed(2) || "0.00";
    const importe = det.importe?.toFixed(2) || "0.00";

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
    doc.text(cantidad, startX + colWidths.num+ colWidths.tipo + colWidths.name, rowY, { width: colWidths.qty, align: "center" });
    doc.text(`$${precio}`, startX + colWidths.num+ colWidths.tipo + colWidths.name + colWidths.qty, rowY, { width: colWidths.price, align: "center" });
    doc.text(`$${importe}`, startX + colWidths.num+ colWidths.tipo + colWidths.name + colWidths.qty + colWidths.price, rowY, { width: colWidths.importe, align: "center" });

    doc.moveDown(0.5);
  });


    // ---------------- Total ----------------
    // Definir posición fija para el total (ej: 700px desde arriba)
    const totalY = 700;

    // Línea separadora encima de los totales
    doc.moveTo(50, totalY - 100)  // desde el margen izquierdo
      .lineTo(550, totalY - 100) // hasta el margen derecho
      .stroke();

    if(comprobanteVenta.tipoComprobante?.name === 'A'){
      // Texto del total sin iva
      doc.font("Helvetica-Bold")
        .fontSize(12)
        .text(`Subtotal: $${comprobanteVenta.total * 0.79}`, 50, totalY-80, { align: "right" });
    } else {
      // Texto del total sin iva
      doc.font("Helvetica-Bold")
        .fontSize(12)
        .text(`Subtotal: $${comprobanteVenta.total}`, 50, totalY-80, { align: "right" });
    }
    
    if(comprobanteVenta.tipoComprobante?.name === 'A'){
      // Texto del total iva
      doc.font("Helvetica-Bold")
        .fontSize(12)
        .text(`Total Iva: $${comprobanteVenta.total * 0.21}`, 50, totalY-40, { align: "right" });
    } else {
      // Texto del total sin iva
      doc.font("Helvetica-Bold")
        .fontSize(12)
        .text(`Total Iva: $${0}`, 50, totalY-40, { align: "right" });
    }

    

    // Línea separadora encima del total
    doc.moveTo(50, totalY - 10)  // desde el margen izquierdo
      .lineTo(550, totalY - 10) // hasta el margen derecho
      .stroke();

    // Texto del total
    doc.font("Helvetica-Bold")
      .fontSize(16)
      .text(`TOTAL: $${comprobanteVenta.total}`, 50, totalY, { align: "right" });
    });

    // Finalizar PDF
    doc.end();

  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, msg: "No se pudo generar el PDF" });
  }
};

module.exports = { imprimir };

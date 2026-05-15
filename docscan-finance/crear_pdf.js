const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Asegurarnos de que la carpeta exista
const dir = path.join(__dirname, 'facturas_pendientes');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

// Crear el documento
const doc = new PDFDocument();
const rutaDestino = path.join(dir, 'factura_prueba.pdf');

doc.pipe(fs.createWriteStream(rutaDestino));

// Agregar texto simulando una factura de Costa Rica
doc.fontSize(20).text('FACTURA COMERCIAL', { align: 'center' });
doc.moveDown();
doc.fontSize(12).text('Fecha: 15/05/2026');
doc.text('Proveedor: Suministros La Sabana SA');
doc.text('Cédula Jurídica: 3-101-987654');
doc.text('No. Factura: 00100001010000005555');
doc.moveDown();
doc.text('Descripción: Compra de papelería, cartuchos de tinta y lapiceros para la oficina.');
doc.moveDown();
doc.fontSize(14).text('MONTO TOTAL CRC: 25500', { bold: true });

doc.end();

console.log('¡PDF de prueba creado con éxito en la carpeta facturas_pendientes!');
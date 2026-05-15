const ExcelJS = require('exceljs');
const path = require('path');

async function generarReporteExcel(datosFacturas, montoAdelanto = 0) {
    const workbook = new ExcelJS.Workbook();
    // Cargamos tu machote oficial
    await workbook.xlsx.readFile(path.join(__dirname, '../Machote_Reintegro.xlsx'));
    const worksheet = workbook.worksheets[0];

    let filaInicio = 10; // Ajusta según tu machote
    let totalCRC = 0;

    datosFacturas.forEach((factura, index) => {
        const row = worksheet.getRow(filaInicio + index);
        row.getCell('A').value = factura.fecha;
        row.getCell('B').value = factura.proveedor;
        row.getCell('C').value = factura.cedula_fisica_juridica;
        row.getCell('D').value = factura.no_factura;
        row.getCell('E').value = factura.descripcion;
        
        const monto = Number(factura.monto_crc) || 0;
        row.getCell('F').value = monto;
        totalCRC += monto;

        // Validación: Si está incompleta, marcar en rojo la fila
        if (factura.incompleta) {
            row.eachCell((cell) => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC0C0' } };
            });
            row.getCell('G').value = "REVISAR: " + factura.notas_revision;
        }
    });

    // REQUERIMIENTO: Cálculo automático de totales y saldo líquido
    // Asumiendo que estas celdas están al final de tu machote:
    worksheet.getCell('F25').value = totalCRC; // Total Facturas
    worksheet.getCell('F26').value = montoAdelanto; // Adelanto
    worksheet.getCell('F27').value = montoAdelanto - totalCRC; // Saldo Líquido

    const nombreArchivo = `Reintegro_Final_${Date.now()}.xlsx`;
    const rutaGuardado = path.join(__dirname, '../reportes_generados', nombreArchivo);
    await workbook.xlsx.writeFile(rutaGuardado);
    return rutaGuardado;
}

module.exports = { generarReporteExcel };
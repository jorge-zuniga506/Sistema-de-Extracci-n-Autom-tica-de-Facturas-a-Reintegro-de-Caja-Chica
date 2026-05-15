const fs = require('fs');
const xml2js = require('xml2js');

async function extraerDatosXML(rutaArchivo) {
    try {
        const xml = fs.readFileSync(rutaArchivo, 'utf8');
        const parser = new xml2js.Parser({ explicitArray: false });
        const result = await parser.parseStringPromise(xml);

        // Buscamos si es Factura Electrónica o Tiquete Electrónico
        const factura = result.FacturaElectronica || result.TiqueteElectronico || result.NotaCreditoElectronica;

        if (!factura) return null;

        return {
            fecha: factura.FechaEmision.split('T')[0], // Formato YYYY-MM-DD
            proveedor: factura.Emisor.Nombre,
            cedula_fisica_juridica: factura.Emisor.Identificacion.Numero,
            no_factura: factura.Clave.substring(21, 41), // Número consecutivo
            descripcion: "Compra según XML Hacienda",
            monto_crc: Number(factura.ResumenFactura.TotalComprobante),
            incompleta: false,
            notas_revision: "Extraído de XML legal"
        };
    } catch (error) {
        console.error("Error leyendo XML:", error.message);
        return null;
    }
}

module.exports = { extraerDatosXML };
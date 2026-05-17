const fs = require('fs');
const xml2js = require('xml2js');

async function extraerDatosXML(rutaArchivo) {
    try {
        const xml = fs.readFileSync(rutaArchivo, 'utf8');
        const parser = new xml2js.Parser({ explicitArray: false });
        const result = await parser.parseStringPromise(xml);

        // Hacienda usa diferentes etiquetas según el tipo de documento
        const factura = result.FacturaElectronica || 
                        result.TiqueteElectronico || 
                        result.NotaCreditoElectronica;

        if (!factura) {
            return {
                incompleta: true,
                notas_revision: "Estructura XML de Hacienda no reconocida."
            };
        }

        return {
            fecha: factura.FechaEmision.split('T')[0],
            proveedor: factura.Emisor.Nombre,
            cedula_fisica_juridica: factura.Emisor.Identificacion.Numero,
            no_factura: factura.Clave.substring(21, 41), // Consecutivo de la clave
            descripcion: "Carga automática vía XML Hacienda",
            monto_crc: parseFloat(factura.ResumenFactura.TotalComprobante),
            incompleta: false,
            notas_revision: "Validado por XML legal"
        };
    } catch (error) {
        console.error("Error al leer XML:", error.message);
        return {
            incompleta: true,
            notas_revision: "Error técnico al procesar el archivo XML."
        };
    }
}

module.exports = { extraerDatosXML };
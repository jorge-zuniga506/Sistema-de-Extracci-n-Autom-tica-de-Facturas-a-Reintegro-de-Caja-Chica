const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

// Importación de servicios modulares
const { extraerTextoPDF } = require('./services/pdfService');
const { procesarFacturaConIA } = require('./services/aiService');
const { extraerDatosXML } = require('./services/xmlService');
const { generarReporteExcel } = require('./services/excelService');
const { enviarReportePorCorreo } = require('./services/emailService');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

/**
 * Función para validar identificación contra el Ministerio de Hacienda de Costa Rica
 * Consulta el padrón oficial de contribuyentes
 */
async function validarEnHacienda(cedula) {
    try {
        const idLimpia = cedula.replace(/-/g, '').trim();
        // Endpoint oficial de consulta tributaria
        const url = `https://api.hacienda.go.cr/fe/ae?identificacion=${idLimpia}`;
        
        const respuesta = await axios.get(url, { timeout: 5000 });
        
        if (respuesta.status === 200) {
            return {
                valida: true,
                nombreOficial: respuesta.data.nombre,
                situacion: respuesta.data.situacion?.estado || "Activo"
            };
        }
    } catch (error) {
        console.log(`Consulta Hacienda: Cédula ${cedula} no encontrada o sin conexión.`);
        return { valida: false, error: "No registrado o error de API" };
    }
}

/**
 * RUTA PRINCIPAL: Procesamiento automático de la carpeta de facturas
 */
app.post('/api/procesar-reintegro', async (req, res) => {
    try {
        const { adelanto } = req.body; // Adelanto para cálculo de saldo líquido
        const carpetaEntrada = path.join(__dirname, 'facturas_pendientes');
        
        // Verificar existencia de la carpeta
        if (!fs.existsSync(carpetaEntrada)) {
            return res.status(404).json({ error: "No se encuentra la carpeta 'facturas_pendientes'." });
        }

        // Leer archivos admitidos (PDF y XML)
        const archivos = fs.readdirSync(carpetaEntrada).filter(file => 
            file.endsWith('.pdf') || file.endsWith('.xml')
        );

        if (archivos.length === 0) {
            return res.status(400).json({ mensaje: "La carpeta está vacía. No hay documentos para procesar." });
        }

        console.log(`Iniciando procesamiento de ${archivos.length} documentos...`);
        const resultados = [];

        for (const nombreArchivo of archivos) {
            const rutaCompleta = path.join(carpetaEntrada, nombreArchivo);
            let datosExtraidos = null;

            try {
                // 1. PROCESAMIENTO SEGÚN TIPO DE ARCHIVO
                if (nombreArchivo.endsWith('.xml')) {
                    // Soporte para Factura Electrónica (XML)
                    console.log(`Leyendo XML legal: ${nombreArchivo}`);
                    datosExtraidos = await extraerDatosXML(rutaCompleta);
                } else if (nombreArchivo.endsWith('.pdf')) {
                    // Soporte para PDF con Inteligencia Artificial
                    console.log(`Procesando PDF con IA: ${nombreArchivo}`);
                    const textoPDF = await extraerTextoPDF(rutaCompleta);
                    if (textoPDF) {
                        datosExtraidos = await procesarFacturaConIA(textoPDF);
                    }
                }

                // 2. VALIDACIÓN CONTRA EL PADRÓN DE HACIENDA
                if (datosExtraidos && datosExtraidos.cedula_fisica_juridica) {
                    const validacion = await validarEnHacienda(datosExtraidos.cedula_fisica_juridica);
                    
                    if (validacion && validacion.valida) {
                        // Actualizamos al nombre legal registrado oficialmente
                        datosExtraidos.proveedor = validacion.nombreOficial;
                        datosExtraidos.notas_revision += " [Validado Hacienda]";
                    } else {
                        // Si no se encuentra en el padrón, se marca para revisión manual
                        datosExtraidos.incompleta = true;
                        datosExtraidos.notas_revision += " [Proveedor no hallado en Hacienda]";
                    }
                }

                if (datosExtraidos) {
                    resultados.push({ ...datosExtraidos, archivo_origen: nombreArchivo });
                }

            } catch (err) {
                console.error(`Error procesando ${nombreArchivo}:`, err.message);
                resultados.push({
                    proveedor: "ERROR",
                    descripcion: `Fallo técnico en: ${nombreArchivo}`,
                    incompleta: true,
                    notas_revision: err.message
                });
            }
        }

        // 3. GENERACIÓN DEL EXCEL (Incluye sumatoria CRC y Saldo Líquido)
        console.log("Generando reporte Excel final...");
        const rutaExcel = await generarReporteExcel(resultados, adelanto || 0);

        // 4. ENVÍO AUTOMÁTICO POR CORREO (Cierre del Flujo)
        console.log("Iniciando envío automático del reporte por correo...");
        const resultadoCorreo = await enviarReportePorCorreo(rutaExcel);

        // RESPUESTA AL CLIENTE
        const mensajeFinal = resultadoCorreo.exito 
            ? "✓ Procesamiento completado y reporte enviado por correo"
            : "⚠ Procesamiento completado pero falló el envío por correo";

        res.json({
            exito: resultadoCorreo.exito,
            mensaje: mensajeFinal,
            total_procesados: resultados.length,
            ruta_reporte: rutaExcel,
            reporte_nombre: path.basename(rutaExcel),
            reporte_url: `/api/reporte/${path.basename(rutaExcel)}`,
            correo_enviado: resultadoCorreo.exito,
            messageId: resultadoCorreo.messageId || null,
            detalle_datos: resultados
        });

    } catch (error) {
        console.error("Error crítico en el servidor:", error);
        res.status(500).json({ error: "Error interno durante el procesamiento del reintegro" });
    }
});

app.get('/api/reporte/:archivo', (req, res) => {
    const archivo = path.basename(req.params.archivo);
    const rutaArchivo = path.join(__dirname, 'reportes_generados', archivo);

    if (!fs.existsSync(rutaArchivo)) {
        return res.status(404).json({ error: 'Reporte no encontrado.' });
    }

    res.download(rutaArchivo, archivo, (err) => {
        if (err) {
            console.error('Error al enviar reporte:', err);
        }
    });
});

app.listen(PORT, () => {
    console.log(`
    =================================================
    DOCSCAN FINANCE CR - SISTEMA ACTIVO
    Puerto: ${PORT}
    Validación de Hacienda: HABILITADA
    =================================================
    `);
});
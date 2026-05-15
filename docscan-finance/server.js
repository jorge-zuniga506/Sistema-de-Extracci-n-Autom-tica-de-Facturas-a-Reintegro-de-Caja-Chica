const express = require('express');
const fs = require('fs');
const path = require('path');
const { extraerTextoPDF } = require('./services/pdfService');
const { procesarFacturaConIA } = require('./services/aiService');
const { generarReporteExcel } = require('./services/excelService');

const app = express();
app.use(express.json());

app.post('/api/procesar-reintegro', async (req, res) => {
    const { adelanto } = req.body;
    const carpeta = path.join(__dirname, 'facturas_pendientes');
    const archivos = fs.readdirSync(carpeta).filter(f => f.endsWith('.pdf'));

    const resultados = [];

    for (const archivo of archivos) {
        const texto = await extraerTextoPDF(path.join(carpeta, archivo));
        if (texto) {
            const dataIA = await procesarFacturaConIA(texto);
            resultados.push(dataIA);
        }
    }

    const excelGenerado = await generarReporteExcel(resultados, adelanto);

    res.json({
        mensaje: "Procesamiento inteligente completado",
        total_facturas: resultados.length,
        archivo: excelGenerado,
        detalle: resultados
    });
});

app.listen(3000, () => console.log("DocScan Finance CR activo en puerto 3000"));
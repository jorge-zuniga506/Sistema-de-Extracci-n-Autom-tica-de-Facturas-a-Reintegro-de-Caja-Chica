const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function procesarFacturaConIA(textoFactura) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Eres un experto contable de Costa Rica. Extrae los datos de esta factura y devuelve ÚNICAMENTE un JSON.
    Campos obligatorios:
    - fecha (DD/MM/AAAA)
    - proveedor
    - cedula_fisica_juridica
    - no_factura
    - descripcion
    - monto_crc (Número sin símbolos)
    - incompleta (true si falta algún dato de arriba, sino false)
    - notas_revision (Indica qué falta si está incompleta)

    Texto de la factura: ${textoFactura}`;

    try {
        const result = await model.generateContent(prompt);
        let texto = result.response.text().replace(/```json/gi, '').replace(/```/gi, '').trim();
        return JSON.parse(texto);
    } catch (error) {
        return { incompleta: true, notas_revision: "Error de conexión con IA" };
    }
}

module.exports = { procesarFacturaConIA };
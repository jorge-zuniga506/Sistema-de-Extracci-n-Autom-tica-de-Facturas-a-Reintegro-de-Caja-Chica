const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Servicio de envío de reportes por correo
 * Utiliza Gmail con Contraseña de Aplicación (App Password)
 */
async function enviarReportePorCorreo(rutaArchivo) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const opciones = {
            from: `DocScan Finance CR <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_DESTINO,
            subject: 'Reporte de Reintegro de Caja Chica Disponible',
            html: `
                <h2>DocScan Finance CR - Reporte Automático</h2>
                <p>Se ha generado un nuevo reporte de reintegro automáticamente.</p>
                <p><strong>El archivo se adjunta para su revisión y aprobación.</strong></p>
                <hr>
                <p><em>Este es un mensaje automático del sistema. Por favor no responda.</em></p>
            `,
            attachments: [
                {
                    path: rutaArchivo
                }
            ]
        };

        const resultado = await transporter.sendMail(opciones);
        console.log('✓ Correo enviado satisfactoriamente: ' + resultado.messageId);
        return { exito: true, messageId: resultado.messageId };
    } catch (error) {
        console.error('✗ Error al enviar el correo:', error.message);
        return { exito: false, error: error.message };
    }
}

module.exports = { enviarReportePorCorreo };

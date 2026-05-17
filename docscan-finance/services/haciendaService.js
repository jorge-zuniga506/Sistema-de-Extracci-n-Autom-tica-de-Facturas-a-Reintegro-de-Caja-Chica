const axios = require('axios');

async function validarCedulaHacienda(cedula) {
    try {
        // Limpiamos la cédula por si trae guiones o espacios
        const cedulaLimpia = cedula.replace(/-/g, '').trim();
        
        // URL de la API de consulta de Hacienda
        const url = `https://api.hacienda.go.cr/fe/dgv/persona/?id=${cedulaLimpia}`;
        
        const respuesta = await axios.get(url);

        if (respuesta.status === 200) {
            return {
                valida: true,
                nombreOficial: respuesta.data.nombre,
                tipoIdentificacion: respuesta.data.tipoIdentificacion
            };
        }
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return { valida: false, error: "La cédula no existe en el padrón de Hacienda" };
        }
        return { valida: false, error: "No se pudo conectar con el servicio de Hacienda" };
    }
}

module.exports = { validarCedulaHacienda };
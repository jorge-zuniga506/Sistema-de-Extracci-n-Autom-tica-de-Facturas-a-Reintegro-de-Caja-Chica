# DocScan Finance CR - Setup Rápido

## ¿Qué hacer?

### 1. Instala dependencias
```bash
npm install
```

### 2. Habilita Gmail 2FA
- Ve a https://myaccount.google.com/security
- Activa "Verificación en dos pasos"
- Genera "Contraseña de Aplicación" (Mail + tu dispositivo)
- Copia la contraseña de 16 caracteres

### 3. Crea `.env` en la raíz
```env
PORT=3000
EMAIL_USER=tu-correo@gmail.com
EMAIL_PASS=tu-password-16-caracteres
EMAIL_DESTINO=jefe@empresa.com
```

### 4. Inicia servidor
```bash
npm start
```

### 5. Prueba
```bash
curl -X POST http://localhost:3000/api/procesar-reintegro -H "Content-Type: application/json" -d '{"adelanto": 0}'
```

El correo llega automáticamente al jefe. Listo.

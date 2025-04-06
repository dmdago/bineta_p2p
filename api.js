// app.js
const express = require('express');
const mysql = require('mysql');

const app = express();
const port = process.env.PORT || 3000;

// Crear un pool de conexiones para gestionar múltiples solicitudes
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'bineta',
  password: 'Bineta2025!',
  database: 'bineta_p2p',
  timezone: '-03:00' // Esto ayuda a que las fechas se manejen según la zona horaria de Argentina
});

// Endpoint para obtener el historial con los campos solicitados
app.get('/history', (req, res) => {
  const query = `
    SELECT 
      dDate, 
      fAverage, 
      CASE DAYOFWEEK(dDate)
        WHEN 1 THEN 'Domingo'
        WHEN 2 THEN 'Lunes'
        WHEN 3 THEN 'Martes'
        WHEN 4 THEN 'Miércoles'
        WHEN 5 THEN 'Jueves'
        WHEN 6 THEN 'Viernes'
        WHEN 7 THEN 'Sábado'
      END AS diaSemana,
      DATE_FORMAT(dDate, '%H:%i:%s') AS hora,
      WEEK(dDate, 1) AS numeroSemana
    FROM history
    ORDER BY dDate DESC
  `;
  
  pool.query(query, (error, results) => {
    if (error) {
      console.error('Error al obtener datos de la base de datos:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    res.json(results);
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});

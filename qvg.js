const axios = require('axios');
const mysql = require('mysql2');

async function fetchAveragePrice() {
  // Crear conexión a MySQL para esta iteración
  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'sammy',
    password: 'password',
    database: 'bineta_p2p'
  });

  connection.connect((err) => {
    if (err) {
      console.error('Error de conexión a MySQL:', err);
      return;
    }
    console.log('Conectado a MySQL.');
  });
  
  try {
    const url = 'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search';
    const payload = {
      asset: "USDT",
      fiat: "ARS",
      tradeType: "SELL",
      page: 1,
      rows: 5,
      payTypes: ["BankArgentina"],
      publisherType: null
    };

    const headers = {
      'Content-Type': 'application/json',
    };

    const response = await axios.post(url, payload, { headers });
    const data = response.data;

    if (data && data.data && Array.isArray(data.data)) {
      const offers = data.data;
      let total = 0;
      let count = 0;

      offers.forEach((offer) => {
        const price = parseFloat(offer.adv.price);
        if (!isNaN(price)) {
          total += price;
          count++;
        }
      });
      
      if (count === 0) {
        console.log("No se encontraron ofertas.");
      } else {
        const average = total / count;
        console.log(`Precio promedio de venta de USDT (ARS) con Bank Transfer: ${average.toFixed(2)}`);

        // Insertar fecha actual y promedio en la tabla 'history'
        const insertQuery = "INSERT INTO history (dDate, fAverage) VALUES (CONVERT_TZ(NOW(), 'SYSTEM', '-03:00'), ?)";
        connection.query(insertQuery, [average.toFixed(2)], (error, results) => {
          if (error) {
            console.error('Error al insertar en MySQL:', error);
          } else {
            console.log('Datos insertados correctamente:', results);
          }
          // Cerrar la conexión una vez completada la consulta
          connection.end();
        });
      }
    } else {
      console.log("La estructura de respuesta no es la esperada:", data);
      connection.end();
    }
  } catch (error) {
    console.error("Error al obtener las ofertas:", error.message);
    connection.end();
  }
}

// Ejecutar la función inmediatamente y luego cada 60 segundos (60000 milisegundos)
fetchAveragePrice();
setInterval(fetchAveragePrice, 60000);

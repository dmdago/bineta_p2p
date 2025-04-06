const axios = require('axios');

async function fetchAveragePrice() {
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
      }
    } else {
      console.log("La estructura de respuesta no es la esperada:", data);
    }
  } catch (error) {
    console.error("Error al obtener las ofertas:", error.message);
  }
}

fetchAveragePrice();
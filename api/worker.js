const axios = require("axios");
const dotenv = require("dotenv");

const crypto = require("crypto");

dotenv.config();

const GA4_MEASUREMENT_ID = process.env.GA4_MEASUREMENT_ID;
const GA4_API_SECRET = process.env.GA4_API_SECRET;
const CURRENCY_API_URL = process.env.CURRENCY_API_URL;

const getExchangeRate = async () => {
  try {
    const response = await axios.get(CURRENCY_API_URL);
    const rate = response.data[0]?.rate || null;

    if (!rate) throw new Error("Unable to fetch exchange rate");

    console.log("Exchange rate fetched:", rate);

    return rate;
  } catch (error) {
    console.error("Error fetching exchange rate:", error.message);
    return null;
  }
};

const sendToGA4 = async (exchangeRate) => {
  const endpoint = `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`;

  const clientId = crypto.randomUUID();

  const eventData = {
    client_id: clientId,
    events: [
      {
        name: "uah_usd_rate",
        params: {
          exchange_rate: exchangeRate,
        },
      },
    ],
  };

  try {
    const response = await axios.post(endpoint, eventData, {
      headers: {
        "User-Agent": "My User Agent 1.0",
      },
    });

    console.log("Data sent to GA4:", response.status);
  } catch (error) {
    console.error("Error sending data to GA4:", error.message);
  }
};

const worker = async () => {
  console.log("Starting exchange rate worker...");
  const exchangeRate = await getExchangeRate();

  if (exchangeRate) {
    await sendToGA4(exchangeRate);
  }
};

const ONE_HOUR = 60 * 60 * 1000;

const startWorker = () => {
  setInterval(async () => {
    console.log("Running worker every one hour seconds...");
    await worker();
  }, ONE_HOUR);
};

startWorker();

console.log("Worker initialized to run every one hour seconds.");

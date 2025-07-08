const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors()); // Allow all origins

// Proxy endpoint for products
app.get('/api/products', async (req, res) => {
  try {
    // You can pass a full neemans.com URL as a query param, or use the default
    const url = req.query.url || 'https://neemans.com/collections/all-products/products.json';
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data', details: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
}); 
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'product_db'
});

connection.connect((err) => {
  if (err) {
    console.error('Failed to connect to MySQL server:', err);
    process.exit(1);
  }
  console.log('Connected to the MySQL server.');
});

// Define routes
app.get('/api/products', (req, res) => {
  connection.query('SELECT * FROM products', (err, results) => {
    if (err) {
      console.error('Error fetching products:', err);
      res.status(500).json({ error: 'Error fetching products' });
      return;
    }
    res.json(results);
  });
});

app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  connection.query('SELECT * FROM products WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error fetching product:', err);
      res.status(500).json({ error: 'Error fetching product' });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(results[0]);
  });
});

app.post('/api/products', (req, res) => {
  const { name, description, price } = req.body;
  const query = 'INSERT INTO products (name, description, price) VALUES (?, ?, ?)';
  connection.query(query, [name, description, price], (err, results) => {
    if (err) {
      console.error('Error creating product:', err);
      res.status(500).json({ error: 'Error creating product' });
      return;
    }
    res.status(201).json({ id: results.insertId, name, description, price });
  });
});

app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, price } = req.body;
  const query = 'UPDATE products SET name = ?, description = ?, price = ? WHERE id = ?';
  connection.query(query, [name, description, price, id], (err) => {
    if (err) {
      console.error('Error updating product:', err);
      res.status(500).json({ error: 'Error updating product' });
      return;
    }
    res.status(200).json({ id, name, description, price });
  });
});

// Delete a product
app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    connection.query('DELETE FROM products WHERE id = ?', [id], (err) => {
      if (err) throw err;
      res.status(204).end(); // Send no content response
    });
  });
  

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

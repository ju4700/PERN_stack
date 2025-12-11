const express = require('express');
const {Pool} = require('pg');

const app = express();
const port = 3000;

app.use(express.static(__dirname));

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'perndatabase',
    password: '4700',
    port: 5432,
});

app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "users"');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching users');
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
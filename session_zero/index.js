const express = require('express');
const {Pool} = require('pg');

const app = express();
const port = 3000;

const pool = new Pool({
    user: 'ju4700',
    host: 'localhost',
    database: 'perndatabse',
    password: '4700',
    port: 5432,
});

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
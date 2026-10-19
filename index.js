require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT) || 5432,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM biodata ORDER BY id'
        );

                res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
});


/* POST: Menambahkan biodata */
app.post('/biodata', async (req, res) => { 
    const { nama, nim, kelas } = req.body;

    if (!nama || !nim || !kelas) {
        return res.status(400).json({
            message: 'Nama, NIM, dan kelas wajib diisi'
        });
    }

    try {
        const result = await pool.query(
            `INSERT INTO biodata (nama, nim, kelas)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [nama, nim, kelas]
        );

        res.status(201).json({
            message: 'Data berhasil ditambahkan',
            data: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
});

/* PUT: Mengubah biodata */
app.put('/biodata/:id', async (req, res) => {
    const { nama, nim, kelas } = req.body;

    if (!nama || !nim || !kelas) {
        return res.status(400).json({
            message: 'Nama, NIM, dan kelas wajib diisi'
        });
    }

    try {
        const result = await pool.query(
            `UPDATE biodata
             SET nama = $1, nim = $2, kelas = $3
             WHERE id = $4
             RETURNING *`,
            [nama, nim, kelas, req.params.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: 'Data tidak ditemukan'
            });
        }

        res.status(200).json({
            message: 'Data berhasil diubah',
            data: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
});

/* DELETE: Menghapus biodata */
app.delete('/biodata/:id', async (req, res) => { 
    try {
        const result = await pool.query(
            'DELETE FROM biodata WHERE id = $1 RETURNING *',
            [req.params.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: 'Data tidak ditemukan'
            });
        }

        res.status(200).json({
            message: 'Data berhasil dihapus',
            data: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
});

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/students', async (req, res) => {
  try {
    const { first_name, last_name, student_id, date_of_birth, gender } = req.body;
    const sql = 'INSERT INTO students (first_name, last_name, student_id, date_of_birth, gender) VALUES (?, ?, ?, ?, ?)';
    await pool.query(sql, [first_name, last_name, student_id, date_of_birth, gender]);
    
    const [newStudent] = await pool.query('SELECT * FROM students WHERE student_id = ?', [student_id]);
    res.status(201).json(newStudent[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

app.get('/students', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM students');
      res.json(rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Server Error' });
    }
});

app.get('/students/:student_id', async (req, res) => {
    try {
      const { student_id } = req.params;
      const [rows] = await pool.query('SELECT * FROM students WHERE student_id = ?', [student_id]);
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }
      res.json(rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Server Error' });
    }
});


app.put('/students/:student_id', async (req, res) => {
  try {
    const { student_id } = req.params;
    const { first_name, last_name, date_of_birth, gender } = req.body;
    

    const sql = 'UPDATE students SET first_name = ?, last_name = ?, date_of_birth = ?, gender = ? WHERE student_id = ?';
    const [result] = await pool.query(sql, [first_name, last_name, date_of_birth, gender, student_id]);

    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Student not found' });
    }
    
    const [updatedStudentRows] = await pool.query('SELECT * FROM students WHERE student_id = ?', [student_id]);
    res.json({ message: 'Student was updated!', student: updatedStudentRows[0] });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

app.delete('/students/:student_id', async (req, res) => {
    try {
      const { student_id } = req.params; 
      const [result] = await pool.query('DELETE FROM students WHERE student_id = ?', [student_id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }
      res.json({ message: 'Student was deleted!' });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Server Error' });
    }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
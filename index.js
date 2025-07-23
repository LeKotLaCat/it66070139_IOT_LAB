
const { Hono } = require('hono');
const { cors } = require('hono/cors');
const { serve } = require('@hono/node-server');
const { serveStatic } = require('@hono/node-server/serve-static');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = new Hono();
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

app.use('/students/*', cors());
app.use('/*', serveStatic({ root: './public' }));
app.get('/', serveStatic({ path: './public/index.html' })); 

app.post('/students', async (c) => {
  try {
    const body = await c.req.json();
    const { first_name, last_name, student_id, date_of_birth, gender } = body;
    const sql = 'INSERT INTO students (first_name, last_name, student_id, date_of_birth, gender) VALUES (?, ?, ?, ?, ?)';
    await pool.query(sql, [first_name, last_name, student_id, date_of_birth, gender]);
    
    const [newStudent] = await pool.query('SELECT * FROM students WHERE student_id = ?', [student_id]);
    return c.json(newStudent[0], 201);
  } catch (err) {
    console.error(err.message);
    return c.json({ error: 'Server Error' }, 500);
  }
});

app.get('/students', async (c) => {
    try {
      const [rows] = await pool.query('SELECT * FROM students');
      return c.json(rows);
    } catch (err) {
      console.error(err.message);
      return c.json({ error: 'Server Error' }, 500);
    }
});

app.get('/students/:student_id', async (c) => {
    try {
      const student_id = c.req.param('student_id');
      const [rows] = await pool.query('SELECT * FROM students WHERE student_id = ?', [student_id]);
      
      if (rows.length === 0) {
        return c.json({ error: 'Student not found' }, 404);
      }
      return c.json(rows[0]);
    } catch (err) {
      console.error(err.message);
      return c.json({ error: 'Server Error' }, 500);
    }
});

app.put('/students/:student_id', async (c) => {
  try {
    const student_id = c.req.param('student_id');
    const body = await c.req.json();
    const { first_name, last_name, date_of_birth, gender } = body;
    
    const sql = 'UPDATE students SET first_name = ?, last_name = ?, date_of_birth = ?, gender = ? WHERE student_id = ?';
    const [result] = await pool.query(sql, [first_name, last_name, date_of_birth, gender, student_id]);

    if (result.affectedRows === 0) {
      return c.json({ error: 'Student not found' }, 404);
    }
    const [updatedStudentRows] = await pool.query('SELECT * FROM students WHERE student_id = ?', [student_id]);
    return c.json({ message: 'Student was updated!', student: updatedStudentRows[0] });

  } catch (err) {
    console.error(err.message);
    return c.json({ error: 'Server Error' }, 500);
  }
});

app.delete('/students/:student_id', async (c) => {
    try {
      const student_id = c.req.param('student_id');
      const [result] = await pool.query('DELETE FROM students WHERE student_id = ?', [student_id]);

      if (result.affectedRows === 0) {
        return c.json({ error: 'Student not found' }, 404);
      }
      return c.json({ message: 'Student was deleted!' });
    } catch (err) {
      console.error(err.message);
      return c.json({ error: 'Server Error' }, 500);
    }
});

console.log(`Server is running on http://localhost:${port}`);
serve({
  fetch: app.fetch,
  port: port
});
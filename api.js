import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();
app.use('*', cors());

// Read All
app.get('/api/students', async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM students').all();
    return c.json(results);
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});

// Create
app.post('/api/students', async (c) => {
  try {
    const body = await c.req.json();
    const stmt = c.env.DB.prepare('INSERT INTO students (student_id, first_name, last_name, date_of_birth, gender) VALUES (?, ?, ?, ?, ?)');
    await stmt.bind(body.student_id, body.first_name, body.last_name, body.date_of_birth, body.gender).run();
    const newStudent = await c.env.DB.prepare('SELECT * FROM students WHERE student_id = ?').bind(body.student_id).first();
    return c.json(newStudent, 201);
  } catch (e) {
    if (e.message.includes('UNIQUE constraint failed')) {
      return c.json({ error: 'Student ID already exists' }, 409);
    }
    return c.json({ error: e.message }, 500);
  }
});

// Read One
app.get('/api/students/:student_id', async (c) => {
  try {
    const { student_id } = c.req.param();
    const student = await c.env.DB.prepare('SELECT * FROM students WHERE student_id = ?').bind(student_id).first();
    return student ? c.json(student) : c.json({ error: 'Not Found' }, 404);
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});

// Update
app.put('/api/students/:student_id', async (c) => {
  try {
    const { student_id } = c.req.param();
    const body = await c.req.json();
    const stmt = c.env.DB.prepare('UPDATE students SET first_name = ?, last_name = ?, date_of_birth = ?, gender = ? WHERE student_id = ?');
    await stmt.bind(body.first_name, body.last_name, body.date_of_birth, body.gender, student_id).run();
    return c.json({ message: 'Updated successfully' });
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});

// Delete
app.delete('/api/students/:student_id', async (c) => {
  try {
    const { student_id } = c.req.param();
    await c.env.DB.prepare('DELETE FROM students WHERE student_id = ?').bind(student_id).run();
    return c.json({ message: 'Deleted successfully' });
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});

export default app;
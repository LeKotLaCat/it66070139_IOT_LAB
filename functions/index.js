// ใช้ import แทน require
import { Hono } from 'hono';
import { cors } from 'hono/cors';

// ลบการประกาศ Type Env และการใช้ <Env> ออกไป
const app = new Hono();

// Middleware
app.use('/students/*', cors());

// API Routes
// --- CREATE ---
app.post('/students', async (c) => {
  try {
    const { first_name, last_name, student_id, date_of_birth, gender } = await c.req.json();
    const stmt = c.env.DB.prepare(
      'INSERT INTO students (student_id, first_name, last_name, date_of_birth, gender) VALUES (?, ?, ?, ?, ?)'
    );
    await stmt.bind(student_id, first_name, last_name, date_of_birth, gender).run();
    const newStudent = await c.env.DB.prepare('SELECT * FROM students WHERE student_id = ?').bind(student_id).first();
    return c.json(newStudent, 201);
  } catch (e) {
    if (e.message.includes('UNIQUE constraint failed')) {
        return c.json({ error: 'Student ID already exists' }, 409);
    }
    return c.json({ error: 'Server Error', message: e.message }, 500);
  }
});

// --- READ ALL ---
app.get('/students', async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM students').all();
    return c.json(results);
  } catch (e) {
    return c.json({ error: 'Server Error', message: e.message }, 500);
  }
});

// --- READ ONE ---
app.get('/students/:student_id', async (c) => {
  try {
    const student_id = c.req.param('student_id');
    const student = await c.env.DB.prepare('SELECT * FROM students WHERE student_id = ?').bind(student_id).first();
    if (!student) {
      return c.json({ error: 'Student not found' }, 404);
    }
    return c.json(student);
  } catch (e) {
    return c.json({ error: 'Server Error', message: e.message }, 500);
  }
});

// --- UPDATE ---
app.put('/students/:student_id', async (c) => {
  try {
    const student_id = c.req.param('student_id');
    const { first_name, last_name, date_of_birth, gender } = await c.req.json();
    const stmt = c.env.DB.prepare(
      'UPDATE students SET first_name = ?, last_name = ?, date_of_birth = ?, gender = ? WHERE student_id = ?'
    );
    const info = await stmt.bind(first_name, last_name, date_of_birth, gender, student_id).run();
    if (info.meta.changes === 0) {
        return c.json({ error: 'Student not found or no changes made' }, 404);
    }
    const updatedStudent = await c.env.DB.prepare('SELECT * FROM students WHERE student_id = ?').bind(student_id).first();
    return c.json({ message: 'Student was updated!', student: updatedStudent });
  } catch (e) {
    return c.json({ error: 'Server Error', message: e.message }, 500);
  }
});

// --- DELETE ---
app.delete('/students/:student_id', async (c) => {
  try {
    const student_id = c.req.param('student_id');
    const stmt = c.env.DB.prepare('DELETE FROM students WHERE student_id = ?');
    const info = await stmt.bind(student_id).run();
    if (info.meta.changes === 0) {
        return c.json({ error: 'Student not found' }, 404);
    }
    return c.json({ message: 'Student was deleted!' });
  } catch (e) {
    return c.json({ error: 'Server Error', message: e.message }, 500);
  }
});

// ส่งออก app object
export default app;
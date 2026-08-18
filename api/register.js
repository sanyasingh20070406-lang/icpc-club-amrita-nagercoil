const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { codeforces_handle, student_name, roll_number, class_name, batch } = req.body;

  if (!codeforces_handle || !student_name || !roll_number || !class_name || !batch) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // We create the table if it doesn't exist just to ensure it works smoothly
    await pool.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        codeforces_handle VARCHAR(255) UNIQUE NOT NULL,
        student_name VARCHAR(255) NOT NULL,
        roll_number VARCHAR(255) UNIQUE NOT NULL,
        class_name VARCHAR(255) NOT NULL,
        batch VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert the new student record
    const result = await pool.query(
      `INSERT INTO students (codeforces_handle, student_name, roll_number, class_name, batch) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [codeforces_handle, student_name, roll_number, class_name, batch]
    );

    return res.status(201).json({ message: 'Student registered successfully', id: result.rows[0].id });
  } catch (error) {
    console.error('Database Error:', error);
    
    // Handle unique constraint violations
    if (error.code === '23505') {
      return res.status(409).json({ message: 'A student with this Codeforces handle or Roll Number is already registered.' });
    }

    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Tembo database connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? {
        ca: process.env.SSL_CERT_CONTENT,
        rejectUnauthorized: true
      }
    : {
        rejectUnauthorized: false
      }
});

// Test database connection on startup
async function testDatabaseConnection() {
  try {
    const client = await pool.connect();
    try {
      const response = await client.query('SELECT 1');
      console.log('Successfully connected to Tembo database');
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
}

testDatabaseConnection();

const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());

// Helper function to generate slug
function generateSlug(name) {
  return name.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper function to ensure unique slug
async function ensureUniqueSlug(baseSlug, existingId = null) {
  let slug = baseSlug;
  let counter = 1;
  let exists = true;

  while (exists) {
    const query = existingId
      ? 'SELECT id FROM projects WHERE slug = $1 AND id != $2'
      : 'SELECT id FROM projects WHERE slug = $1';
    const params = existingId ? [slug, existingId] : [slug];
    
    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      exists = false;
    } else {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }
  
  return slug;
}

// Login route for authentication
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    const user = result.rows[0];

    // Direct password comparison (NOT RECOMMENDED for production)
    if (password !== user.password) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// CRUD operations for projects
app.post('/projects', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { name, description, github_link, live_link } = req.body;
    const baseSlug = generateSlug(name);
    const finalSlug = await ensureUniqueSlug(baseSlug);
    
    const result = await client.query(
      'INSERT INTO projects (name, description, github_link, live_link, slug) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, github_link, live_link, finalSlug]
    );
    
    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating project:', err);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
});

app.put('/projects/:slug', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { slug } = req.params;
    const { name, description, github_link, live_link } = req.body;
    
    // First, get the existing project to get its ID
    const existingProject = await client.query(
      'SELECT id FROM projects WHERE slug = $1',
      [slug]
    );
    
    if (existingProject.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const projectId = existingProject.rows[0].id;
    
    // Generate and ensure unique slug if name is changed
    const baseSlug = generateSlug(name);
    const finalSlug = await ensureUniqueSlug(baseSlug, projectId);
    
    const result = await client.query(
      'UPDATE projects SET name = $1, description = $2, github_link = $3, live_link = $4, slug = $5 WHERE slug = $6 RETURNING *',
      [name, description, github_link, live_link, finalSlug, slug]
    );
    
    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating project:', err);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
});

app.delete('/projects/:slug', authenticateToken, async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query('DELETE FROM projects WHERE slug = $1 RETURNING *', [slug]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.sendStatus(204);
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/projects/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query('SELECT * FROM projects WHERE slug = $1', [slug]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching project:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/projects', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
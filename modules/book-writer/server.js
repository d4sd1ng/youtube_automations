const express = require('express');
const path = require('path');
const BookWriterAgent = require('./BookWriterAgent');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Book Writer Agent
const bookWriterAgent = new BookWriterAgent();

// Routes
app.get('/', (req, res) => {
  res.send(`
    <h1>📚 Book Writer Agent</h1>
    <p>Intelligenter Agent zur automatisierten Erstellung von Büchern</p>
    <h2>Verfügbare Endpunkte:</h2>
    <ul>
      <li>POST /api/book - Erstelle ein neues Buch</li>
      <li>GET /api/book/:title - Hole Buchinformationen</li>
      <li>GET /api/stats - Hole Agentenstatistiken</li>
    </ul>
  `);
});

// Create a new book
app.post('/api/book', async (req, res) => {
  try {
    const { topic, options } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Thema ist erforderlich' });
    }

    console.log(`🚀 Starting book creation for: ${topic}`);

    // Start book creation process
    const book = await bookWriterAgent.createBook(topic, options || {});

    res.status(201).json({
      message: 'Buch erfolgreich erstellt',
      book: book
    });
  } catch (error) {
    console.error('❌ Book creation failed:', error.message);
    res.status(500).json({
      error: 'Bucherstellung fehlgeschlagen',
      details: error.message
    });
  }
});

// Get book information
app.get('/api/book/:title', async (req, res) => {
  try {
    const { title } = req.params;

    const book = await bookWriterAgent.loadBookProject(title);

    if (!book) {
      return res.status(404).json({ error: 'Buch nicht gefunden' });
    }

    res.json(book);
  } catch (error) {
    console.error('❌ Failed to load book:', error.message);
    res.status(500).json({
      error: 'Fehler beim Laden des Buchs',
      details: error.message
    });
  }
});

// Get agent statistics
app.get('/api/stats', (req, res) => {
  try {
    const stats = bookWriterAgent.getStats();
    res.json(stats);
  } catch (error) {
    console.error('❌ Failed to get stats:', error.message);
    res.status(500).json({
      error: 'Fehler beim Abrufen der Statistiken',
      details: error.message
    });
  }
});

// Get book project status
app.get('/api/book/:title/status', async (req, res) => {
  try {
    const { title } = req.params;

    const status = await bookWriterAgent.getBookProjectStatus(title);

    if (!status) {
      return res.status(404).json({ error: 'Buchprojekt nicht gefunden' });
    }

    res.json(status);
  } catch (error) {
    console.error('❌ Failed to get book status:', error.message);
    res.status(500).json({
      error: 'Fehler beim Abrufen des Projektstatus',
      details: error.message
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`📖 Book Writer Agent Server läuft auf Port ${port}`);
  console.log(`📍 Öffne http://localhost:${port} im Browser`);
});

module.exports = app;
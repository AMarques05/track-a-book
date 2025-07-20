import express from 'express';
import session from 'express-session';
// import pgSession from 'connect-pg-simple';
import dotenv from 'dotenv';
import path from 'path';
import auth from './routes/auth.js';
import books from './routes/books.js';
import { fileURLToPath } from 'url';
import { client } from './db/index.js';
import { attachUser } from './middleware/authMiddleware.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Simple session configuration (memory store)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Make user available in all templates
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.use(attachUser);

app.use('/auth', auth);
app.use('/books', books);

// Home route
app.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect('/books');
  } else {
    res.render('index');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Page not found',
    message: 'The page you are looking for does not exist.' 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 BookNoteVault server running on http://localhost:${PORT}`);
});
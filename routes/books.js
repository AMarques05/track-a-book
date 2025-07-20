import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { requireAuth } from '../middleware/authMiddleware.js';
import { query } from '../db/index.js';

dotenv.config();

const router = express.Router();

router.use(requireAuth);

//Render the books page
router.get('/', async (req, res) => {
    try {
      const { rows: books } = await query(
        'SELECT * FROM books WHERE user_id = $1', 
        [req.session.user.id]
      );
      res.render('books', { books });
    } catch (err) {
        console.error('Error fetching books:', err);
    }
});

//Render the add book page
router.get('/new', (req, res) => {
    res.render('addBook');
});

//Render the edit book page
router.get('/edit/:id', async (req, res) => {
  try{
    const bookId = req.params.id;
    const userId = req.session.user.id;

    const result = await query(
      'SELECT * FROM books WHERE id = $1 AND user_id = $2',
      [bookId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).send('Book not found');
    }

    const book = result.rows[0];
    res.render('edit', { book });
  } catch (err) {
    console.error('Error fetching book for edit:', err);
    res.status(500).send('Internal Server Error');
  }
});

//Add a new book
router.post('/new', async (req, res) => {
  const { title, authors, publishedDate, thumbnail, isbn_10, isbn_13 } = req.body;
  const userId = req.session.user.id;
  try {
    const { rows } = await query(
      'INSERT INTO books (title, author, published_at, cover_id, isbn_10, isbn_13, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, authors, publishedDate, thumbnail, isbn_10, isbn_13, userId]
    );

    res.redirect('/books');
  } catch (err) {
    console.error('Error adding book:', err);
    res.status(500).send('Internal Server Error');
  }
});

//Update a book (only personal fields)
router.post('/edit/:id', async (req, res) => {
  const bookId = req.params.id;
  const userId = req.session.user.id;
  const { notes, rating, date_read } = req.body;

  try {
    const result = await query(
      'UPDATE books SET notes = $1, rating = $2, date_read = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
      [notes, rating, date_read, bookId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).send('Book not found');
    }

    res.redirect('/books');
  } catch (err) {
    console.error('Error updating book:', err);
    res.status(500).send('Internal Server Error');
  }
});

//Delete a book
router.post('/delete/:id', async (req, res) => {
  try {
    const bookId = req.params.id;
    const userId = req.session.user.id;

    const result = await query(
      'DELETE FROM books WHERE id = $1 AND user_id = $2 RETURNING id',
      [bookId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).send('Book not found');
    }

    res.redirect('/books');
  } catch (err) {
    console.error('Error deleting book:', err);
    res.status(500).send('Internal Server Error');
  }
});

//Search for books in Google Books API
router.post('/search', async (req, res) => {
  const { searchTerm, condition } = req.body;

  try{
    if(!searchTerm || !condition) {
      return res.status(400).json({ error: 'Search term and condition are required.' });
    }

    const encodedSearchTerm = encodeURIComponent(searchTerm);
    const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${condition}:${encodedSearchTerm}`);

    const books = response.data.items.map(book => {
      const volumeinfo = book.volumeInfo;
      return {
        id: book.id,
        title: volumeinfo.title || 'No title available',
        authors: volumeinfo.authors || ['Unknown author'],
        publishedDate: volumeinfo.publishedDate || 'Unknown date',
        thumbnail: volumeinfo.imageLinks ? volumeinfo.imageLinks.thumbnail : null,
        isbn_10: volumeinfo.industryIdentifiers ? volumeinfo.industryIdentifiers.find(id => id.type === 'ISBN_10')?.identifier : null,
        isbn_13: volumeinfo.industryIdentifiers ? volumeinfo.industryIdentifiers.find(id => id.type === 'ISBN_13')?.identifier : null
      }
    });

    if (!books.length) {
      return res.status(404).json({ error: 'No books found.' });
    }

    res.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'An error occurred while fetching books.' });
  }
});

export default router
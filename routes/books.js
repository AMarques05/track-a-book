import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { requireAuth } from '../middleware/authMiddleware.js';
import { query } from '../db/index.js';

dotenv.config();

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
    res.render('books');
});

router.post('/search', async (req, res) => {
  const { searchTerm, condition } = req.body;

  try{
    if(!searchTerm || !condition) {
      return res.status(400).json({ error: 'Search term and condition are required.' });
    }

    const encodedSearchTerm = encodeURIComponent(searchTerm);
    const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${condition}:${encodedSearchTerm}`);

    const books = response.data.items || [];
    res.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'An error occurred while fetching books.' });
  }
});

export default router
import express from 'express';
import bcrypt from 'bcrypt';
import { query } from '../db/index.js';
import { redirectIfLoggedIn } from '../middleware/authMiddleware.js';


const router = express.Router();

router.get('/login', redirectIfLoggedIn, (req, res) => {
  res.render('login');
});

router.get('/register', redirectIfLoggedIn, (req, res) => {
  res.render('register');
});

router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.redirect('/');
    });
});

router.post('/login' , redirectIfLoggedIn, async (req, res) => {
    const { username, password } = req.body;
    try {
        const { rows } = await query('SELECT * FROM users WHERE username = $1', [username]);
        if (rows.length === 0) {
            return res.status(401).send('Invalid username or password');
        }
        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).send('Invalid username or password');
        }
        req.session.user = { id: user.id, username: user.username };
        res.redirect('/books');
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/register', redirectIfLoggedIn, async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existingUser = await query('SELECT id FROM users WHERE username = $1 OR email = $2', [username, email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).send('Username or email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const { rows } = await query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username', 
            [username, email, hashedPassword]
        );
        req.session.user = { id: rows[0].id, username: rows[0].username };
        res.redirect('/books');
    } catch (err) {
        console.error('Registration error:', err);
        if (err.code === '23505') { 
            res.status(400).send('Username or email already exists');
        } else {
            res.status(500).send('Registration failed');
        }
    }
});

export default router;
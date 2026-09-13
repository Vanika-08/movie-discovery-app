const express = require('express');
const movies = require('./movies.routes');
const wishlist = require('./wishlist.routes');
const ctrl = require('../controllers/movies.controller');

const router = express.Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));
router.get('/genres', ctrl.genres);
router.use('/movies', movies);
router.use('/wishlist', wishlist);

module.exports = router;

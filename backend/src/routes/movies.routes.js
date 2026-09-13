const express = require('express');
const ctrl = require('../controllers/movies.controller');
const { parseListQuery, parseSearchQuery, parseIdParam } = require('../middleware/validate');

const router = express.Router();

router.get('/search', parseSearchQuery, ctrl.search);
router.get('/:id', parseIdParam, ctrl.details);
router.get('/', parseListQuery, ctrl.discover);

module.exports = router;

const express = require('express');
const ctrl = require('../controllers/wishlist.controller');

const router = express.Router();

router.get('/', ctrl.list);
router.post('/', ctrl.add);
router.delete('/:movieId', ctrl.remove);

module.exports = router;

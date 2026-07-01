const express = require('express');
const { getResult } = require('../controllers/resultController');
const router = express.Router();
router.get('/:challengeId', getResult);
module.exports = router;

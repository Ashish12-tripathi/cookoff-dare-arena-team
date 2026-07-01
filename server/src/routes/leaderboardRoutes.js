const express = require('express');
const { getLeaderboardByCampaign } = require('../controllers/leaderboardController');
const router = express.Router();
router.get('/:campaignId', getLeaderboardByCampaign);
module.exports = router;

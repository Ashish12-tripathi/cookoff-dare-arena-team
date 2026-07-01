const express = require('express');
const { getCampaignById, getActiveCampaign } = require('../controllers/campaignController');
const router = express.Router();
router.get('/active', getActiveCampaign);
router.get('/:campaignId', getCampaignById);
module.exports = router;

const express = require('express');
const { createChallenge, getChallengeById, acceptChallenge, addTeamMember } = require('../controllers/challengeController');
const router = express.Router();
router.post('/create', createChallenge);
router.get('/:challengeId', getChallengeById);
router.post('/:challengeId/accept', acceptChallenge);
router.post('/:challengeId/teams/:teamId/members', addTeamMember);
module.exports = router;

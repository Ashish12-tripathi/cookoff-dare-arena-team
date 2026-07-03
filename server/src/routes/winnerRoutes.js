const express = require("express");
const router = express.Router();

const {
  getWinnerByChallenge,
  getAllWinners,
} = require("../controllers/winnerController");

router.get("/", getAllWinners);
router.get("/:challengeId", getWinnerByChallenge);

module.exports = router;
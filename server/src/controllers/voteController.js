const Challenge = require("../models/Challenge");
const Campaign = require("../models/Campaign");
const Vote = require("../models/Vote");
const getClientIp = require("../utils/getClientIp");
const getRecommendations = require("../utils/productRecommendationMap");
const { normalizeContact, isValidContact } = require("../utils/contact");
const { closeChallengeIfExpired } = require("./challengeController");
const submitVote = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const {
      votedForId,
      votedForPlayerId,
      votedForTeamId,
      voterName,
      voterContact,
      browserId,
    } = req.body;
    const challenge = await Challenge.findOne({ challengeId });
    if (!challenge)
      return res
        .status(404)
        .json({ success: false, message: "Challenge not found" });
    await closeChallengeIfExpired(challenge);
    if (challenge.status === "closed")
      return res
        .status(400)
        .json({
          success: false,
          message: "Voting has ended. Winner is already declared.",
        });
    if (challenge.status !== "voting_open")
      return res
        .status(400)
        .json({
          success: false,
          message: "Voting is not open for this challenge",
        });
    const cleanVoterName = String(voterName || "").trim();
    const cleanContact = normalizeContact(voterContact);
    if (!cleanVoterName || cleanVoterName.length < 2)
      return res
        .status(400)
        .json({ success: false, message: "Please enter your name" });
    if (!cleanContact || !isValidContact(cleanContact))
      return res
        .status(400)
        .json({
          success: false,
          message: "Please enter a valid email or mobile number",
        });
    const targetId = votedForId || votedForPlayerId || votedForTeamId;
    if (!targetId)
      return res
        .status(400)
        .json({ success: false, message: "Please choose a dish/team to vote" });
    const targetType = challenge.mode === "team" ? "team" : "player";
    const target =
      targetType === "team"
        ? challenge.teams.find((t) => t.teamId === targetId)
        : challenge.players.find((p) => p.playerId === targetId);
    if (!target)
      return res
        .status(400)
        .json({ success: false, message: "Selected entry does not exist" });
    const existingVote = await Vote.findOne({
      challengeId,
      voterContact: cleanContact,
    });
    if (existingVote)
      return res
        .status(400)
        .json({
          success: false,
          message: "You have already voted in this challenge",
        });
    await Vote.create({
      challengeId,
      mode: challenge.mode,
      votedForId: targetId,
      votedForType: targetType,
      voterName: cleanVoterName,
      voterContact: cleanContact,
      browserId: browserId || "",
      voterIp: getClientIp(req),
    });
    if (targetType === "team")
      challenge.teams = challenge.teams.map((t) => {
        if (t.teamId === targetId) t.votes = (t.votes || 0) + 1;
        return t;
      });
    else
      challenge.players = challenge.players.map((p) => {
        if (p.playerId === targetId) p.votes = (p.votes || 0) + 1;
        return p;
      });
    await challenge.save();
    const campaign = await Campaign.findOne({
      campaignId: challenge.campaignId,
    });
    return res.json({
      success: true,
      message: "Vote submitted successfully",
      challenge,
      voterCoupon: campaign?.coupons?.voter || "VOTER10",
      recommendations: getRecommendations(challenge.dareThemeId),
    });
  } catch (error) {
    if (error.code === 11000)
      return res
        .status(400)
        .json({
          success: false,
          message: "You have already voted in this challenge",
        });
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to submit vote",
        error: error.message,
      });
  }
};
module.exports = { submitVote };

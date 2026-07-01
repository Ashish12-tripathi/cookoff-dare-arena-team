const Campaign = require("../models/Campaign");
const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      campaignId: req.params.campaignId,
    });
    if (!campaign)
      return res
        .status(404)
        .json({ success: false, message: "Campaign not found" });
    return res.json({ success: true, campaign });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to load campaign",
        error: error.message,
      });
  }
};
const getActiveCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({ isActive: true });
    if (!campaign)
      return res
        .status(404)
        .json({ success: false, message: "No active campaign found" });
    return res.json({ success: true, campaign });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to load active campaign",
        error: error.message,
      });
  }
};
module.exports = { getCampaignById, getActiveCampaign };

const crypto = require("crypto");
const Campaign = require("../models/Campaign");
const Challenge = require("../models/Challenge");
const generateChallengeId = require("../utils/generateChallengeId");
const buildShareLink = require("../utils/buildShareLink");
const { normalizeContact, isValidContact } = require("../utils/contact");

const id = () => crypto.randomBytes(5).toString("hex");

const clean = (value, limit = 120) => {
  return String(value || "").trim().slice(0, limit);
};

const validateEntry = (entry, mode) => {
  if (!entry) {
    return "Details are required";
  }

  if (mode === "team" && (!entry.teamName || entry.teamName.trim().length < 2)) {
    return "Team name is required";
  }

  if (!entry.name || entry.name.trim().length < 2) {
    return mode === "team" ? "Captain name is required" : "Name is required";
  }

  if (!entry.contact || !isValidContact(entry.contact)) {
    return "Valid email or mobile number is required";
  }

  if (!entry.dishName || entry.dishName.trim().length < 2) {
    return "Dish name is required";
  }

  if (!entry.story || entry.story.trim().length < 5) {
    return "Short story is required";
  }

  if (!entry.imageUrl) {
    return "Food photo is required";
  }

  return null;
};

const validateExtraMembers = (entry) => {
  const members = Array.isArray(entry.members) ? entry.members : [];
  const usedContacts = new Set([normalizeContact(entry.contact)]);

  for (const member of members) {
    if (!member.name || member.name.trim().length < 2) {
      return "Every team member must have a valid name.";
    }

    if (!member.contact || !isValidContact(member.contact)) {
      return "Every team member must have a valid email or mobile number.";
    }

    const memberContact = normalizeContact(member.contact);

    if (usedContacts.has(memberContact)) {
      return "Captain and all team members must use different email/mobile numbers.";
    }

    usedContacts.add(memberContact);
  }

  if (members.length > 5) {
    return "You can add up to 5 extra members. Captain is included automatically.";
  }

  return null;
};

const makePlayer = (entry, role) => ({
  playerId: id(),
  role,
  name: clean(entry.name, 60),
  contact: normalizeContact(entry.contact),
  dishName: clean(entry.dishName, 80),
  story: clean(entry.story, 240),
  imageUrl: entry.imageUrl,
  imagePublicId: entry.imagePublicId || "",
  votes: 0,
  joinedAt: new Date()
});

const makeTeam = (entry, role) => {
  const extraMembers = Array.isArray(entry.members) ? entry.members : [];

  const members = [
    {
      memberId: id(),
      name: clean(entry.name, 60),
      contact: normalizeContact(entry.contact),
      roleLabel: "Captain",
      joinedAt: new Date()
    },
    ...extraMembers.map((member) => ({
      memberId: id(),
      name: clean(member.name, 60),
      contact: normalizeContact(member.contact),
      roleLabel: clean(member.roleLabel || "Member", 30),
      joinedAt: new Date()
    }))
  ];

  return {
    teamId: id(),
    role,
    teamName: clean(entry.teamName, 60),
    captainName: clean(entry.name, 60),
    contact: normalizeContact(entry.contact),
    dishName: clean(entry.dishName, 80),
    story: clean(entry.story, 240),
    imageUrl: entry.imageUrl,
    imagePublicId: entry.imagePublicId || "",
    members,
    votes: 0,
    joinedAt: new Date()
  };
};

const closeChallengeIfExpired = async (challenge) => {
  if (
    challenge.status === "voting_open" &&
    challenge.votingEndsAt &&
    new Date(challenge.votingEndsAt) <= new Date()
  ) {
    if (challenge.mode === "team") {
      const sorted = [...challenge.teams].sort(
        (a, b) => (b.votes || 0) - (a.votes || 0)
      );

      challenge.winnerTeamId = sorted[0]?.teamId || "";
    } else {
      const sorted = [...challenge.players].sort(
        (a, b) => (b.votes || 0) - (a.votes || 0)
      );

      challenge.winnerPlayerId = sorted[0]?.playerId || "";
    }

    challenge.status = "closed";
    await challenge.save();
  }

  return challenge;
};

const createChallenge = async (req, res) => {
  try {
    const {
      campaignId,
      dareThemeId,
      creator,
      maxPlayers = 2,
      maxTeams = 2,
      mode = "solo"
    } = req.body;

    if (!["solo", "team"].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid game mode"
      });
    }

    if (!campaignId || !dareThemeId) {
      return res.status(400).json({
        success: false,
        message: "campaignId and dareThemeId are required"
      });
    }

    const entryError = validateEntry(creator, mode);

    if (entryError) {
      return res.status(400).json({
        success: false,
        message: entryError
      });
    }

    if (mode === "team") {
      const memberError = validateExtraMembers(creator);

      if (memberError) {
        return res.status(400).json({
          success: false,
          message: memberError
        });
      }
    }

    const campaign = await Campaign.findOne({
      campaignId,
      isActive: true
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Active campaign not found"
      });
    }

    const dareTheme = campaign.dareThemes.find(
      (theme) => theme.id === dareThemeId
    );

    if (!dareTheme) {
      return res.status(400).json({
        success: false,
        message: "Invalid dare theme"
      });
    }

    const challengeId = generateChallengeId();

    const base = {
      challengeId,
      mode,
      campaignId,
      dareThemeId,
      dareThemeTitle: dareTheme.title,
      productCollectionUrl: dareTheme.productCollectionUrl || "",
      status: "waiting_opponents"
    };

    let challenge;

    if (mode === "team") {
      const safeMaxTeams = Math.min(6, Math.max(2, Number(maxTeams) || 2));

      challenge = await Challenge.create({
        ...base,
        maxTeams: safeMaxTeams,
        teams: [makeTeam(creator, "creator")]
      });
    } else {
      const safeMaxPlayers = Math.min(6, Math.max(2, Number(maxPlayers) || 2));

      challenge = await Challenge.create({
        ...base,
        maxPlayers: safeMaxPlayers,
        players: [makePlayer(creator, "creator")]
      });
    }

    return res.status(201).json({
      success: true,
      message: "Challenge created successfully",
      challenge,
      shareLink: buildShareLink(challenge.challengeId),
      votingLink: buildShareLink(challenge.challengeId, "vote")
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create challenge",
      error: error.message
    });
  }
};

const getChallengeById = async (req, res) => {
  try {
    let challenge = await Challenge.findOne({
      challengeId: req.params.challengeId
    });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: "Challenge not found"
      });
    }

    challenge = await closeChallengeIfExpired(challenge);

    const campaign = await Campaign.findOne({
      campaignId: challenge.campaignId
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found"
      });
    }

    return res.json({
      success: true,
      challenge,
      campaign,
      shareLink: buildShareLink(challenge.challengeId),
      votingLink: buildShareLink(challenge.challengeId, "vote")
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load challenge",
      error: error.message
    });
  }
};

const acceptChallenge = async (req, res) => {
  try {
    const { opponent } = req.body;

    const challenge = await Challenge.findOne({
      challengeId: req.params.challengeId
    });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: "Challenge not found"
      });
    }

    const entryError = validateEntry(opponent, challenge.mode);

    if (entryError) {
      return res.status(400).json({
        success: false,
        message: entryError
      });
    }

    if (challenge.mode === "team") {
      const memberError = validateExtraMembers(opponent);

      if (memberError) {
        return res.status(400).json({
          success: false,
          message: memberError
        });
      }
    }

    if (challenge.status !== "waiting_opponents") {
      return res.status(400).json({
        success: false,
        message: "This challenge is not accepting new players now"
      });
    }

    const contact = normalizeContact(opponent.contact);

    const campaign = await Campaign.findOne({
      campaignId: challenge.campaignId
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found"
      });
    }

    if (challenge.mode === "team") {
      if (challenge.teams.length >= challenge.maxTeams) {
        return res.status(400).json({
          success: false,
          message: "This challenge already has all teams"
        });
      }

      const allIncomingContacts = [
        contact,
        ...(Array.isArray(opponent.members)
          ? opponent.members.map((member) => normalizeContact(member.contact))
          : [])
      ];

      const alreadyJoined = allIncomingContacts.some((incomingContact) =>
        challenge.teams.some(
          (team) =>
            normalizeContact(team.contact) === incomingContact ||
            team.members.some(
              (member) => normalizeContact(member.contact) === incomingContact
            )
        )
      );

      if (alreadyJoined) {
        return res.status(400).json({
          success: false,
          message: "One of these contacts already joined this challenge."
        });
      }

      challenge.teams.push(makeTeam(opponent, "opponent"));

      if (challenge.teams.length >= challenge.maxTeams) {
        challenge.status = "voting_open";
        challenge.votingEndsAt = new Date(Date.now() + 12 * 60 * 60 * 1000);
      }
    } else {
      if (challenge.players.length >= challenge.maxPlayers) {
        return res.status(400).json({
          success: false,
          message: "This challenge already has all players"
        });
      }

      if (
        challenge.players.some(
          (player) => normalizeContact(player.contact) === contact
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "You have already joined this challenge. Creator cannot accept their own challenge."
        });
      }

      challenge.players.push(makePlayer(opponent, "opponent"));

      if (challenge.players.length >= challenge.maxPlayers) {
        challenge.status = "voting_open";
        challenge.votingEndsAt = new Date(Date.now() + 12 * 60 * 60 * 1000);
      }
    }

    await challenge.save();

    return res.json({
      success: true,
      message:
        challenge.status === "voting_open"
          ? "All joined. Voting is now open."
          : "Joined. Waiting for more players/teams.",
      challenge,
      shareLink: buildShareLink(challenge.challengeId),
      votingLink: buildShareLink(challenge.challengeId, "vote")
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to accept challenge",
      error: error.message
    });
  }
};

const addTeamMember = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { name, contact, roleLabel = "Member" } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Member name is required"
      });
    }

    if (!contact || !isValidContact(contact)) {
      return res.status(400).json({
        success: false,
        message: "Valid email or mobile number is required"
      });
    }

    const challenge = await Challenge.findOne({
      challengeId: req.params.challengeId
    });

    if (!challenge || challenge.mode !== "team") {
      return res.status(404).json({
        success: false,
        message: "Team challenge not found"
      });
    }

    const cleanContact = normalizeContact(contact);

    if (
      challenge.teams.some(
        (team) =>
          normalizeContact(team.contact) === cleanContact ||
          team.members.some(
            (member) => normalizeContact(member.contact) === cleanContact
          )
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "This contact already joined a team."
      });
    }

    const team = challenge.teams.find((item) => item.teamId === teamId);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }

    if (team.members.length >= 6) {
      return res.status(400).json({
        success: false,
        message: "Team already has maximum members"
      });
    }

    team.members.push({
      memberId: id(),
      name: clean(name, 60),
      contact: normalizeContact(contact),
      roleLabel: clean(roleLabel, 30),
      joinedAt: new Date()
    });

    await challenge.save();

    return res.json({
      success: true,
      challenge
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add team member",
      error: error.message
    });
  }
};

module.exports = {
  createChallenge,
  getChallengeById,
  acceptChallenge,
  addTeamMember,
  closeChallengeIfExpired
};
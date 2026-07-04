const crypto = require("crypto");
const Campaign = require("../models/Campaign");
const Winner = require("../models/Winner");
const Challenge = require("../models/Challenge");
const Vote = require("../models/Vote");
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
  joinedAt: new Date(),
});

const makeTeam = (entry, role) => {
  const extraMembers = Array.isArray(entry.members) ? entry.members : [];

  const members = [
    {
      memberId: id(),
      name: clean(entry.name, 60),
      contact: normalizeContact(entry.contact),
      roleLabel: "Captain",
      joinedAt: new Date(),
    },
    ...extraMembers.map((member) => ({
      memberId: id(),
      name: clean(member.name, 60),
      contact: normalizeContact(member.contact),
      roleLabel: clean(member.roleLabel || "Member", 30),
      joinedAt: new Date(),
    })),
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
    joinedAt: new Date(),
  };
};

const getWinnerFromChallenge = (challenge) => {
  if (!challenge) return null;

  const isTeamMode = challenge.mode === "team";
  const entries = isTeamMode ? challenge.teams || [] : challenge.players || [];

  if (!entries.length) return null;

  const rankedEntries = [...entries].sort(
    (a, b) => Number(b.votes || 0) - Number(a.votes || 0)
  );

  const winner = rankedEntries[0];

  if (!winner) return null;

  const totalVotes = Number(winner.votes || 0);

  if (totalVotes <= 0) {
    return null;
  }

  if (isTeamMode) {
    return {
      winnerType: "team",
      winnerId: winner.teamId,
      winnerName: winner.teamName,
      dishName: winner.dishName || "",
      imageUrl: winner.imageUrl || "",
      totalVotes,
      captainName: winner.captainName || "",
      captainContact: winner.contact || "",
      playerName: "",
      playerContact: "",
    };
  }

  return {
    winnerType: "player",
    winnerId: winner.playerId,
    winnerName: winner.name,
    dishName: winner.dishName || "",
    imageUrl: winner.imageUrl || "",
    totalVotes,
    captainName: "",
    captainContact: "",
    playerName: winner.name || "",
    playerContact: winner.contact || "",
  };
};

const saveWinnerRecord = async (challenge) => {
  if (!challenge) return null;

  const winnerData = getWinnerFromChallenge(challenge);

  if (!winnerData || !winnerData.winnerId) {
    return null;
  }

  const isTeamMode = challenge.mode === "team";
  const winnerId = String(winnerData.winnerId);

  const challengeIdValues = [
    challenge._id,
    String(challenge._id),
    challenge.challengeId,
  ].filter(Boolean);

  const voteTargetConditions = isTeamMode
    ? [
        { votedForTeamId: winnerId },
        { votedForEntryId: winnerId },
        { votedForId: winnerId },
        { votedFor: winnerId },
      ]
    : [
        { votedForPlayerId: winnerId },
        { votedForEntryId: winnerId },
        { votedForId: winnerId },
        { votedFor: winnerId },
      ];

  const winnerVotes = await Vote.find({
    challengeId: { $in: challengeIdValues },
    $or: voteTargetConditions,
  })
    .select(
      "voterName voterContact voterEmail voterPhone email phone mobile contact createdAt"
    )
    .sort({ createdAt: 1 })
    .lean();

  const winnerVoters = winnerVotes.map((vote) => ({
    voterName: vote.voterName || "",
    voterContact:
      vote.voterContact ||
      vote.voterEmail ||
      vote.voterPhone ||
      vote.email ||
      vote.phone ||
      vote.mobile ||
      vote.contact ||
      "",
    votedAt: vote.createdAt || new Date(),
  }));

  const winnerPayload = {
    challengeId: challenge._id,
    publicChallengeId: challenge.challengeId || "",
    campaignId: challenge.campaignId,
    mode: challenge.mode || "solo",
    winnerType: winnerData.winnerType,
    winnerId,
    winnerName: winnerData.winnerName || "Winner",
    dishName: winnerData.dishName || "",
    imageUrl: winnerData.imageUrl || "",
    totalVotes: winnerData.totalVotes || 0,

    captainName: winnerData.captainName || "",
    captainContact: winnerData.captainContact || "",

    playerName: winnerData.playerName || "",
    playerContact: winnerData.playerContact || "",

    winnerVoters,
    winnerVoterCount: winnerVoters.length,

    rewardStatus: "pending",
    contactInstruction:
      "Congratulations! You are the cook-off winner. Please contact OmiChef support to collect your special reward.",
    declaredAt: new Date(),
  };

  const savedWinner = await Winner.findOneAndUpdate(
    {
      challengeId: challenge._id,
      winnerId,
    },
    {
      $set: winnerPayload,
    },
    {
      new: true,
      upsert: true,
    }
  );

  return savedWinner;
};

const closeChallengeIfExpired = async (challenge) => {
  if (
    challenge.status === "voting_open" &&
    challenge.votingEndsAt &&
    new Date(challenge.votingEndsAt) <= new Date()
  ) {
    const savedWinner = await saveWinnerRecord(challenge);

    if (savedWinner) {
      if (savedWinner.winnerType === "team") {
        challenge.winnerTeamId = savedWinner.winnerId;
      } else {
        challenge.winnerPlayerId = savedWinner.winnerId;
      }
    } else if (challenge.mode === "team") {
      const sorted = [...challenge.teams].sort(
        (a, b) => Number(b.votes || 0) - Number(a.votes || 0)
      );

      challenge.winnerTeamId = sorted[0]?.teamId || "";
    } else {
      const sorted = [...challenge.players].sort(
        (a, b) => Number(b.votes || 0) - Number(a.votes || 0)
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
      mode = "solo",
    } = req.body;

    if (!["solo", "team"].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid game mode",
      });
    }

    if (!campaignId || !dareThemeId) {
      return res.status(400).json({
        success: false,
        message: "campaignId and dareThemeId are required",
      });
    }

    const entryError = validateEntry(creator, mode);

    if (entryError) {
      return res.status(400).json({
        success: false,
        message: entryError,
      });
    }

    if (mode === "team") {
      const memberError = validateExtraMembers(creator);

      if (memberError) {
        return res.status(400).json({
          success: false,
          message: memberError,
        });
      }
    }

    const campaign = await Campaign.findOne({
      campaignId,
      isActive: true,
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Active campaign not found",
      });
    }

    const dareTheme = campaign.dareThemes.find(
      (theme) => theme.id === dareThemeId
    );

    if (!dareTheme) {
      return res.status(400).json({
        success: false,
        message: "Invalid dare theme",
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
      status: "waiting_opponents",
    };

    let challenge;

    if (mode === "team") {
      const safeMaxTeams = Math.min(6, Math.max(2, Number(maxTeams) || 2));

      challenge = await Challenge.create({
        ...base,
        maxTeams: safeMaxTeams,
        teams: [makeTeam(creator, "creator")],
      });
    } else {
      const safeMaxPlayers = Math.min(6, Math.max(2, Number(maxPlayers) || 2));

      challenge = await Challenge.create({
        ...base,
        maxPlayers: safeMaxPlayers,
        players: [makePlayer(creator, "creator")],
      });
    }

    return res.status(201).json({
      success: true,
      message: "Challenge created successfully",
      challenge,
      shareLink: buildShareLink(challenge.challengeId),
      votingLink: buildShareLink(challenge.challengeId, "vote"),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create challenge",
      error: error.message,
    });
  }
};

const getChallengeById = async (req, res) => {
  try {
    let challenge = await Challenge.findOne({
      challengeId: req.params.challengeId,
    });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: "Challenge not found",
      });
    }

    challenge = await closeChallengeIfExpired(challenge);

    const campaign = await Campaign.findOne({
      campaignId: challenge.campaignId,
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    const winnerRecord = await Winner.findOne({
      challengeId: challenge._id,
    }).lean();

    return res.json({
      success: true,
      challenge,
      campaign,
      winnerRecord,
      shareLink: buildShareLink(challenge.challengeId),
      votingLink: buildShareLink(challenge.challengeId, "vote"),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load challenge",
      error: error.message,
    });
  }
};

const acceptChallenge = async (req, res) => {
  try {
    const { opponent } = req.body;

    const challenge = await Challenge.findOne({
      challengeId: req.params.challengeId,
    });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: "Challenge not found",
      });
    }

    const entryError = validateEntry(opponent, challenge.mode);

    if (entryError) {
      return res.status(400).json({
        success: false,
        message: entryError,
      });
    }

    if (challenge.mode === "team") {
      const memberError = validateExtraMembers(opponent);

      if (memberError) {
        return res.status(400).json({
          success: false,
          message: memberError,
        });
      }
    }

    if (challenge.status !== "waiting_opponents") {
      return res.status(400).json({
        success: false,
        message: "This challenge is not accepting new players now",
      });
    }

    const contact = normalizeContact(opponent.contact);

    const campaign = await Campaign.findOne({
      campaignId: challenge.campaignId,
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    if (challenge.mode === "team") {
      if (challenge.teams.length >= challenge.maxTeams) {
        return res.status(400).json({
          success: false,
          message: "This challenge already has all teams",
        });
      }

      const allIncomingContacts = [
        contact,
        ...(Array.isArray(opponent.members)
          ? opponent.members.map((member) => normalizeContact(member.contact))
          : []),
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
          message: "One of these contacts already joined this challenge.",
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
          message: "This challenge already has all players",
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
            "You have already joined this challenge. Creator cannot accept their own challenge.",
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
      votingLink: buildShareLink(challenge.challengeId, "vote"),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to accept challenge",
      error: error.message,
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
        message: "Member name is required",
      });
    }

    if (!contact || !isValidContact(contact)) {
      return res.status(400).json({
        success: false,
        message: "Valid email or mobile number is required",
      });
    }

    const challenge = await Challenge.findOne({
      challengeId: req.params.challengeId,
    });

    if (!challenge || challenge.mode !== "team") {
      return res.status(404).json({
        success: false,
        message: "Team challenge not found",
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
        message: "This contact already joined a team.",
      });
    }

    const team = challenge.teams.find((item) => item.teamId === teamId);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    if (team.members.length >= 6) {
      return res.status(400).json({
        success: false,
        message: "Team already has maximum members",
      });
    }

    team.members.push({
      memberId: id(),
      name: clean(name, 60),
      contact: normalizeContact(contact),
      roleLabel: clean(roleLabel, 30),
      joinedAt: new Date(),
    });

    await challenge.save();

    return res.json({
      success: true,
      challenge,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add team member",
      error: error.message,
    });
  }
};

module.exports = {
  createChallenge,
  getChallengeById,
  acceptChallenge,
  addTeamMember,
  closeChallengeIfExpired,
};
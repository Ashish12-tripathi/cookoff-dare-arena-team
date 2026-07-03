const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const campaignRoutes = require("./routes/campaignRoutes");
const challengeRoutes = require("./routes/challengeRoutes");
const voteRoutes = require("./routes/voteRoutes");
const resultRoutes = require("./routes/resultRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const winnerRoutes = require("./routes/winnerRoutes");
dotenv.config();
const app = express();
app.use(cors(corsOptions));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) =>
  res.json({
    success: true,
    message: "Cook-Off Dare Arena backend is running",
  }),
);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/winners", winnerRoutes);
app.use((req, res) =>
  
  res
    .status(404)
    .json({
      success: false,
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    }),
);
module.exports = app;

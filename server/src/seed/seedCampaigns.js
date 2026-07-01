const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Campaign = require("../models/Campaign");
dotenv.config();
const campaigns = [
  {
    campaignId: "family-cookoff-2026",
    title: "OmiChef Cook-Off Dare Arena",
    subtitle:
      "Create your dish, invite players or teams, collect votes, and unlock OmiChef rewards.",
    isActive: true,
    votingDurationHours: 12,
    whatsappMessage:
      "I challenge you to an OmiChef Cook-Off Dare. Join, cook, and let people vote who wins!",
    recipeUrl: "/blogs/recipes",
    coupons: { winner: "COOKWIN500", runner: "RUNNER15", voter: "VOTER10" },
    dareThemes: [
      {
        id: "maggi",
        title: "Fastest Maggi Upgrade",
        description: "Turn simple Maggi into something crave-worthy.",
        productCollectionUrl: "/collections/saucepans",
      },
      {
        id: "snack",
        title: "Best Chai Snack",
        description: "Make the perfect snack to pair with chai.",
        productCollectionUrl: "/collections/frying-pan",
      },
      {
        id: "paneer",
        title: "Best Paneer Dish",
        description: "Show off your best paneer creation.",
        productCollectionUrl: "/collections/kadai",
      },
      {
        id: "breakfast",
        title: "Best Breakfast Plate",
        description: "Build a breakfast plate worth voting for.",
        productCollectionUrl: "/collections/tawa",
      },
      {
        id: "family",
        title: "Best Family Meal",
        description: "Cook a dish made for sharing at home.",
        productCollectionUrl: "/collections/cookware-sets",
      },
    ],
  },
];
const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Campaign.deleteMany({});
    await Campaign.insertMany(campaigns);
    console.log("Campaigns seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};
seed();

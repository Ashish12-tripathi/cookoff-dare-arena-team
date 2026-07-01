const map = {
  maggi: [
    {
      title: "Nonstick Saucepan",
      description: "Perfect for quick noodles and sauces.",
      url: "/collections/saucepans",
    },
    {
      title: "Silicone Spatula",
      description: "Easy stirring without scratching cookware.",
      url: "/collections/accessories",
    },
  ],
  snack: [
    {
      title: "Snack Kadai",
      description: "For crispy pakoras, poha, and chai snacks.",
      url: "/collections/kadai",
    },
    {
      title: "Frying Pan",
      description: "For toasties, omelettes, and quick bites.",
      url: "/collections/frying-pan",
    },
  ],
  paneer: [
    {
      title: "Deep Kadai",
      description: "Best for paneer curry and family meals.",
      url: "/collections/kadai",
    },
    {
      title: "Saute Pan",
      description: "Great for stir-fry and rich gravies.",
      url: "/collections/pans",
    },
  ],
  breakfast: [
    {
      title: "Tawa",
      description: "For dosa, paratha, pancakes, and breakfast plates.",
      url: "/collections/tawa",
    },
  ],
  family: [
    {
      title: "Cookware Set",
      description: "Everything needed for everyday family cooking.",
      url: "/collections/cookware-sets",
    },
  ],
};
module.exports = (id) => map[id] || map.family;

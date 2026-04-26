// @ts-check

/**
 * Universal Product Catalog - The Source of Truth for Taqelah products.
 */
module.exports = {
  // Sorting Anchors (Top results for each mode)
  anchors: {
    cheapest: { 
      name: "Casual Sundress", 
      price: "$49.99",
      regexPrice: /\$49\.99/
    },
    mostExpensive: { 
      name: "Champagne Gown", 
      price: "$319.99",
      regexPrice: /\$319\.99/
    },
    alphaFirst: { 
      name: "Black Sequin Mini", 
      price: "$119.99",
      regexAlpha: /Black Sequin Mini/
    },
    alphaLast: { 
      name: "Yellow Sundress", 
      price: "$54.99",
      regexAlpha: /Yellow Sundress/
    }
  },

  // Category Configuration
  categories: {
    casual: { name: "Casual", count: 8, subtitle: "Everyday comfort & style" },
    evening: { name: "Evening", count: 8, subtitle: "Elegant gowns & formal wear" },
    party: { name: "Party", count: 8, subtitle: "Cocktail & party dresses" },
    boho: { name: "Boho", count: 8, subtitle: "Free-spirited & artistic" }
  },

  // Global Metadata
  catalog: {
    totalItems: 32,
    pageSize: 6 // Based on mobile viewport observation
  }
};

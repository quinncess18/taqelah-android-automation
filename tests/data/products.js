// @ts-check

/**
 * Universal Product Catalog - The Source of Truth for Taqelah products.
 * Categorized and verified against the UI dump.
 */
module.exports = {
  // Sorting Anchors (Top results for each mode in 'All Dresses')
  anchors: {
    cheapest: { name: "Casual Sundress", price: "$49.99" },
    mostExpensive: { name: "Champagne Gown", price: "$319.99" },
    alphaFirst: { name: "Black Sequin Mini", price: "$119.99" },
    alphaLast: { name: "Yellow Sundress", price: "$54.99" }
  },

  // Category Configuration - 100% accurate to UI Dump headers
  categories: {
    casual: { 
      name: "Casual Dresses", 
      count: 8, 
      products: [
        { name: "Casual Sundress", price: "$49.99" },
        { name: "Denim Dress", price: "$74.99" },
        { name: "Floral Maxi Dress", price: "$89.99" },
        { name: "Rust Linen Dress", price: "$72.99" },
        { name: "Sage Midi Dress", price: "$69.99" },
        { name: "Shirt Dress", price: "$79.99" },
        { name: "White Linen Dress", price: "$64.99" },
        { name: "Yellow Sundress", price: "$54.99" }
      ],
      anchors: {
        cheapest: "$49.99",
        mostExpensive: "$89.99",
        alphaFirst: "Casual Sundress",
        alphaLast: "Yellow Sundress"
      }
    },
    evening: { 
      name: "Evening Dresses", 
      count: 8, 
      products: [
        { name: "Burgundy Velvet Dress", price: "$189.99" },
        { name: "Champagne Gown", price: "$319.99" },
        { name: "Coral Maxi Dress", price: "$169.99" },
        { name: "Mauve Silk Dress", price: "$229.99" },
        { name: "Peach Bridesmaid Dress", price: "$159.99" },
        { name: "Red Evening Dress", price: "$279.99" },
        { name: "Rose Satin Gown", price: "$299.99" },
        { name: "Satin Evening Gown", price: "$249.99" }
      ],
      anchors: {
        cheapest: "$159.99",
        mostExpensive: "$319.99",
        alphaFirst: "Burgundy Velvet Dress",
        alphaLast: "Satin Evening Gown"
      }
    },
    party: { 
      name: "Party Dresses", 
      count: 8, 
      products: [
        { name: "Black Sequin Mini", price: "$119.99" },
        { name: "Copper Sequin Dress", price: "$134.99" },
        { name: "Gold Party Dress", price: "$139.99" },
        { name: "Lace Cocktail Dress", price: "$159.99" },
        { name: "Little Black Dress", price: "$129.99" },
        { name: "Mint Cocktail Dress", price: "$109.99" },
        { name: "Navy Cocktail Dress", price: "$149.99" },
        { name: "Rose Gold Mini", price: "$124.99" }
      ],
      anchors: {
        cheapest: "$109.99",
        mostExpensive: "$159.99",
        alphaFirst: "Black Sequin Mini",
        alphaLast: "Rose Gold Mini"
      }
    },
    boho: { 
      name: "Boho Dresses", 
      count: 8, 
      products: [
        { name: "Boho Wrap Dress", price: "$69.99" },
        { name: "Crochet White Dress", price: "$94.99" },
        { name: "Emerald Wrap Dress", price: "$84.99" },
        { name: "Lavender Tulle Skirt", price: "$69.99" },
        { name: "Olive Shirt Dress", price: "$89.99" },
        { name: "Pleated Midi Skirt", price: "$59.99" },
        { name: "Terracotta Boho Dress", price: "$99.99" },
        { name: "Turquoise Print Dress", price: "$79.99" }
      ],
      anchors: {
        cheapest: "$59.99",
        mostExpensive: "$99.99",
        alphaFirst: "Boho Wrap Dress",
        alphaLast: "Turquoise Print Dress"
      }
    }
  },

  // Global Metadata
  catalog: {
    totalItems: 32,
    pageSize: 6 
  }
};

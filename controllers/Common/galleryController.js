// controllers/galleryController.js
const Gallery = require('../../model/galleryModel');

// Get gallery items by category (only active ones)
const getGalleryByCategory = async (req, res) => {
  try {
    let { category } = req.params;
    console.log("Reached the get function", category);
    const validCategories = ['all', 'storage', 'moving'];

    if (!validCategories.includes(category)) {
      return res.status(400).json({ success: false, error: 'Invalid category' });
    }

    if (category === 'all') {
      category = { $in: ['storage', 'moving'] };
    }

    const galleryItems = await Gallery.find({
      isActive: true,
      category
    }).sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      category,
      items: galleryItems
    });
  } catch (error) {
    console.log("Error fetching gallery items:", error);
    console.error('Error fetching gallery items:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};


module.exports = {
  getGalleryByCategory,
};
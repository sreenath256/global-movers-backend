// controllers/galleryController.js
const Gallery = require('../../model/galleryModel');

// Get all categories with item counts
const getGalleryCategories = async (req, res) => {
  try {
    const categories = await Gallery.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          latestItem: { $last: '$$ROOT' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const categoryData = categories.map(cat => ({
      name: cat._id,
      displayName: cat._id.charAt(0).toUpperCase() + cat._id.slice(1),
      count: cat.count,
      previewImage: cat.latestItem?.image || null
    }));

    // Ensure all categories are returned, even if empty
    const allCategories = ['awards', 'inaugurations', 'events'];
    allCategories.forEach(catName => {
      if (!categoryData.find(cat => cat.name === catName)) {
        categoryData.push({
          name: catName,
          displayName: catName.charAt(0).toUpperCase() + catName.slice(1),
          count: 0,
          previewImage: null
        });
      }
    });

    res.status(200).json({
      success: true,
      categories: categoryData.sort((a, b) => a.name.localeCompare(b.name))
    });
  } catch (error) {
    console.error('Error fetching gallery categories:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get gallery items by category (only active ones)
const getGalleryByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const validCategories = ['storage', 'moving'];

    if (!validCategories.includes(category)) {
      return res.status(400).json({ success: false, error: 'Invalid category' });
    }

    const galleryItems = await Gallery.find({
      category,
      isActive: true
    }).sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      category,
      items: galleryItems
    });
  } catch (error) {
    console.error('Error fetching gallery items:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add multiple gallery items
const addGalleryItems = async (req, res) => {
  try {

    console.log("Call recived");
    const { category } = req.body;
    const files = req.files;
    console.log("Files:", files);

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one image is required' });
    }

    if (!category) {
      return res.status(400).json({ success: false, error: 'Category is required' });
    }

    // Get the highest order number for this category
    const highestOrderItem = await Gallery.findOne({ category })
      .sort({ order: -1 })
      .select('order');

    let currentOrder = (highestOrderItem?.order || 0) + 1;

    // Create gallery items for each file
    const galleryItems = [];

    for (const file of files) {
      const imageUrl = `${process.env.R2_PUBLIC_ENDPOINT}/${encodeURIComponent(file.key)}`;

      // Use filename as title (remove extension)
      const title = file.originalname.replace(/\.[^/.]+$/, "");

      const galleryItem = await Gallery.create({
        title,
        category,
        image: imageUrl,
        order: currentOrder
      });

      galleryItems.push(galleryItem);
      currentOrder++;
    }

    console.log("Category:", category);
    console.log("Gallery Items:", galleryItems);

    res.status(201).json({
      success: true,
      message: `${files.length} gallery items added successfully`,
      items: galleryItems
    });
  } catch (error) {
    console.error('Error adding gallery items:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// Update gallery order (drag & drop)
const updateGalleryOrder = async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, order }

    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, error: 'Items array is required' });
    }

    const bulkOps = items.map(item => ({
      updateOne: {
        filter: { _id: item.id, isActive: true },
        update: { order: item.order }
      }
    }));

    const result = await Gallery.bulkWrite(bulkOps);

    res.status(200).json({
      success: true,
      message: 'Gallery order updated successfully',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error updating gallery order:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete gallery item (soft delete)
const deleteGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedItem = await Gallery.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!deletedItem) {
      return res.status(404).json({ success: false, error: 'Gallery item not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Gallery item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = {
  getGalleryCategories,
  getGalleryByCategory,
  addGalleryItems,
  updateGalleryOrder,
  deleteGalleryItem
};
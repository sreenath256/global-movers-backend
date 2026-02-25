const express = require("express");
const upload = require("../middleware/upload");
const { getBlogs, getBlog, deleteBlog, updateBlog, addBlog } = require("../controllers/admin/blogController");
const { getGalleryByCategory,  updateGalleryOrder, deleteGalleryItem, updateGalleryItem, addGalleryItems } = require("../controllers/admin/galleryController");

const router = express.Router();




// Blogs controller functions mounting them to corresponding route
router.get("/blogs", getBlogs);
router.get("/blog/:id", getBlog);
router.delete("/blog/:id", deleteBlog);
router.patch("/blog/:id", upload.any(), updateBlog);
router.post("/blog", upload.single('primaryImage'), addBlog);





// Get all categories with counts

router.get('/gallery/:category', getGalleryByCategory);
router.post('/gallery', upload.array('images', 100), addGalleryItems);
router.put('/gallery/order', updateGalleryOrder);
router.delete('/gallery/:id', deleteGalleryItem);




module.exports = router;

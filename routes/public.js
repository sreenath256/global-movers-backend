const express = require("express");
const { getBlogs, getBlog } = require("../controllers/Common/blogController");
const { getGalleryByCategory } = require("../controllers/Common/galleryController");


const router = express.Router();

router.get("/blogs", getBlogs);
router.get("/blog/:id", getBlog);

router.get("/gallery/:category", getGalleryByCategory)

// Public Routes can be added here

module.exports = router;

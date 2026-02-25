const Blog = require("../../model/blogModel");
const mongoose = require("mongoose");

// ✅ controllers/blogController.js
const getBlogs = async (req, res) => {
    try {
        const {
            search,
            category,
        } = req.query;

        const filter = {
            isActive: true, // ✅ only active blogs
        };


        if (search) {
            filter.name = { $regex: new RegExp(search, "i") };
        }

        // ✅ Filter by category (case-insensitive)
        if (category && category !== 'all') {
            filter.categories = { $in: [new RegExp(category, "i")] };
        }


        const blogs = await Blog.find(filter, {
            verticalImages: 0,
            horizontalImages: 0,
            content: 0,
        }).sort({ createdAt: -1 })  // 👈 Sort by latest first




        res.status(200).json({ blogs });
    } catch (error) {
        console.log("Error", error)
        res.status(400).json({ error: error.message });
    }
};


// Get single Blog
const getBlog = async (req, res) => {
    try {
        const { id } = req.params;

        // if (!mongoose.Types.ObjectId.isValid(id)) {
        //   throw Error("Invalid ID!!!");
        // }

        console.log("ID", id);

        const blog = await Blog.findOne({ slug: id });
        console.log("Blog", blog);

        if (!blog) {
            throw Error("No Such Blog");
        }

        res.status(200).json({ blog });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};



module.exports = {
    getBlogs,
    getBlog,

};

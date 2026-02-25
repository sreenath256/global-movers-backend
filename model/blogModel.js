const mongoose = require("mongoose");
const { Schema } = mongoose;
const { extractAndUploadBase64Images } = require("../utils/imageOptimizer");


const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    titleForInnerPage: {
      type: String,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true
    },
    metaTitle: {
      type: String,
      trim: true
    },
    metaDescription: {
      type: String,
      trim: true
    },
    imageAltText: {
      type: String,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    primaryImage: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },

  },
  { timestamps: true }
);

// Auto-optimize images before saving
blogSchema.pre('save', async function (next) {
  if (this.isModified('content') && this.content && this.content.includes('data:image')) {
    console.log('🔄 Optimizing images in blog content...');
    this.content = await extractAndUploadBase64Images(this.content);
  }
  next();
});

// Pre-save middleware to generate slug from title
blogSchema.pre('save', function (next) {
  if (this.isModified('title') || this.isNew) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .replace(/-+/g, '-')      // Replace multiple hyphens with single
      .trim()

  }
  next();
});

// Add indexes for better performance
blogSchema.index({ slug: 1 });
blogSchema.index({ isActive: 1, createdAt: -1 });


const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
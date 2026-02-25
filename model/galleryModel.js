// models/Gallery.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const gallerySchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['storage', 'moving'],
    lowercase: true
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

// Add indexes for better performance
gallerySchema.index({ category: 1, order: 1 });
gallerySchema.index({ isActive: 1 });
gallerySchema.index({ category: 1, isActive: 1 });

const Gallery = mongoose.model('Gallery', gallerySchema);
module.exports = Gallery;
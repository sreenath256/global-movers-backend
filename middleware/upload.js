// r2Upload.js
const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");
require("dotenv").config();

// R2 S3-Compatible Client
const s3 = new S3Client({
  region: "auto", // R2 doesn't use traditional AWS regions
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.R2_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const fileName = `${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for the primary image
    fieldSize: 50 * 1024 * 1024, // 50MB for text fields (for base64 images in content)
  },
  fileFilter: function (req, file, cb) {
    // Only apply file filter to actual file uploads, not text fields
    if (file.fieldname === 'primaryImage') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for primaryImage!'), false);
      }
    } else {
      // For non-file fields, always allow
      cb(null, true);
    }
  }
});

module.exports = upload;

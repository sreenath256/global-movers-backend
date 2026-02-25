const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const uploadBase64ToStorage = async (base64Data, filename, contentType = 'image/png') => {
  try {
    const base64String = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64String, 'base64');
    
    const uploadParams = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: filename,
      Body: buffer,
      ContentType: contentType,
    };

    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);
    
    const publicUrl = `${process.env.R2_PUBLIC_ENDPOINT}/${filename}`;
    return publicUrl;
  } catch (error) {
    console.error('Error uploading base64 image:', error);
    return null;
  }
};

const extractAndUploadBase64Images = async (content) => {
  try {
    if (!content || !content.includes('data:image')) {
      return content;
    }

    const base64Regex = /data:image\/(png|jpeg|jpg|gif|webp|bmp);base64,([^"'\s>]+)/gi;
    let matches;
    let updatedContent = content;
    let uploadPromises = [];

    while ((matches = base64Regex.exec(content)) !== null) {
      const imageType = matches[1];
      const base64Data = matches[0];
      const pureBase64 = matches[2];
      
      const filename = `blog-images/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${imageType}`;
      const contentType = `image/${imageType}`;

      const uploadPromise = uploadBase64ToStorage(pureBase64, filename, contentType)
        .then(imageUrl => {
          if (imageUrl) {
            updatedContent = updatedContent.replace(base64Data, imageUrl);
          }
          return imageUrl;
        });

      uploadPromises.push(uploadPromise);
    }

    if (uploadPromises.length > 0) {
      await Promise.all(uploadPromises);
      console.log(`✅ Optimized ${uploadPromises.length} images in blog content`);
    }

    return updatedContent;
  } catch (error) {
    console.error('Error optimizing images:', error);
    return content;
  }
};

module.exports = { extractAndUploadBase64Images };
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'recipe-app',
      use_filename: true,
      unique_filename: false
    });
    return result.secure_url;
  } catch (error) {
    throw new Error('Cloudinary upload failed');
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new Error('Cloudinary delete failed');
  }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };
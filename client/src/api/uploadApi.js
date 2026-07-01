import axios from "axios";
import { compressImage } from "../utils/compressImage";
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const MAX_ORIGINAL_FILE_SIZE = 8 * 1024 * 1024;
export const uploadImage = async (file) => {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET)
    throw new Error(
      "Cloudinary cloud name or upload preset is missing in client .env",
    );
  if (!file) throw new Error("Please select an image.");
  if (!file.type.startsWith("image/"))
    throw new Error("Only image files are allowed.");
  if (file.size > MAX_ORIGINAL_FILE_SIZE)
    throw new Error("Image is too large. Please upload an image under 8 MB.");
  const compressedFile = await compressImage(file, 750, 0.5);
  const formData = new FormData();
  formData.append("file", compressedFile);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", "cookoff-dare-arena");
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  const response = await axios.post(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 120000,
  });
  return {
    success: true,
    imageUrl: response.data.secure_url,
    publicId: response.data.public_id,
  };
};

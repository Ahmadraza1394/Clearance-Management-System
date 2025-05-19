"use client";

/**
 * Utility functions for Cloudinary uploads and management
 * Using browser-friendly approach with Fetch API
 */

/**
 * Upload a file to Cloudinary using the unsigned upload API
 * @param {File} file - The file to upload
 * @param {string} folder - The folder to upload to in Cloudinary
 * @returns {Promise<Object>} - The upload result
 */
export const uploadToCloudinary = async (file, folder = "clearance_docs") => {
  try {
    // Create a FormData object for the upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'clearance_system');
    formData.append('folder', folder);

    // Upload to Cloudinary via the unsigned upload API
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dooi5scu5';
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to upload: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    return {
      url: data.secure_url,
      publicId: data.public_id,
      filename: file.name,
      fileType: file.type,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

/**
 * Delete a file from Cloudinary via our API route
 * @param {string} publicId - The public ID of the file to delete
 * @returns {Promise<Object>} - The deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    // Call our API route to handle the deletion securely
    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to delete: ${errorData.error || 'Unknown error'}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

import { NextResponse } from 'next/server';

/**
 * API route to delete a file from Cloudinary
 * This is a server-side route to keep API secrets secure
 */
export async function POST(request) {
  try {
    const { publicId } = await request.json();
    
    if (!publicId) {
      return NextResponse.json(
        { error: 'Public ID is required' },
        { status: 400 }
      );
    }

    // Get Cloudinary credentials from environment variables
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'Cloudinary configuration is missing' },
        { status: 500 }
      );
    }

    // Create timestamp for the signed request
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Create signature (this is a simple example - in production you might want to use a proper signature generation)
    const signature = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const encodedSignature = await generateSHA1(signature);
    
    // Create URL-encoded parameters for the API request
    const params = new URLSearchParams();
    params.append('public_id', publicId);
    params.append('timestamp', timestamp.toString());
    params.append('api_key', apiKey);
    params.append('signature', encodedSignature);
    
    // Make the API call to Cloudinary
    // Using 'auto' as resource_type to handle all file types (images, videos, documents, etc.)
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/destroy`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
      }
    );

    const result = await response.json();

    if (!response.ok || result.result !== 'ok') {
      return NextResponse.json(
        { error: 'Failed to delete file', details: result },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Generate SHA1 hash for Cloudinary API signature
 * @param {string} message - The message to hash
 * @returns {Promise<string>} - The hashed message
 */
async function generateSHA1(message) {
  // Use the Web Crypto API for hashing
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

# Cloudinary Setup Instructions

To enable file uploads to Cloudinary, you need to create a `.env.local` file in the root of your frontend directory with the following environment variables:

```
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

## Steps to Set Up Cloudinary:

1. **Create a Cloudinary Account**:
   - Go to [cloudinary.com](https://cloudinary.com/) and sign up for a free account

2. **Get Your Credentials**:
   - After signing up, navigate to your Cloudinary Dashboard
   - Copy your Cloud Name, API Key, and API Secret

3. **Create an Upload Preset**:
   - In your Cloudinary Dashboard, go to Settings > Upload
   - Scroll down to "Upload presets" and click "Add upload preset"
   - Set the signing mode to "Unsigned" for client-side uploads
   - Save the preset name

4. **Create the .env.local File**:
   - Create a file named `.env.local` in the root of your frontend directory
   - Add the environment variables as shown above, replacing the placeholders with your actual credentials
   - Save the file

5. **Restart Your Development Server**:
   - After creating the .env.local file, restart your Next.js development server to apply the changes

## Security Notes:

- The `CLOUDINARY_API_SECRET` is only used server-side and should never be exposed to the client
- The `.env.local` file is automatically excluded from Git by Next.js
- For production, make sure to set these environment variables in your hosting platform's configuration

# Cloudinary Setup Guide for Clearance Management System

## Overview
This guide will help you set up Cloudinary for file uploads in the Clearance Management System. Cloudinary is used to store and serve documents that students upload for their clearance process.

## Step 1: Create a Cloudinary Account
1. Go to [cloudinary.com](https://cloudinary.com/) and sign up for a free account
2. After signing up, you'll be taken to your dashboard

## Step 2: Get Your Cloudinary Credentials
From your Cloudinary dashboard, note down the following:
- **Cloud Name**: Found at the top of your dashboard
- **API Key**: Found in the "API Keys" section
- **API Secret**: Found in the "API Keys" section (keep this secure!)

## Step 3: Create an Upload Preset
1. In your Cloudinary dashboard, go to Settings > Upload
2. Scroll down to "Upload presets" and click "Add upload preset"
3. Set the following:
   - **Preset name**: Choose a name like "clearance_system"
   - **Signing Mode**: Set to "Unsigned" (for client-side uploads)
   - **Folder**: You can specify a default folder like "clearance_docs" (optional)
4. Save the preset

## Step 4: Create a .env.local File
Create a file named `.env.local` in the root of your project with the following content:

```
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

Replace the placeholders with your actual Cloudinary credentials.

## Step 5: Restart Your Development Server
After creating the `.env.local` file, restart your Next.js development server to apply the changes:

```
npm run dev
```

## Security Notes
- The `.env.local` file is automatically excluded from Git by Next.js
- Never expose your API Secret in client-side code
- For production deployment, set these environment variables in your hosting platform's configuration

## Testing Your Setup
1. Log in as a student
2. Navigate to the dashboard
3. Try uploading a document for any department
4. If successful, you should see the document appear in your Cloudinary dashboard

## Troubleshooting
If you encounter issues:
1. Check that your `.env.local` file contains the correct credentials
2. Ensure your upload preset is set to "Unsigned"
3. Check the browser console for any error messages
4. Verify your Cloudinary account has sufficient credits for uploads

# Student Clearance Management System

A comprehensive web application for managing student clearance processes in educational institutions. This system streamlines the clearance workflow, allowing administrators to track student clearance status across various departments and enabling students to monitor their clearance progress.

## Features

- **Admin Dashboard**: Manage students, track clearance status, and send notifications
- **Student Portal**: View clearance status, download certificates, and receive notifications
- **Real-time Notifications**: Professional center-screen notifications for important actions
- **Bulk Student Upload**: Import multiple student records via CSV
- **Clearance Certificate**: Generate and print clearance certificates for fully cleared students
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Project Structure

This repository contains both the frontend and backend code:

- **Frontend**: Built with Next.js and React
- **Backend**: RESTful API services

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup Instructions

1. Clone the repository
```
git clone https://github.com/yourusername/clearance-management-system.git
cd clearance-management-system
```

2. Install dependencies for frontend
```
cd frontend
npm install
```

3. Install dependencies for backend
```
cd ../backend
npm install
```

4. Create environment files
   - Create `.env.local` in the frontend directory
   - Create `.env` in the backend directory

5. Start the development servers

Frontend:
```
cd frontend
npm run dev
```

Backend:
```
cd backend
npm run dev
```

## Technologies Used

- **Frontend**:
  - Next.js
  - React
  - Tailwind CSS
  - React Context API

- **Backend**:
  - Node.js
  - Express
  - MongoDB

## Deployment

### Setting up GitHub Repository

1. Create a new repository on GitHub
2. Initialize Git and push your code:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin your-repository-url
git push -u origin main
```

### Environment Files

Make sure these files are in your `.gitignore` and NOT committed to GitHub:

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=your_backend_url
```

#### Backend (.env)
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

### Backend Deployment

1. Set up a MongoDB Atlas cluster
2. Deploy to your preferred hosting service (e.g., Heroku, DigitalOcean)
3. Set environment variables in your hosting platform
4. Update CORS configuration with your frontend URL

### Frontend Deployment

1. Build the application:
```bash
npm run build
```
2. Deploy to Vercel or your preferred hosting service
3. Set environment variables in your hosting platform
4. Update API URL to point to your deployed backend

## Important Notes

- Never commit `.env` files
- Keep `node_modules` directories out of Git
- Update API URLs in production environment
- Ensure proper CORS configuration

## License

This project is licensed under the MIT License - see the LICENSE file for details.

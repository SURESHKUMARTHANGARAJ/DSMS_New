# Setup Instructions

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or connection string)
- npm or yarn

## Installation Steps

1. **Install Dependencies**
   ```bash
   npm run install-all
   ```

2. **Configure Environment Variables**
   
   Create `backend/.env` file:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/driving-school
   JWT_SECRET=your_very_secure_jwt_secret_key_change_this_in_production
   NODE_ENV=development
   ```

3. **Start MongoDB**
   
   Make sure MongoDB is running:
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas connection string in .env
   ```

4. **Run the Application**
   
   ```bash
   # Run both backend and frontend together
   npm run dev
   
   # Or run separately:
   # Terminal 1 - Backend
   npm run server
   
   # Terminal 2 - Frontend
   npm run client
   ```

5. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## Initial Setup

1. **Create Admin User**
   
   Register a user with role "admin" through the registration page, or use MongoDB to create one:
   ```javascript
   // In MongoDB shell or Compass
   use driving-school
   db.users.insertOne({
     name: "Admin",
     email: "admin@drivingschool.com",
     password: "$2a$10$...", // bcrypt hash of password
     role: "admin",
     phone: "1234567890",
     isActive: true,
     createdAt: new Date(),
     updatedAt: new Date()
   })
   ```

2. **Create Test Users**
   
   - Register students through the registration page
   - Register instructors through the registration page
   - Then enroll students and create instructor profiles through admin panel

## File Uploads

The system stores uploaded files locally in:
- `backend/uploads/aadhar/` - Aadhar card documents
- `backend/uploads/pan/` - PAN card documents
- `backend/uploads/invoices/` - Generated invoice PDFs

Make sure these directories exist (they will be created automatically on first upload).

## Troubleshooting

1. **MongoDB Connection Error**
   - Check if MongoDB is running
   - Verify MONGODB_URI in .env file
   - Check MongoDB connection string format

2. **Port Already in Use**
   - Change PORT in backend/.env
   - Or kill the process using the port

3. **CORS Errors**
   - Ensure backend CORS is configured correctly
   - Check API_URL in frontend

4. **File Upload Errors**
   - Check file size (max 5MB)
   - Verify file types (images or PDFs)
   - Ensure upload directories have write permissions


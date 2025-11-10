# Driving School Management System

A comprehensive MERN stack application for managing a driving school with authentication, student enrollment, class scheduling, payment tracking, invoice generation, instructor management, attendance tracking, and reporting.

## Features

- **Authentication & Authorization**: Role-based access control (Admin, Instructor, Student)
- **Student Management**: Enrollment with Aadhar and PAN card document uploads
- **Class Management**: Create and manage driving classes
- **Schedule Management**: Individual scheduling for students
- **Payment Tracking**: Manual payment entry and tracking
- **Invoice Generation**: PDF invoice generation
- **Instructor Management**: CRUD operations for instructors
- **Attendance Tracking**: Student attendance and instructor login/logout time tracking
- **Reports**: Comprehensive reporting for students, instructors, financials, and attendance

## Technology Stack

- **Frontend**: React, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens
- **File Upload**: Multer (local storage)
- **PDF Generation**: PDFKit

## Project Structure

```
driving-school-system/
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth, upload, role check
│   ├── utils/          # Utility functions
│   └── server.js       # Express server
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── pages/      # Page components
│   │   ├── context/    # React context
│   │   └── utils/      # Utility functions
│   └── public/
└── package.json
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd driving-school-system
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   
   Create `backend/.env` file:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/driving-school
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**
   ```bash
   # Run both backend and frontend
   npm run dev
   
   # Or run separately
   npm run server  # Backend on port 5000
   npm run client  # Frontend on port 3000
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Enroll new student (with document uploads)
- `PUT /api/students/:id` - Update student

### Instructors
- `GET /api/instructors` - Get all instructors
- `GET /api/instructors/dashboard` - Get instructor dashboard
- `POST /api/instructors` - Create instructor
- `PUT /api/instructors/:id` - Update instructor

### Classes
- `GET /api/classes` - Get all classes
- `POST /api/classes` - Create class
- `PUT /api/classes/:id` - Update class

### Schedules
- `GET /api/schedules` - Get schedules (with filters)
- `POST /api/schedules` - Create schedule
- `PUT /api/schedules/:id` - Update schedule

### Payments
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Record payment

### Invoices
- `GET /api/invoices` - Get all invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/:id/download` - Download invoice PDF

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Mark attendance
- `POST /api/attendance/instructor/login` - Record instructor login
- `POST /api/attendance/instructor/logout` - Record instructor logout

### Reports
- `GET /api/reports/dashboard` - Dashboard summary
- `GET /api/reports/students` - Student reports
- `GET /api/reports/instructors` - Instructor reports
- `GET /api/reports/financial` - Financial reports
- `GET /api/reports/attendance` - Attendance reports

## Usage

1. **Register/Login**: Create an account with role (admin, instructor, or student)
2. **Admin Functions**:
   - Enroll students with document uploads
   - Manage instructors, classes, and schedules
   - Record payments and generate invoices
   - View comprehensive reports
3. **Instructor Functions**:
   - View assigned schedules
   - Mark student attendance
   - Record login/logout times
4. **Student Functions**:
   - View personal schedules
   - Check payment history
   - View attendance records

## File Uploads

Documents (Aadhar and PAN cards) are stored locally in:
- `backend/uploads/aadhar/`
- `backend/uploads/pan/`
- `backend/uploads/invoices/` (for generated PDFs)

## Notes

- All routes require authentication except `/api/auth/register` and `/api/auth/login`
- Role-based access control is enforced on both frontend and backend
- File uploads are limited to 5MB and accept images (jpeg, jpg, png) and PDFs
- Invoice PDFs are generated automatically when invoices are created

## License

ISC


# Content Management System (CMS)

## Project Overview

This project is a production-ready Content Management System (CMS) that enables authenticated administrators to manage website content dynamically through a secure admin panel. The application allows administrators to create, update, and delete content, with all changes reflected on the frontend without modifying the source code.

---

# Technologies Used

## Frontend
- Next.js
- React.js
- Redux Toolkit
- Tailwind CSS

## Backend
- Node.js
- Express.js

## Database
- MongoDB

## Authentication
- JSON Web Token (JWT)

## Version Control
- Git & GitHub

---

# Architecture Overview

The project follows a client-server architecture.

```
                Frontend (Next.js + React)
                         │
                  REST API Requests
                         │
                Backend (Express.js)
                         │
                  MongoDB Database
```

### Architecture Description

- The **Frontend** provides the user interface for administrators.
- The **Backend** exposes REST APIs and handles business logic.
- **JWT Authentication** secures all protected routes.
- **MongoDB** stores website content and user information.
- The frontend communicates with the backend using REST APIs for all CRUD operations.

---

# Features

- Secure Admin Login
- Dashboard
- Dynamic Content Management
- Create Content
- Update Content
- Delete Content
- Responsive User Interface
- Protected Routes using JWT

---

# Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/cms-project.git
```

### 2. Navigate to the Project Folder

```bash
cd cms-project
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
```

### 4. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 5. Configure Environment Variables

Create a `.env` file inside the backend folder using the values from `.env.example`.

Example:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 6. Start the Backend

```bash
cd backend
npm run dev
```

### 7. Start the Frontend

```bash
cd frontend
npm run dev
```

### 8. Open the Application

Open your browser and visit:

```
http://localhost:3000
```

(or the port displayed in your terminal.)

---

# Assumptions

- Only authenticated administrators can access the CMS.
- MongoDB is used as the primary database.
- JWT is used for secure authentication and authorization.
- The frontend communicates with the backend through REST APIs.
- Internet connectivity is required when using MongoDB Atlas.

---

# Environment Variables

Create a `.env` file in the backend directory.

Example:

```env
PORT=5000
MONGODB_URI=
JWT_SECRET=
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

# Sample Credentials

Email:
```
admin@example.com
```

Password:
```
Admin@123
```

*(Replace these with your actual credentials if they are different.)*

---

# Project Structure

```
cms-project/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── redux/
│   └── public/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
│
├── README.md
├── .env.example
└── package.json
```

---

# Future Enhancements

- Role-Based Access Control
- Image Upload Support
- Content Version History
- Dashboard Analytics
- Search and Filtering
- Cloud Deployment

# Content Management System (CMS)

## Project Overview

This project is a production-ready Content Management System (CMS) that allows authenticated administrators to manage website content dynamically through a secure admin panel. The frontend displays content fetched from the backend, enabling real-time updates without modifying the source code.

---

## Technology Choices

### Frontend
- Next.js
- React.js
- Redux Toolkit
- Tailwind CSS

### Backend
- Node.js
- Express.js

### Database
- MongoDB

### Authentication
- JSON Web Token (JWT)

### Other Tools
- Docker (if used)
- Git & GitHub

---

## Architecture Overview

The application follows a client-server architecture.

Frontend (Next.js + React)
        │
     REST API
        │
Backend (Express.js)
        │
    MongoDB Database

The frontend communicates with the backend through REST APIs. JWT is used for secure authentication, while MongoDB stores all website content. Redux Toolkit manages the frontend state efficiently.

---

## Features

- Secure Admin Login
- Dashboard
- Dynamic Content Management
- Create Content
- Update Content
- Delete Content
- Responsive UI
- Protected Routes

---

## Setup Instructions

### Clone the repository

git clone <YOUR_GITHUB_REPOSITORY_LINK>

### Install Backend

cd backend

npm install

### Install Frontend

cd ../frontend

npm install

---

## Environment Variables

Create a `.env` file inside the backend folder.

Example:

PORT=5000

MONGODB_URI=your_mongodb_connection

JWT_SECRET=your_secret_key

---

## How to Run the Project

### Backend

cd backend

npm run dev

### Frontend

cd frontend

npm run dev

Open the browser and visit:

http://localhost:3000

(or the port displayed by your application)

---

## Assumptions

- Only administrators can access the CMS.
- JWT is used for authentication.
- MongoDB stores all content.
- Internet connection is required for database access.
- The project uses REST APIs.

---

## Sample Credentials

Email:
admin@example.com

Password:
Admin@123

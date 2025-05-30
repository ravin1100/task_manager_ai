# Task Manager Application

A full-stack task management application built with React, TypeScript, Node.js, and PostgreSQL. This application helps users manage their tasks with features like task creation, status tracking, priority management, and more.

## 🚀 Features

- **Task Management**: Create, read, update, and delete tasks
- **Task Types**: Support for both manual and transcript-based tasks
- **Status Tracking**: Track tasks with statuses (To Do, In Progress, Done)
- **Priority Levels**: Set priority levels (P1-P4) for tasks
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Mode**: Toggle between themes for better readability
- **Dashboard**: Visualize task statistics and completion rates

## 📸 Project Snapshots

### Home
![Home](/frontend/assets/homepage.png)

### Dashboard
![Dashboard](/frontend/assets/dashboard.png)

### Tasks List
![Tasks List](/frontend/assets/tasks.png)

### Create Task
![Create Task](/frontend/assets/create_task.png)

### Process Transcript
![Transcript Task](/frontend/assets/process_transcript.png)

### Light Mode
![ Mode](/frontend/assets/dashboard.png)

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- Vite (Build Tool)
- Tailwind CSS (Styling)
- React Icons
- React Router (Navigation)
- Axios (HTTP Client)
- Recharts (Data Visualization)

### Backend
- Node.js with TypeScript
- Express.js (Web Framework)
- PostgreSQL (Database)
- TypeORM (ORM)
- Google Gemini API (NLP for transcript processing)

## 📁 Project Structure

```
task-manager/
├── backend/                  # Backend server
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/      # Route controllers
│   │   ├── middleware/       # Custom middleware
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── utils/            # Utility functions
│   │   ├── app.ts            # Express app setup
│   │   └── server.ts         # Server entry point
│   ├── .env                  # Environment variables
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                # Frontend React app
│   ├── public/              # Static files
│   ├── src/
│   │   ├── assets/        # Images, fonts, etc.
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── styles/         # Global styles
│   │   ├── types/          # TypeScript type definitions
│   │   ├── App.tsx         # Main App component
│   │   └── main.tsx        # Entry point
│   ├── .env
│   ├── index.html
│   ├── package.json
│   └── tsconfig.json
│
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL (v12 or higher)
- Google Cloud Account (for Gemini API key)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/task-manager.git
   cd task-manager
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Update .env with your database credentials and API keys
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   # Update .env with your backend API URL
   ```

4. **Database Setup**
   - Create a new PostgreSQL database
   - Update the database connection string in `backend/.env`
   - Run migrations:
     ```bash
     cd ../backend
     npm run migration:run
     ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```

## 🔧 Environment Variables

### Backend (`.env`)
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/taskmanager
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend (`.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## 🧪 Running Tests

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd ../frontend
npm test
```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



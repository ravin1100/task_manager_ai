# Task Manager Backend API

A RESTful API for a Natural Language Task Manager built with Node.js, Express, TypeScript, and PostgreSQL.

## Features

- Create tasks using natural language (e.g., "Finish landing page by tomorrow 5pm")
- CRUD operations for tasks
- Task assignment and due date management
- Priority levels (P1-P4)
- RESTful API design

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task-manager/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   NODE_ENV=development
   
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=task_manager
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```

4. **Create the database**
   ```bash
   npm run db:create
   ```
   
   Or create it manually in PostgreSQL:
   ```sql
   CREATE DATABASE task_manager;
   ```

5. **Run migrations**
   The database tables will be created automatically when the application starts.

## Running the Application

- **Development mode**
  ```bash
  npm run dev
  ```
  The server will start at `http://localhost:5000`

- **Production mode**
  ```bash
  npm run build
  npm start
  ```

## API Endpoints

### Tasks

- `POST /api/tasks` - Create a new task using natural language
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get a single task by ID
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

#### Example Request (Create Task)

```http
POST /api/tasks
Content-Type: application/json

{
  "text": "Finish landing page by tomorrow 5pm P1"
}
```

## Natural Language Processing

The API can parse natural language to extract task details:

- Task name: The main description of the task
- Assignee: Extracted after words like "to", "for", or "assign to"
- Due date: Parsed from natural language dates
- Priority: P1 (highest) to P4 (lowest, default)

### Examples

- "Call John tomorrow at 3pm"
- "Submit report to Sarah by Friday EOD P1"
- "Review PR #123 for Jane"

## Testing

To run tests:

```bash
npm test
```

## Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Set the `NODE_ENV` to `production` in your production environment.

3. Start the server:
   ```bash
   npm start
   ```

## Environment Variables

- `PORT` - Port to run the server (default: 5000)
- `NODE_ENV` - Environment (development, production, test)
- `DB_*` - Database connection settings

## License

MIT

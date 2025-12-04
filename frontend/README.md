# VoiceNote - Voice-Enabled Task Tracker

A modern task management application inspired by Linear, with intelligent voice input that allows users to create tasks by speaking naturally. The application parses spoken input to extract task details such as title, description, due date, priority, and status.

## Features

### Core Features
- **Task Management**: Create, read, update, and delete tasks
- **Dual View Modes**: 
  - Kanban board with drag-and-drop functionality
  - List view for detailed task browsing
- **Voice Input**: Create tasks by speaking naturally
- **Intelligent Parsing**: Automatically extracts:
  - Task title
  - Due dates (relative and absolute)
  - Priority levels
  - Status
- **Filtering & Search**: Filter by status, priority, due date, and search by title/description
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Redux Toolkit** - State management
- **Tailwind CSS** - Styling
- **React Beautiful DnD** - Drag and drop for Kanban board
- **Date-fns** - Date formatting
- **Web Speech API** - Browser-native speech recognition
- **Axios** - HTTP client
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB (Mongoose)** - Database
- **Zod** - Schema validation
- **Chrono-node** - Natural language date parsing
- **CORS** - Cross-origin resource sharing

## Prerequisites

- **Node.js** v18 or higher
- **npm** or **yarn**
- **MongoDB** - MongoDB server (local or cloud instance like MongoDB Atlas)
- Modern browser with Web Speech API support (Chrome, Edge, Safari)
- Microphone access for voice input

## Project Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd voicenote
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/voicenote
```

**Note:** For MongoDB Atlas (cloud), use:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/voicenote
```

### 3. Frontend Setup

```bash
cd ../voicenote
npm install
```

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=VoiceNote
```

### 4. Run the Application

#### Start Backend Server

```bash
cd backend
npm run dev
```

The backend server will run on `http://localhost:3001`

#### Start Frontend Development Server

In a new terminal:

```bash
cd voicenote
npm run dev
```

The frontend will run on `http://localhost:5173` (or the next available port)

### 5. Access the Application

Open your browser and navigate to `http://localhost:5173`

## API Documentation

### Base URL
```
http://localhost:3001/api
```

### Endpoints

#### Tasks

##### GET /api/tasks
Get all tasks with optional filters.

**Query Parameters:**
- `status` (optional): Filter by status (`To Do`, `In Progress`, `Done`)
- `priority` (optional): Filter by priority (`Low`, `Medium`, `High`, `Critical`)
- `search` (optional): Search in title and description
- `dueDate` (optional): Filter by due date (YYYY-MM-DD format)

**Example Request:**
```bash
GET /api/tasks?status=To Do&priority=High
```

**Example Response:**
```json
[
  {
    "id": 1,
    "title": "Review pull request",
    "description": "Review the authentication module PR",
    "status": "To Do",
    "priority": "High",
    "dueDate": "2024-01-15T18:00:00.000Z",
    "createdAt": "2024-01-14T10:00:00.000Z",
    "updatedAt": "2024-01-14T10:00:00.000Z"
  }
]
```

##### GET /api/tasks/:id
Get a single task by ID.

**Example Response:**
```json
{
  "id": 1,
  "title": "Review pull request",
  "description": "Review the authentication module PR",
  "status": "To Do",
  "priority": "High",
  "dueDate": "2024-01-15T18:00:00.000Z",
  "createdAt": "2024-01-14T10:00:00.000Z",
  "updatedAt": "2024-01-14T10:00:00.000Z"
}
```

##### POST /api/tasks
Create a new task.

**Request Body:**
```json
{
  "title": "Review pull request",
  "description": "Review the authentication module PR",
  "status": "To Do",
  "priority": "High",
  "dueDate": "2024-01-15T18:00:00.000Z"
}
```

**Response:** Created task object (same structure as GET response)

##### PUT /api/tasks/:id
Update an existing task.

**Request Body:** (all fields optional)
```json
{
  "title": "Updated title",
  "status": "In Progress",
  "priority": "Critical"
}
```

**Response:** Updated task object

##### DELETE /api/tasks/:id
Delete a task.

**Response:**
```json
{
  "message": "Task deleted successfully"
}
```

#### Voice Parsing

##### POST /api/parse
Parse voice input transcript to extract task details.

**Request Body:**
```json
{
  "transcript": "Create a high priority task to review the pull request for the authentication module by tomorrow evening"
}
```

**Example Response:**
```json
{
  "title": "Review the pull request for the authentication module",
  "description": null,
  "status": "To Do",
  "priority": "High",
  "dueDate": "2024-01-15T18:00:00.000Z",
  "transcript": "Create a high priority task to review the pull request for the authentication module by tomorrow evening"
}
```

### Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message",
  "message": "Detailed error message",
  "details": [] // For validation errors
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

## Decisions & Assumptions

### Design Decisions

1. **Database Choice**: MongoDB was chosen for its flexibility and scalability. It's perfect for a single-user application and can easily scale to support multi-user features in the future.

2. **State Management**: Redux Toolkit was used for centralized state management, making it easier to handle complex state updates and API calls.

3. **Voice Recognition**: Web Speech API was chosen over third-party services to avoid API keys and costs. It works natively in modern browsers.

4. **Date Parsing**: Chrono-node library handles natural language date parsing, with custom fallback logic for edge cases like "tomorrow evening".

5. **Drag and Drop**: React Beautiful DnD provides smooth drag-and-drop functionality for the Kanban board.

6. **Styling**: Tailwind CSS was chosen for rapid UI development and consistent design system.

### Assumptions

1. **Single User**: The application is designed for single-user use. No authentication or multi-user support.

2. **Browser Support**: Voice input requires modern browsers (Chrome, Edge, Safari) with Web Speech API support.

3. **Date Formats**: The parser handles common date formats but may not catch all variations. Users can always edit parsed dates manually.

4. **Priority Detection**: Priority is extracted based on keywords. If not detected, defaults to "Medium".

5. **Status Default**: Voice-created tasks default to "To Do" unless explicitly mentioned.

6. **Time Handling**: When parsing "tomorrow evening", the system sets the time to 6:00 PM. Users can adjust this in the form.

## AI Tools Usage

### Tools Used
- **Cursor AI** - Primary development assistant
- **GitHub Copilot** - Code suggestions and completions

### What They Helped With

1. **Boilerplate Code**: Generated initial project structure, API routes, and Redux setup
2. **Component Architecture**: Suggested component structure and state management patterns
3. **Voice Parsing Logic**: Helped design the natural language parsing algorithm
4. **Error Handling**: Assisted with comprehensive error handling patterns
5. **TypeScript Types**: Generated type definitions for better type safety
6. **Styling**: Suggested Tailwind CSS class combinations for modern UI

### Notable Approaches

1. **Voice Parser**: Used a combination of regex patterns and the Chrono library for robust date parsing
2. **Component Design**: Modular components with clear separation of concerns
3. **Error Boundaries**: Implemented error handling at both API and component levels
4. **Responsive Design**: Mobile-first approach with Tailwind's responsive utilities

### Learnings

1. **Web Speech API Limitations**: The API works best in Chrome/Edge. Safari has limited support.
2. **Date Parsing Complexity**: Natural language date parsing requires handling many edge cases
3. **State Management**: Redux Toolkit's async thunks simplify API call management significantly
4. **Drag and Drop**: React Beautiful DnD requires careful state management to avoid conflicts

## Project Structure

```
voicenote/
├── backend/
│   ├── db/
│   │   └── database.js          # Database initialization
│   ├── routes/
│   │   ├── tasks.js             # Task CRUD endpoints
│   │   └── parse.js             # Voice parsing endpoint
│   ├── utils/
│   │   └── voiceParser.js       # Natural language parsing logic
│   ├── server.js                # Express server setup
│   ├── package.json
│   └── .env.example
├── src/
│   ├── components/
│   │   ├── VoiceInput.tsx       # Voice recording component
│   │   ├── TaskCard.tsx         # Individual task card
│   │   ├── KanbanBoard.tsx      # Kanban board view
│   │   ├── TaskList.tsx         # List view
│   │   ├── TaskForm.tsx         # Create/edit task form
│   │   └── FilterBar.tsx        # Filter and search UI
│   ├── store/
│   │   ├── store.ts             # Redux store configuration
│   │   └── taskSlice.ts         # Task state management
│   ├── services/
│   │   └── api.ts               # API client
│   ├── types/
│   │   └── task.ts              # TypeScript type definitions
│   ├── hooks/
│   │   └── redux.ts             # Typed Redux hooks
│   ├── App.tsx                  # Main app component
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles
├── package.json
├── vite.config.ts
└── README.md
```

## Development

### Running in Development Mode

Backend:
```bash
cd backend
npm run dev  # Uses node --watch for auto-reload
```

Frontend:
```bash
npm run dev  # Vite dev server with HMR
```

### Building for Production

Frontend:
```bash
npm run build
npm run preview  # Preview production build
```

Backend:
```bash
cd backend
npm start
```

## Troubleshooting

### Voice Input Not Working
- Ensure you're using a supported browser (Chrome, Edge, Safari)
- Check microphone permissions in browser settings
- Try refreshing the page and allowing microphone access

### API Connection Issues
- Verify backend server is running on port 3001
- Check CORS settings if accessing from different origin
- Verify `.env` file has correct API URL

### Database Issues
- Ensure MongoDB is running (local or cloud instance)
- Verify `MONGODB_URI` in `.env` file is correct
- Check MongoDB connection logs in the backend console
- For local MongoDB, ensure the service is running: `mongod` or via MongoDB service

## Future Enhancements

- User authentication and multi-user support
- Real-time collaboration with WebSockets
- Task assignments and team management
- Project/workspace organization
- Mobile app (React Native)
- Offline support with service workers
- Advanced voice commands (e.g., "Mark task 5 as done")
- Integration with calendar apps
- Task templates
- Recurring tasks

## License

This project is created as an assignment submission.

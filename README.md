# TradingBot Website

## Project Structure 
frontend/
├── index.html
├── css/
│ └── styles.css
├── js/
│ └── main.js
└── images/
└── .jpg
backend/
├── server.js
├── package.json
└── .gitignore

## Local Development Setup

### Prerequisites
- Node.js installed
- Git installed
- Basic terminal knowledge

### Backend Setup
bash
Clone the repository
git clone <your-repo-url>
Navigate to backend folder
cd backend
Install dependencies
npm install express sqlite3 cors
Start the server
node server.js

Server will run on http://localhost:3000

### Frontend Setup

bash
In a new terminal
cd frontend
Using Python (if installed)
python -m http.server 8080
OR using Node http-server
npm install -g http-server
http-server


Frontend will be available at http://localhost:8080

### Testing Locally
1. Start both servers (backend and frontend)
2. Open browser to http://localhost:8080
3. Fill in an email and submit
4. Check terminal for backend logs
5. Database file (waitlist.db) will be created automatically

## Database
- Using SQLite for simplicity
- Database file: `waitlist.db`
- Table structure:
  - id (auto-increment)
  - email (unique)
  - signup_date (automatic timestamp)

## Development Notes
- Backend API endpoint: `/api/waitlist`
- Duplicate emails are prevented
- All dates are in UTC

## Deployment
Instructions for deployment coming soon...
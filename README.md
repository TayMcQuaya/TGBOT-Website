# Trading Bot Waitlist System

A complete waitlist system with frontend form and backend management.

## Quick Start

1. **Start the Backend:**
   ```bash
   cd server
   npm install
   node server.js
   ```

2. **Open Frontend:**
   - Open `index.html` in your browser
   - Or use a local server (e.g., Live Server in VS Code)

## Project Structure
```
frontend/
├── index.html          # Waitlist signup page
├── css/
│   └── styles.css      # Styling
└── js/
    └── main.js         # Frontend logic

server/
├── server.js           # Main server file
├── manage-waitlist.js  # Admin management tool
├── .env               # Configuration
└── WAITLIST-MANAGEMENT.md  # Detailed management guide
```

## Environment Setup

1. **Create `.env` file in server folder:**
   ```env
   PORT=3000
NODE_ENV=development # Change to 'production' when deploying

# Rate Limiting
RATE_LIMIT_WINDOW=60000  # 1 minute in milliseconds
MAX_REQUESTS_PER_WINDOW=5

# Database Configuration
DB_NAME=waitlist.db
BACKUP_RETENTION_DAYS=7

# Backup Configuration
BACKUP_DIRECTORY=backups
EXPORT_DIRECTORY=exports
MAX_EXPORT_BACKUPS=5

# API Configuration (for frontend)
LOCAL_API_URL=http://localhost:3000/api/waitlist
PRODUCTION_API_URL=https://your-digitalocean-url.com/api/waitlist 
   ```

2. **For Production:**
   - Update `NODE_ENV=production`
   - Set proper `PRODUCTION_API_URL` in `js/main.js`

## Managing Waitlist

View entries:
```bash
cd server
node manage-waitlist.js view
```

Export to Excel:
```bash
node manage-waitlist.js export
```

Delete entry:
```bash
node manage-waitlist.js delete-email user@example.com
# or
node manage-waitlist.js delete-id 1
```

## Features

- 📝 Email collection form
- 🎨 Beautiful notifications
- 📊 Excel/CSV exports
- 🔒 Rate limiting
- 💾 Automatic backups
- 📈 Statistics endpoint

## API Endpoints

- `POST /api/waitlist`: Submit email
- `GET /health`: Server status
- `GET /api/stats`: View total signups

## Deployment Steps

1. **Frontend:**
   - Host `index.html` and assets on any static host
   - Update API URL in `js/main.js`

2. **Backend (DigitalOcean):**
   ```bash
   git clone your-repo
   cd server
   npm install
   # Set up .env for production
   pm2 start server.js
   ```

## Database Management

- SQLite database: `waitlist.db`
- Daily backups in `backups/` folder
- Excel exports in `exports/` folder
- Latest export: `waitlist-current.xlsx`

## Monitoring

- Check server health: `/health`
- View statistics: `/api/stats`
- Logs include request duration and environment

## Rate Limiting

- 5 requests per minute per IP
- Configurable in `.env`
- Prevents form spam

## Backup System

- Automatic daily database backups
- Keeps last 7 backups
- Excel exports maintain last 5 versions

## Common Tasks

1. **Check Total Signups:**
   ```bash
   curl http://localhost:3000/api/stats
   ```

2. **Manual Backup:**
   ```bash
   # Database backup happens automatically daily
   # For Excel export:
   node manage-waitlist.js export
   ```

3. **View Recent Entries:**
   ```bash
   node manage-waitlist.js view
   ```

## Troubleshooting

1. **Server won't start:**
   - Check if port 3000 is free
     ```bash
     # Check what's using port 3000
     netstat -ano | findstr :3000
     
     # Kill the process (replace PID with number from above)
     taskkill /F /PID <PID>
     ```
   - Ensure all dependencies are installed
   - Verify `.env` file exists

2. **Can't submit emails:**
   - Check server is running
   - Verify API URL in `main.js`
   - Check browser console for errors

3. **Export not working:**
   - Ensure `exports` directory exists
   - Check file permissions
   - Verify database connection

## Support

For detailed waitlist management instructions, see `WAITLIST-MANAGEMENT.md`
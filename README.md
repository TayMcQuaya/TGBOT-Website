# Trading Bot Waitlist System

A complete waitlist system with frontend form and backend management.

## Development Setup

1. **Start the Backend:**
   ```bash
   cd server
   npm install
   node server.js
   ```
   Backend will run on port 3000.

2. **Start the Frontend:**
   - Use VS Code Live Server or any static server on port 8000
   - Or serve the root directory on port 8000

3. **Local Testing:**
   - Desktop: Open `http://localhost:8000`
   - Mobile: Open `http://YOUR_COMPUTER_IP:8000` (same network required)

## Production Setup

1. **Backend (DigitalOcean):**
   ```bash
   # On your DigitalOcean droplet
   git clone your-repo
   cd server
   npm install
   
   # Create production env file
   cp .env.example .env.production
   
   # Edit .env.production with your values:
   # - Set NODE_ENV=production
   # - Set CORS_ALLOWED_ORIGIN to your frontend domain
   # - Generate and set a secure API_KEY
   
   # Start with PM2
   npm install -g pm2
   pm2 start server.js --name waitlist-api
   ```

2. **Frontend Setup:**
   - Edit `js/main.js`:
     ```javascript
     // Update the production API URL
     production: 'https://your-digitalocean-ip:3000/api/waitlist'
     // or if you have a domain:
     production: 'https://api.your-domain.com/api/waitlist'
     ```
   - Deploy the frontend files to your hosting (Netlify, Vercel, etc.)

3. **Domain & SSL:**
   - Point your domain to your DigitalOcean IP
   - Set up SSL certificates (recommended: Let's Encrypt)
   - Update CORS settings in `.env.production`

## Environment Files

1. **Development (.env.development):**
   ```env
   PORT=3000
   NODE_ENV=development
   CORS_ALLOWED_ORIGIN=*
   API_KEY=dev_key_123
   ```

2. **Production (.env.production):**
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=production

   # Rate Limiting
   RATE_LIMIT_WINDOW=60000  # 1 minute in milliseconds
   MAX_REQUESTS_PER_WINDOW=5  # Strict limit for production

   # Database Configuration
   DB_NAME=waitlist.db
   BACKUP_RETENTION_DAYS=7

   # Security
   CORS_ALLOWED_ORIGIN=https://your-frontend-domain.com  # ⚠️ Update this with your actual frontend domain!
   API_KEY=generate_a_secure_key_here  # ⚠️ Generate a secure key (at least 32 characters)

   # Backup Configuration
   BACKUP_DIRECTORY=backups
   EXPORT_DIRECTORY=exports
   MAX_EXPORT_BACKUPS=5

   # ⚠️ Important Production Setup Steps:
   # 1. Update CORS_ALLOWED_ORIGIN with your actual frontend domain
   # 2. Generate a secure API key (use a password generator)
   # 3. Ensure all directories have proper write permissions
   # 4. Set up SSL certificate for your domain
   # 5. Configure firewall to allow only port 3000 
   ```

## Database Management

The system uses separate databases for development and production:

- Development: `server/dev_data/waitlist_dev.db`
- Production: `server/prod_data/waitlist.db`

**Management Commands:**
```bash
# View entries (development)
node manage-waitlist.js dev view

# View entries (production)
node manage-waitlist.js prod view

# Export to Excel
node manage-waitlist.js dev export  # Development
node manage-waitlist.js prod export # Production

# Delete entry
node manage-waitlist.js dev delete-email user@example.com
node manage-waitlist.js prod delete-email user@example.com
```

## Security Features

1. **Rate Limiting:**
   - Development: Disabled
   - Production: 5 requests per minute per IP

2. **CORS Protection:**
   - Development: Allows all local IPs
   - Production: Only allows specified domain

3. **API Key Protection:**
   - Development: Not enforced
   - Production: Required for admin endpoints

## Monitoring

1. **Health Check:**
   ```bash
   curl https://your-api-domain.com/health
   ```

2. **Statistics:**
   ```bash
   curl -H "x-api-key: your_api_key" https://your-api-domain.com/api/stats
   ```

## Backup System

- Automatic daily backups in `server/backups/`
- Keeps last 7 days in production
- Export to Excel available via management script

## Troubleshooting

1. **CORS Errors:**
   - Check `CORS_ALLOWED_ORIGIN` in `.env.production`
   - Verify frontend domain matches exactly

2. **Connection Issues:**
   - Verify firewall settings (port 3000)
   - Check SSL certificate validity
   - Verify API URL in frontend code

3. **Database Issues:**
   - Check write permissions in data directories
   - Verify backup directory exists
   - Check available disk space

## Support

For detailed management instructions, see `WAITLIST-MANAGEMENT.md`
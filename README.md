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

## Production Environment

### Quick Reference
- Frontend URL: https://tradebychat.xyz
- Backend API: https://api.tradebychat.xyz
- Server IP: 167.99.149.113

### Server Access and Management

#### SSH Access
```bash
# Connect to DigitalOcean server
ssh root@yourdropletIP
```

#### Application Status and Logs
```bash
# Check backend status
pm2 status
pm2 logs waitlist-api    # View backend logs

# Check Nginx status
systemctl status nginx
nginx -t                 # Test Nginx configuration

# Check SSL certificate
certbot certificates
```

#### Update Application
```bash
# Navigate to application directory
cd /var/www/waitlist-app

# Update from GitHub
git pull origin main

# Restart backend after updates
cd server
npm install              # If dependencies changed
pm2 restart waitlist-api # Restart the application
```

### Database Management

#### View and Export Data
```bash
# Navigate to server directory
cd /var/www/waitlist-app/server

# View all entries
node manage-waitlist.js prod view

# Export to Excel
node manage-waitlist.js prod export

# Search specific email
node manage-waitlist.js prod search user@example.com

# Delete entry
node manage-waitlist.js prod delete-email user@example.com
```

#### Backup Database
```bash
# Manual backup
cd /var/www/waitlist-app/server
cp prod_data/waitlist.db backups/waitlist-$(date +%Y%m%d).db

# View backups
ls -l backups/
```

### Configuration Files

#### Important Locations
```bash
# Nginx configuration
nano /etc/nginx/sites-available/waitlist

# Environment file
nano /var/www/waitlist-app/server/.env.production

# Frontend configuration
nano /var/www/waitlist-app/js/config.js
```

### Monitoring and Debugging

#### View Logs
```bash
# Application logs
pm2 logs waitlist-api

# Nginx error logs
tail -f /var/log/nginx/error.log

# System logs
journalctl -u nginx    # Nginx logs
journalctl -u pm2-root # PM2 logs
```

#### Server Resources
```bash
# View resource usage
top

# View disk space
df -h

# View memory usage
free -m
```

### Common Issues and Solutions

#### If Backend Won't Start
1. Check logs: `pm2 logs waitlist-api`
2. Verify environment: `cat .env.production`
3. Check Node version: `node -v`
4. Restart PM2: `pm2 restart waitlist-api`

#### If Frontend Can't Connect
1. Check CORS settings in `.env.production`
2. Verify Nginx config: `nginx -t`
3. Check SSL: `certbot certificates`
4. Verify DNS: `dig api.tradebychat.xyz`

#### If Database Issues
1. Check permissions: `ls -l prod_data/`
2. Verify path in `.env.production`
3. Try backup: `cp prod_data/waitlist.db prod_data/waitlist.db.backup`

### Maintenance Schedule

#### Daily
- Check `pm2 status`
- Monitor disk space: `df -h`
- Review error logs: `pm2 logs waitlist-api --error`

#### Weekly
- Export database: `node manage-waitlist.js prod export`
- Check for updates: `apt update`
- Review backups: `ls -l backups/`

#### Monthly
- Update packages: `apt upgrade -y`
- Clean old exports: `find exports/ -mtime +30 -delete`
- Review SSL certificates: `certbot certificates`

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

Upload the server.js file to the server.
scp server/server.js root@167.99.149.113:/var/www/waitlist-app/server/server.js